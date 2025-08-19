const db = require('../db');
const telegram = require('../utils/telegram');

const tasksController = {
    // Получение списка задач
    async getTasks(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            let query;
            const values = [req.user.company_id];

            if (req.user.role === 'manager') {
                // Менеджеры видят все задачи компании
                query = `
                    SELECT t.*, 
                           u.full_name as assigned_to_name,
                           u.username as assigned_to_username,
                           u.email as assigned_to_email,
                           c.full_name as created_by_name
                    FROM tasks t
                    LEFT JOIN users u ON t.assigned_to = u.id
                    LEFT JOIN users c ON t.created_by = c.id
                    WHERE t.company_id = $1
                    ORDER BY t.created_at DESC
                `;
            } else {
                // Сотрудники видят только свои задачи
                query = `
                    SELECT t.*, 
                           u.full_name as assigned_to_name,
                           u.username as assigned_to_username,
                           u.email as assigned_to_email,
                           c.full_name as created_by_name
                    FROM tasks t
                    LEFT JOIN users u ON t.assigned_to = u.id
                    LEFT JOIN users c ON t.created_by = c.id
                    WHERE t.company_id = $1 AND t.assigned_to = $2
                    ORDER BY t.created_at DESC
                `;
                values.push(req.user.id);
            }

            const { rows } = await db.query(query, values);
            res.json(rows);
        } catch (error) {
            console.error('Error getting tasks:', error);
            res.status(500).json({ message: 'Ошибка при получении задач' });
        }
    },

    // Получение назначенных и свободных задач для Telegram Mini App
    async getTasksForMiniApp(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            // Получаем назначенные задачи (статус assigned, accepted или in-progress)
            const assignedQuery = `
                SELECT t.*, 
                       u.full_name as assigned_to_name,
                       u.username as assigned_to_username,
                       u.email as assigned_to_email,
                       c.full_name as created_by_name,
                       comp.name as company_name,
                       comp.address as company_address
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN users c ON t.created_by = c.id
                LEFT JOIN companies comp ON t.company_id = comp.id
                WHERE t.company_id = $1 AND t.assigned_to = $2 AND t.status IN ('assigned', 'accepted', 'in-progress')
                ORDER BY t.created_at DESC
            `;

            // Получаем свободные задачи (статус not-assigned)
            const freeQuery = `
                SELECT t.*, 
                       u.full_name as assigned_to_name,
                       u.username as assigned_to_username,
                       u.email as assigned_to_email,
                       c.full_name as created_by_name,
                       comp.name as company_name,
                       comp.address as company_address
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN users c ON t.created_by = c.id
                LEFT JOIN companies comp ON t.company_id = comp.id
                WHERE t.company_id = $1 AND t.status = 'not-assigned'
                ORDER BY t.created_at DESC
            `;

            const [assignedResult, freeResult] = await Promise.all([
                db.query(assignedQuery, [req.user.company_id, req.user.id]),
                db.query(freeQuery, [req.user.company_id])
            ]);

            res.json({
                assigned: assignedResult.rows,
                free: freeResult.rows
            });
        } catch (error) {
            console.error('Error getting tasks for mini app:', error);
            res.status(500).json({ message: 'Ошибка при получении задач' });
        }
    },

    // Принятие задачи (для назначенных задач - меняем статус на accepted)
    async acceptAssignedTask(req, res) {
        try {
            const { id } = req.params;

            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            // Проверяем, что задача назначена текущему пользователю и имеет статус assigned
            const checkQuery = `
                SELECT * FROM tasks 
                WHERE id = $1 AND company_id = $2 AND assigned_to = $3 AND status = 'assigned'
            `;
            
            const checkResult = await db.query(checkQuery, [id, req.user.company_id, req.user.id]);
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена или недоступна для принятия' });
            }

            // Обновляем статус на accepted
            const updateQuery = `
                UPDATE tasks 
                SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *, 
                    (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                    (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                    (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                    (SELECT full_name FROM users WHERE id = created_by) as created_by_name
            `;

            const { rows } = await db.query(updateQuery, [id]);
            res.json(rows[0]);
        } catch (error) {
            console.error('Error accepting assigned task:', error);
            res.status(500).json({ message: 'Ошибка при принятии задачи' });
        }
    },

    // Взятие свободной задачи (назначаем пользователю и меняем статус на accepted)
    async takeFreeTask(req, res) {
        try {
            const { id } = req.params;

            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            // Проверяем, что задача свободна и имеет статус not-assigned
            const checkQuery = `
                SELECT * FROM tasks 
                WHERE id = $1 AND company_id = $2 AND status = 'not-assigned'
            `;
            
            const checkResult = await db.query(checkQuery, [id, req.user.company_id]);
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена или уже взята другим сотрудником' });
            }

            // Назначаем задачу пользователю и меняем статус на accepted
            const updateQuery = `
                UPDATE tasks 
                SET assigned_to = $1, status = 'accepted', updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND status = 'not-assigned'
                RETURNING *, 
                    (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                    (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                    (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                    (SELECT full_name FROM users WHERE id = created_by) as created_by_name
            `;

            const { rows } = await db.query(updateQuery, [req.user.id, id]);
            
            if (rows.length === 0) {
                return res.status(409).json({ message: 'Задача уже взята другим сотрудником' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error taking free task:', error);
            res.status(500).json({ message: 'Ошибка при взятии задачи' });
        }
    },

    // Получение задачи по ID
    async getTaskById(req, res) {
        try {
            const { id } = req.params;

            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            let query;
            const values = [id, req.user.company_id];

            if (req.user.role === 'manager') {
                query = `
                    SELECT t.*, 
                           u.full_name as assigned_to_name,
                           u.username as assigned_to_username,
                           u.email as assigned_to_email,
                           c.full_name as created_by_name
                    FROM tasks t
                    LEFT JOIN users u ON t.assigned_to = u.id
                    LEFT JOIN users c ON t.created_by = c.id
                    WHERE t.id = $1 AND t.company_id = $2
                `;
            } else {
                query = `
                    SELECT t.*, 
                           u.full_name as assigned_to_name,
                           u.username as assigned_to_username,
                           u.email as assigned_to_email,
                           c.full_name as created_by_name
                    FROM tasks t
                    LEFT JOIN users u ON t.assigned_to = u.id
                    LEFT JOIN users c ON t.created_by = c.id
                    WHERE t.id = $1 AND t.company_id = $2 AND t.assigned_to = $3
                `;
                values.push(req.user.id);
            }

            const { rows } = await db.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error getting task:', error);
            res.status(500).json({ message: 'Ошибка при получении задачи' });
        }
    },

    // Создание новой задачи
    async createTask(req, res) {
        try {
            const { title, description, assigned_to, requires_verification = true } = req.body;

            // Проверяем, что назначаемый сотрудник принадлежит той же компании
            if (assigned_to) {
                const { rows } = await db.query(
                    'SELECT id, telegram_id FROM users WHERE id = $1 AND company_id = $2',
                    [assigned_to, req.user.company_id]
                );
                if (rows.length === 0) {
                    return res.status(400).json({ message: 'Указанный сотрудник не найден' });
                }

                // Сохраняем chat_id для последующей отправки уведомления
                const assignedUserChatId = rows[0].telegram_id;
            }

            // Получаем company_id текущего пользователя
            const { rows: userRows } = await db.query(
                'SELECT company_id FROM users WHERE id = $1',
                [req.user.id]
            );

            if (userRows.length === 0 || !userRows[0].company_id) {
                return res.status(400).json({ message: 'Пользователь не привязан к компании' });
            }

            const company_id = userRows[0].company_id;

            const query = `
                INSERT INTO tasks (
                    title, description, status, company_id, 
                    assigned_to, created_by, requires_verification,
                    start_date, end_date
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *, 
                    (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                    (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                    (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                    (SELECT full_name FROM users WHERE id = created_by) as created_by_name
            `;

            const status = assigned_to ? 'assigned' : 'not-assigned';
            const values = [
                title,
                description,
                status,
                company_id,
                assigned_to,
                req.user.id,
                requires_verification,
                req.body.start_date,
                req.body.end_date
            ];

            const { rows } = await db.query(query, values);
            const createdTask = rows[0];

            // Отправляем уведомления
            try {
                if (status === 'assigned' && assigned_to) {
                    // Получаем chat_id назначенного пользователя
                    const { rows: userRows } = await db.query(
                        'SELECT telegram_id FROM users WHERE id = $1',
                        [assigned_to]
                    );
                    
                    if (userRows.length > 0 && userRows[0].telegram_id) {
                        await telegram.sendAssignedTaskNotification(userRows[0].telegram_id, createdTask);
                    }
                } else if (status === 'not-assigned') {
                    // Получаем chat_ids всех сотрудников компании, кроме менеджеров
                    const { rows: employeeRows } = await db.query(
                        'SELECT telegram_id FROM users WHERE company_id = $1 AND role != $2 AND telegram_id IS NOT NULL',
                        [company_id, 'manager']
                    );
                    
                    const chatIds = employeeRows.map(row => row.telegram_id).filter(Boolean);
                    if (chatIds.length > 0) {
                        await telegram.sendNotAssignedTaskNotification(chatIds, createdTask);
                    }
                }
            } catch (notificationError) {
                console.error('Error sending notifications:', notificationError);
                // Не прерываем выполнение, если уведомления не отправились
            }

            res.status(201).json(createdTask);
        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ message: 'Ошибка при создании задачи' });
        }
    },

    // Обновление задачи
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { title, description, assigned_to, requires_verification } = req.body;

            // Проверяем существование задачи и права доступа
            const taskCheck = await db.query(
                'SELECT * FROM tasks WHERE id = $1 AND company_id = $2',
                [id, req.user.company_id]
            );

            if (taskCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена' });
            }

            // Проверяем, что назначаемый сотрудник принадлежит той же компании
            if (assigned_to) {
                const { rows } = await db.query(
                    'SELECT id FROM users WHERE id = $1 AND company_id = $2',
                    [assigned_to, req.user.company_id]
                );
                if (rows.length === 0) {
                    return res.status(400).json({ message: 'Указанный сотрудник не найден' });
                }
            }

            const query = `
                UPDATE tasks 
                SET title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    assigned_to = COALESCE($3, assigned_to),
                    requires_verification = COALESCE($4, requires_verification),
                    start_date = COALESCE($5, start_date),
                    end_date = COALESCE($6, end_date),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7 AND company_id = $8
                RETURNING *, 
                    (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                    (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                    (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                    (SELECT full_name FROM users WHERE id = created_by) as created_by_name
            `;

            const values = [
                title,
                description,
                assigned_to,
                requires_verification,
                req.body.start_date,
                req.body.end_date,
                id,
                req.user.company_id
            ];

            const { rows } = await db.query(query, values);
            res.json(rows[0]);
        } catch (error) {
            console.error('Error updating task:', error);
            res.status(500).json({ message: 'Ошибка при обновлении задачи' });
        }
    },

    // Удаление задачи
    async deleteTask(req, res) {
        try {
            const { id } = req.params;

            // Проверяем существование задачи и права доступа
            const result = await db.query(
                'DELETE FROM tasks WHERE id = $1 AND company_id = $2 RETURNING id',
                [id, req.user.company_id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена' });
            }

            res.json({ message: 'Задача успешно удалена' });
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({ message: 'Ошибка при удалении задачи' });
        }
    },

    // Обновление статуса задачи
    async updateTaskStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            // Проверяем валидность статуса
            const validStatuses = ['assigned', 'accepted', 'in-progress', 'completed', 'done', 'cancelled', 'needsRevision'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Недопустимый статус' });
            }

            let query;
            let values;

            if (req.user.role === 'manager') {
                query = `
                    UPDATE tasks 
                    SET status = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2 AND company_id = $3
                    RETURNING *, 
                        (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                        (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                        (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                        (SELECT full_name FROM users WHERE id = created_by) as created_by_name
                `;
                values = [status, id, req.user.company_id];
            } else {
                query = `
                    UPDATE tasks 
                    SET status = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2 AND company_id = $3 AND assigned_to = $4
                    RETURNING *, 
                        (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                        (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                        (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                        (SELECT full_name FROM users WHERE id = created_by) as created_by_name
                `;
                values = [status, id, req.user.company_id, req.user.id];
            }

            const { rows } = await db.query(query, values);

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена или нет прав для её обновления' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error updating task status:', error);
            res.status(500).json({ message: 'Ошибка при обновлении статуса задачи' });
        }
    },

    // Начало работы над задачей с проверкой локации
    async startWork(req, res) {
        try {
            const { id } = req.params;

            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            // Проверяем, что у пользователя есть активная сессия (делится локацией)
            const sessionQuery = `
                SELECT id, user_id, task_id, start_time, end_time, is_active
                FROM sessions 
                WHERE user_id = $1 AND is_active = true
                ORDER BY start_time DESC
                LIMIT 1
            `;
            
            const sessionResult = await db.query(sessionQuery, [req.user.id]);
            
            if (sessionResult.rows.length === 0) {
                return res.status(400).json({ 
                    message: 'Для начала работы необходимо делиться локацией',
                    requiresLocation: true
                });
            }

            // Проверяем, что задача существует и назначена пользователю
            const taskQuery = `
                SELECT id, title, status, assigned_to, company_id
                FROM tasks 
                WHERE id = $1 AND company_id = $2 AND assigned_to = $3
            `;
            
            const taskResult = await db.query(taskQuery, [id, req.user.company_id, req.user.id]);
            
            if (taskResult.rows.length === 0) {
                return res.status(404).json({ message: 'Задача не найдена или нет прав для её обновления' });
            }

            const task = taskResult.rows[0];
            
            // Проверяем, что статус задачи позволяет начать работу
            if (task.status !== 'accepted') {
                return res.status(400).json({ message: 'Можно начать работу только с принятой задачи' });
            }

            // Обновляем статус задачи на 'in-progress'
            const updateQuery = `
                UPDATE tasks 
                SET status = 'in-progress', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *, 
                    (SELECT full_name FROM users WHERE id = assigned_to) as assigned_to_name,
                    (SELECT username FROM users WHERE id = assigned_to) as assigned_to_username,
                    (SELECT email FROM users WHERE id = assigned_to) as assigned_to_email,
                    (SELECT full_name FROM users WHERE id = created_by) as created_by_name
            `;
            
            const updateResult = await db.query(updateQuery, [id]);

            // Привязываем задачу к активной сессии
            const session = sessionResult.rows[0];
            if (session.task_id !== parseInt(id)) {
                const updateSessionQuery = `
                    UPDATE sessions 
                    SET task_id = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING id, user_id, task_id, start_time, is_active
                `;
                await db.query(updateSessionQuery, [id, session.id]);
            }

            res.json(updateResult.rows[0]);
        } catch (error) {
            console.error('Error starting work:', error);
            res.status(500).json({ message: 'Ошибка при начале работы над задачей' });
        }
    }
};

module.exports = tasksController; 
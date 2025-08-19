const db = require('../db');
const { Telegraf } = require('telegraf');

// Инициализация бота (токен должен быть в переменных окружения)
const bot = new Telegraf(process.env.BOT_TOKEN || 'your_bot_token_here');

// Генерация 6-значного буквенного инвайт-кода
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Генерация инвайт-кода
const generateInvite = async (req, res) => {
  try {
    const inviteCode = generateInviteCode();
    
    // Проверяем, что код уникален
    const existingCode = await db.query(
      'SELECT id FROM users WHERE invite_code = $1',
      [inviteCode]
    );

    if (existingCode.rows.length > 0) {
      // Если код уже существует, генерируем новый
      return generateInvite(req, res);
    }

    res.json({ invite_code: inviteCode });
  } catch (error) {
    console.error('Error generating invite code:', error);
    res.status(500).json({ message: 'Ошибка при генерации инвайт-кода' });
  }
};

// Создание приглашения сотрудника
const inviteEmployee = async (req, res) => {
  try {
    const { username, invite_code, manager_id } = req.body;

    if (!username || !invite_code) {
      return res.status(400).json({ 
        message: 'Username и инвайт-код обязательны' 
      });
    }

    // Проверяем, что manager_id принадлежит той же компании
    if (manager_id) {
      const managerCheck = await db.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [manager_id, req.user.company_id]
      );

      if (managerCheck.rows.length === 0) {
        return res.status(400).json({ 
          message: 'Указанный менеджер не найден или не принадлежит вашей компании' 
        });
      }
    }

    // Проверяем, что инвайт-код не используется другим пользователем
    const existingUser = await db.query(
      'SELECT id, status FROM users WHERE invite_code = $1',
      [invite_code]
    );

    if (existingUser.rows.length > 0) {
      const existingUserData = existingUser.rows[0];
      // Если пользователь уже существует и не в статусе pending, то код уже используется
      if (existingUserData.status !== 'pending') {
        return res.status(400).json({ 
          message: 'Инвайт-код уже используется' 
        });
      }
      // Если пользователь в статусе pending, обновляем его данные
      const updatedUser = await db.query(
        `UPDATE users 
         SET username = $1, company_id = $2, manager_id = $3, updated_at = CURRENT_TIMESTAMP 
         WHERE invite_code = $4 AND status = 'pending'
         RETURNING id, username, invite_code, status, company_id, manager_id, created_at`,
        [username, req.user.company_id, manager_id, invite_code]
      );

      const employee = updatedUser.rows[0];

      res.json({ 
        message: 'Приглашение обновлено успешно',
        employee: {
          id: employee.id,
          username: employee.username,
          status: employee.status,
          invite_code: employee.invite_code,
          company_id: employee.company_id,
          manager_id: employee.manager_id,
          created_at: employee.created_at,
          full_name: null,
          photo_url: null,
          email: null,
          telegram_id: null
        }
      });
      return;
    }

    // Проверяем, что username не занят (только для активных пользователей)
    const existingUsername = await db.query(
      'SELECT id FROM users WHERE username = $1 AND status != $2',
      [username, 'pending']
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Пользователь с таким username уже существует' 
      });
    }

    // Создаем запись пользователя со статусом pending
    const newUser = await db.query(
      `INSERT INTO users (username, invite_code, status, company_id, manager_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, username, invite_code, status, company_id, manager_id, created_at`,
      [username, invite_code, 'pending', req.user.company_id, manager_id]
    );

    const employee = newUser.rows[0];

    res.json({ 
      message: 'Приглашение создано успешно',
      employee: {
        id: employee.id,
        username: employee.username,
        status: employee.status,
        invite_code: employee.invite_code,
        company_id: employee.company_id,
        manager_id: employee.manager_id,
        created_at: employee.created_at,
        full_name: null,
        photo_url: null,
        email: null,
        telegram_id: null
      }
    });

  } catch (error) {
    console.error('Error creating invite:', error);
    res.status(500).json({ message: 'Ошибка при создании приглашения' });
  }
};

// Получение списка сотрудников
const getEmployees = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        u.id, 
        u.full_name, 
        u.username, 
        u.photo_url, 
        u.status, 
        u.invite_code, 
        u.email, 
        u.telegram_id,
        u.created_at,
        u.updated_at,
        m.full_name as manager_name
       FROM users u 
       LEFT JOIN users m ON u.manager_id = m.id 
       WHERE u.company_id = $1
       ORDER BY u.created_at DESC`,
      [req.user.company_id]
    );

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ message: 'Ошибка при получении списка сотрудников' });
  }
};

// Обновление сотрудника
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, status, manager_id } = req.body;

    // Проверяем, что сотрудник принадлежит той же компании
    const employeeCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [id, req.user.company_id]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Если указан manager_id, проверяем что менеджер из той же компании
    if (manager_id) {
      const managerCheck = await db.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2 AND role = $3',
        [manager_id, req.user.company_id, 'manager']
      );

      if (managerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Указанный менеджер не найден или не принадлежит вашей компании' });
      }
    }

    const result = await db.query(
      `UPDATE users 
       SET full_name = $1, email = $2, status = $3, manager_id = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [full_name, email, status, manager_id, id, req.user.company_id]
    );

    res.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Ошибка при обновлении сотрудника' });
  }
};

// Удаление сотрудника
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что пользователь не пытается удалить самого себя
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'Вы не можете удалить свою собственную учетную запись' });
    }

    // Начинаем транзакцию
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');

      // Проверяем, что сотрудник существует и принадлежит компании
      const employeeCheck = await client.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [id, req.user.company_id]
      );

      if (employeeCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Сотрудник не найден' });
      }

      // Обновляем все задачи, назначенные этому сотруднику
      // Устанавливаем статус "not-assigned" и убираем ссылку на сотрудника
      await client.query(
        `UPDATE tasks 
         SET assigned_to = NULL, status = 'not-assigned', updated_at = CURRENT_TIMESTAMP 
         WHERE assigned_to = $1 AND company_id = $2`,
        [id, req.user.company_id]
      );

      // Обновляем задачи, созданные этим сотрудником (устанавливаем created_by в NULL или удаляем)
      // Для безопасности лучше удалить задачи, созданные удаляемым сотрудником
      await client.query(
        `DELETE FROM tasks WHERE created_by = $1 AND company_id = $2`,
        [id, req.user.company_id]
      );

      // Обновляем manager_id у сотрудников, которые подчинялись удаляемому менеджеру
      await client.query(
        `UPDATE users 
         SET manager_id = NULL, updated_at = CURRENT_TIMESTAMP 
         WHERE manager_id = $1 AND company_id = $2`,
        [id, req.user.company_id]
      );

      // Удаляем позиции пользователя (сначала, так как они ссылаются на sessions)
      await client.query(
        `DELETE FROM positions WHERE user_id = $1`,
        [id]
      );

      // Удаляем сессии пользователя
      await client.query(
        `DELETE FROM sessions WHERE user_id = $1`,
        [id]
      );

      // Удаляем отчеты пользователя
      await client.query(
        `DELETE FROM reports WHERE user_id = $1`,
        [id]
      );

      // Удаляем состояние FSM пользователя (если есть telegram_id)
      const userCheck = await client.query(
        'SELECT telegram_id FROM users WHERE id = $1',
        [id]
      );
      
      if (userCheck.rows.length > 0 && userCheck.rows[0].telegram_id) {
        await client.query(
          `DELETE FROM fsm_states WHERE telegram_id = $1`,
          [userCheck.rows[0].telegram_id]
        );
      }

      // Удаляем сотрудника
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 AND company_id = $2 RETURNING id',
        [id, req.user.company_id]
      );

      await client.query('COMMIT');

      res.json({ 
        message: 'Сотрудник удален успешно. Все назначенные задачи переведены в статус "Не назначены", созданные задачи удалены, подчиненные сотрудники освобождены от менеджера.' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Ошибка при удалении сотрудника' });
  }
};

// Получение позиций сотрудника за период
const getEmployeePositions = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    console.log('=== getEmployeePositions called ===');
    console.log('Employee ID:', id);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('User company_id:', req.user.company_id);

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Необходимо указать начальную и конечную даты' });
    }

    // Проверяем, что сотрудник принадлежит той же компании
    const employeeCheck = await db.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [id, req.user.company_id]
    );

    console.log('Employee check result:', employeeCheck.rows);

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Debug: проверим, есть ли вообще данные в таблице positions
    const debugPositions = await db.query('SELECT COUNT(*) as total FROM positions');
    console.log('Total positions in database:', debugPositions.rows[0]);

    // Debug: проверим все сессии в базе
    const allSessions = await db.query('SELECT id, user_id, start_time, end_time FROM sessions LIMIT 10');
    console.log('All sessions in database:', allSessions.rows);

    // Debug: проверим всех пользователей и их сессии
    const usersWithSessions = await db.query(`
      SELECT u.id as user_id, u.full_name, u.email, s.id as session_id, s.start_time, s.end_time
      FROM users u
      LEFT JOIN sessions s ON u.id = s.user_id
      WHERE u.company_id = $1
      ORDER BY u.id, s.start_time
    `, [req.user.company_id]);
    console.log('Users and their sessions:', usersWithSessions.rows);

    // Debug: проверим сессии для этого пользователя
    const debugSessions = await db.query('SELECT id, user_id, start_time, end_time FROM sessions WHERE user_id = $1', [id]);
    console.log('Sessions for user:', debugSessions.rows);

    // Debug: проверим позиции без JOIN с сессиями
    const allPositions = await db.query('SELECT id, session_id, latitude, longitude, timestamp FROM positions LIMIT 5');
    console.log('Sample positions from database:', allPositions.rows);

    // Debug: проверим позиции для этого пользователя (без фильтра по времени)
    const debugUserPositions = await db.query(`
      SELECT p.latitude, p.longitude, p.timestamp, s.id as session_id, s.user_id
      FROM positions p
      JOIN sessions s ON p.session_id = s.id
      WHERE s.user_id = $1
      ORDER BY p.timestamp DESC
      LIMIT 5
    `, [id]);
    console.log('Recent positions for user:', debugUserPositions.rows);

    // Получаем позиции сотрудника за указанный период
    const query = `
      SELECT latitude, longitude, timestamp 
      FROM positions
      WHERE user_id = $1 
      AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp ASC
    `;
    
    console.log('SQL Query:', query);
    console.log('Query parameters:', [id, startDate, endDate]);

    const positions = await db.query(query, [id, startDate, endDate]);

    console.log('Positions query result:', positions.rows);
    console.log('Number of positions found:', positions.rows.length);

    // Форматируем данные для фронтенда
    const route = positions.rows.map(pos => [pos.latitude, pos.longitude]);

    console.log('Formatted route:', route);

    res.json({ 
      route,
      timestamps: positions.rows.map(pos => pos.timestamp)
    });
  } catch (error) {
    console.error('Error getting employee positions:', error);
    res.status(500).json({ message: 'Ошибка при получении маршрута сотрудника' });
  }
};

module.exports = {
  generateInvite,
  inviteEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeePositions
}; 
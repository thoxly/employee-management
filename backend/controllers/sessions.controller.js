const db = require('../db');

const sessionsController = {
    // Получение активной сессии пользователя
    async getActiveSession(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            const query = `
                SELECT id, user_id, task_id, start_time, end_time, is_active, created_at, updated_at
                FROM sessions 
                WHERE user_id = $1 AND is_active = true
                ORDER BY start_time DESC
                LIMIT 1
            `;
            
            const { rows } = await db.query(query, [req.user.id]);
            
            if (rows.length === 0) {
                return res.json({ 
                    hasActiveSession: false,
                    session: null 
                });
            }

            res.json({ 
                hasActiveSession: true,
                session: rows[0] 
            });
        } catch (error) {
            console.error('Error getting active session:', error);
            res.status(500).json({ message: 'Ошибка при получении активной сессии' });
        }
    },

    // Создание новой сессии
    async createSession(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            const { taskId } = req.body;

            const query = `
                INSERT INTO sessions (user_id, task_id, start_time, is_active)
                VALUES ($1, $2, CURRENT_TIMESTAMP, true)
                RETURNING id, user_id, task_id, start_time, is_active, created_at, updated_at
            `;
            
            const { rows } = await db.query(query, [req.user.id, taskId]);
            
            res.json(rows[0]);
        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({ message: 'Ошибка при создании сессии' });
        }
    },

    // Деактивация сессии
    async deactivateSession(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Требуется авторизация' });
            }

            const { id } = req.params;

            const query = `
                UPDATE sessions 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND user_id = $2
                RETURNING id, user_id, task_id, start_time, is_active, created_at, updated_at
            `;
            
            const { rows } = await db.query(query, [id, req.user.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Сессия не найдена' });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Error deactivating session:', error);
            res.status(500).json({ message: 'Ошибка при деактивации сессии' });
        }
    }
};

module.exports = sessionsController; 
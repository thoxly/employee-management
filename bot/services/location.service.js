const db = require('../db');

class LocationService {
    constructor() {
        // Хранилище последних обновлений локации для каждого пользователя
        this.lastLocationUpdate = new Map(); // telegramId -> timestamp
        // Таймер для проверки потери связи
        this.connectionMonitor = null;
    }

    /**
     * Получить активную сессию пользователя
     * @param {number} userId - ID пользователя в системе
     * @returns {Promise<Object|null>} - Активная сессия или null
     */
    async getActiveSession(userId) {
        try {
            const query = `
                SELECT id, user_id, task_id, start_time, end_time, is_active
                FROM sessions 
                WHERE user_id = $1 AND is_active = true
                ORDER BY start_time DESC
                LIMIT 1
            `;
            
            const result = await db.query(query, [userId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('❌ Error in getActiveSession:', error);
            throw error;
        }
    }

    /**
     * Создать новую сессию
     * @param {number} userId - ID пользователя в системе
     * @param {number|null} taskId - ID задачи (может быть null для live-локации без задачи)
     * @returns {Promise<Object>} - Созданная сессия
     */
    async createSession(userId, taskId = null) {
        try {
            const query = `
                INSERT INTO sessions (user_id, task_id, start_time, is_active)
                VALUES ($1, $2, CURRENT_TIMESTAMP, true)
                RETURNING id, user_id, task_id, start_time, is_active
            `;
            
            const result = await db.query(query, [userId, taskId]);
            console.log(`✅ Created session for user ${userId}, task ${taskId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in createSession:', error);
            throw error;
        }
    }

    /**
     * Обновить task_id для существующей сессии
     * @param {number} sessionId - ID сессии
     * @param {number} taskId - ID задачи
     * @returns {Promise<Object>} - Обновленная сессия
     */
    async updateSessionTask(sessionId, taskId) {
        try {
            const query = `
                UPDATE sessions 
                SET task_id = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, user_id, task_id, start_time, is_active
            `;
            
            const result = await db.query(query, [sessionId, taskId]);
            console.log(`✅ Updated session ${sessionId} with task ${taskId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in updateSessionTask:', error);
            throw error;
        }
    }

    /**
     * Деактивировать сессию
     * @param {number} sessionId - ID сессии
     * @returns {Promise<Object>} - Деактивированная сессия
     */
    async deactivateSession(sessionId) {
        try {
            const query = `
                UPDATE sessions 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, user_id, task_id, start_time, is_active
            `;
            
            const result = await db.query(query, [sessionId]);
            console.log(`🔴 Deactivated session ${sessionId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in deactivateSession:', error);
            throw error;
        }
    }

    /**
     * Реактивировать сессию
     * @param {number} sessionId - ID сессии
     * @returns {Promise<Object>} - Реактивированная сессия
     */
    async reactivateSession(sessionId) {
        try {
            const query = `
                UPDATE sessions 
                SET is_active = true, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, user_id, task_id, start_time, is_active
            `;
            
            const result = await db.query(query, [sessionId]);
            console.log(`🟢 Reactivated session ${sessionId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in reactivateSession:', error);
            throw error;
        }
    }

    /**
     * Завершить сессию
     * @param {number} sessionId - ID сессии
     * @returns {Promise<Object>} - Завершенная сессия
     */
    async endSession(sessionId) {
        try {
            const query = `
                UPDATE sessions 
                SET end_time = CURRENT_TIMESTAMP, is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, user_id, task_id, start_time, end_time, is_active
            `;
            
            const result = await db.query(query, [sessionId]);
            console.log(`🏁 Ended session ${sessionId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in endSession:', error);
            throw error;
        }
    }

    /**
     * Сохранить позицию пользователя
     * @param {number} userId - ID пользователя в системе
     * @param {number} sessionId - ID сессии
     * @param {number} latitude - Широта
     * @param {number} longitude - Долгота
     * @param {Date} timestamp - Время получения позиции
     * @returns {Promise<Object>} - Сохраненная позиция
     */
    async savePosition(userId, sessionId, latitude, longitude, timestamp = new Date()) {
        try {
            const query = `
                INSERT INTO positions (user_id, session_id, latitude, longitude, timestamp)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, user_id, session_id, latitude, longitude, timestamp
            `;
            
            const result = await db.query(query, [userId, sessionId, latitude, longitude, timestamp]);
            console.log(`📍 Saved position for user ${userId}, session ${sessionId}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in savePosition:', error);
            throw error;
        }
    }

    /**
     * Обновить время последнего обновления локации
     * @param {number} telegramId - Telegram ID пользователя
     */
    updateLastLocationTime(telegramId) {
        this.lastLocationUpdate.set(telegramId, Date.now());
        console.log(`🕐 Updated last location time for user ${telegramId}`);
    }

    /**
     * Получить время последнего обновления локации
     * @param {number} telegramId - Telegram ID пользователя
     * @returns {number|null} - Timestamp последнего обновления или null
     */
    getLastLocationTime(telegramId) {
        return this.lastLocationUpdate.get(telegramId) || null;
    }

    /**
     * Проверить, истекло ли время ожидания для пользователя
     * @param {number} telegramId - Telegram ID пользователя
     * @param {number} timeoutMinutes - Таймаут в минутах (по умолчанию 3)
     * @returns {boolean} - true если время истекло
     */
    isLocationTimeout(telegramId, timeoutMinutes = 3) {
        const lastUpdate = this.getLastLocationTime(telegramId);
        if (!lastUpdate) return false;
        
        const now = Date.now();
        const diffMinutes = (now - lastUpdate) / (1000 * 60);
        return diffMinutes > timeoutMinutes;
    }

    /**
     * Получить задачу пользователя в статусе "in-progress"
     * @param {number} userId - ID пользователя в системе
     * @returns {Promise<Object|null>} - Задача в процессе выполнения или null
     */
    async getUserActiveTask(userId) {
        try {
            const query = `
                SELECT id, title, description, status
                FROM tasks 
                WHERE assigned_to = $1 AND status = 'in-progress'
                ORDER BY created_at DESC
                LIMIT 1
            `;
            
            const result = await db.query(query, [userId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('❌ Error in getUserActiveTask:', error);
            throw error;
        }
    }

    /**
     * Получить задачу по ID сессии
     * @param {number} sessionId - ID сессии
     * @returns {Promise<Object|null>} - Задача или null
     */
    async getTaskBySessionId(sessionId) {
        try {
            const query = `
                SELECT t.id, t.title, t.description, t.status
                FROM tasks t
                JOIN sessions s ON t.id = s.task_id
                WHERE s.id = $1
            `;
            
            const result = await db.query(query, [sessionId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('❌ Error in getTaskBySessionId:', error);
            throw error;
        }
    }

    /**
     * Запустить мониторинг потери связи
     * @param {Object} bot - Экземпляр бота Telegraf
     */
    startConnectionMonitoring(bot) {
        // ТЕСТОВЫЕ НАСТРОЙКИ (быстрое тестирование):
        // - Интервал проверки: 15 секунд (вместо 60)
        // - Таймаут потери связи: 15 секунд (вместо 3 минут)
        //
        // ОРИГИНАЛЬНЫЕ НАСТРОЙКИ (для продакшена):
        // - Интервал проверки: 60 секунд
        // - Таймаут потери связи: 3 минуты
        //
        // TODO: Вернуть на оригинальные настройки после тестирования
        this.connectionMonitor = setInterval(async () => {
            console.log('🔍 Checking connection status...');
            
            for (const [telegramId, lastUpdate] of this.lastLocationUpdate.entries()) {
                // ТЕСТ: 15 секунд = 0.25 минуты
                // TODO: Вернуть на 3 минуты после тестирования
                if (this.isLocationTimeout(telegramId, 0.25)) {
                    try {
                        // Получаем пользователя и его активную сессию
                        const userService = require('./user.service');
                        const user = await userService.getUserByTelegramId(telegramId);
                        
                        if (!user) continue;
                        
                        const activeSession = await this.getActiveSession(user.id);
                        if (!activeSession) continue;
                        
                        // Проверяем, есть ли активная задача у пользователя
                        const activeTask = await this.getUserActiveTask(user.id);
                        
                        // Деактивируем сессию
                        await this.deactivateSession(activeSession.id);
                        
                        if (activeTask) {
                            // Кейс 1: Есть выполняемая задача - критично
                            await bot.telegram.sendMessage(
                                telegramId,
                                '⚠️ **Выполняется задача!**\n\n' +
                                `**${activeTask.title}**\n` +
                                `${activeTask.description || ''}\n\n` +
                                '❌ Мы потеряли связь с вашей локацией.\n' +
                                '📍 Убедитесь, что делитесь live-локацией для продолжения отслеживания.'
                            );
                        } else {
                            // Кейс 2: Нет активной задачи - не критично
                            await bot.telegram.sendMessage(
                                telegramId,
                                '🛑 Режим отслеживания деактивирован.'
                            );
                        }
                        
                        console.log(`⚠️ Connection lost for user ${telegramId}, session ${activeSession.id} deactivated`);
                        
                        // Удаляем из мониторинга
                        this.lastLocationUpdate.delete(telegramId);
                        
                    } catch (error) {
                        console.error(`❌ Error checking connection for user ${telegramId}:`, error);
                    }
                }
            }
        }, 15000); // ТЕСТ: Проверка каждые 15 секунд
        // TODO: Вернуть на 60000 (60 секунд) после тестирования
        
        console.log('🎯 Connection monitoring started');
    }

    /**
     * Остановить мониторинг потери связи
     */
    stopConnectionMonitoring() {
        if (this.connectionMonitor) {
            clearInterval(this.connectionMonitor);
            this.connectionMonitor = null;
            console.log('🛑 Connection monitoring stopped');
        }
    }

    /**
     * Завершить все активные сессии для задачи
     * Вызывается при завершении задачи
     * @param {number} taskId - ID завершенной задачи
     * @returns {Promise<Array>} - Массив завершенных сессий
     */
    async endSessionsForTask(taskId) {
        try {
            const query = `
                UPDATE sessions 
                SET end_time = CURRENT_TIMESTAMP, is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE task_id = $1 AND is_active = true
                RETURNING id, user_id, task_id, start_time, end_time
            `;
            
            const result = await db.query(query, [taskId]);
            console.log(`🏁 Ended ${result.rows.length} sessions for task ${taskId}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Error in endSessionsForTask:', error);
            throw error;
        }
    }

    /**
     * Получить статистику по сессии
     * @param {number} sessionId - ID сессии
     * @returns {Promise<Object>} - Статистика сессии
     */
    async getSessionStats(sessionId) {
        try {
            const query = `
                SELECT 
                    s.id,
                    s.user_id,
                    s.task_id,
                    s.start_time,
                    s.end_time,
                    s.is_active,
                    COUNT(p.id) as position_count,
                    MIN(p.timestamp) as first_position,
                    MAX(p.timestamp) as last_position,
                    u.full_name as user_name,
                    t.title as task_title
                FROM sessions s
                LEFT JOIN positions p ON s.id = p.session_id
                LEFT JOIN users u ON s.user_id = u.id
                LEFT JOIN tasks t ON s.task_id = t.id
                WHERE s.id = $1
                GROUP BY s.id, s.user_id, s.task_id, s.start_time, s.end_time, s.is_active, u.full_name, t.title
            `;
            
            const result = await db.query(query, [sessionId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('❌ Error in getSessionStats:', error);
            throw error;
        }
    }

    /**
     * Получить последние позиции пользователя
     * @param {number} userId - ID пользователя
     * @param {number} limit - Количество позиций (по умолчанию 10)
     * @returns {Promise<Array>} - Массив последних позиций
     */
    async getUserRecentPositions(userId, limit = 10) {
        try {
            const query = `
                SELECT 
                    p.latitude,
                    p.longitude,
                    p.timestamp,
                    s.id as session_id,
                    t.title as task_title
                FROM positions p
                JOIN sessions s ON p.session_id = s.id
                LEFT JOIN tasks t ON s.task_id = t.id
                WHERE p.user_id = $1
                ORDER BY p.timestamp DESC
                LIMIT $2
            `;
            
            const result = await db.query(query, [userId, limit]);
            return result.rows;
        } catch (error) {
            console.error('❌ Error in getUserRecentPositions:', error);
            throw error;
        }
    }

    /**
     * Проверить, находится ли пользователь в рабочее время
     * @param {number} userId - ID пользователя
     * @returns {Promise<boolean>} - true если рабочее время
     */
    async isWorkingHours(userId) {
        try {
            const query = `
                SELECT c.work_start_time, c.work_end_time
                FROM users u
                JOIN companies c ON u.company_id = c.id
                WHERE u.id = $1
            `;
            
            const result = await db.query(query, [userId]);
            if (result.rows.length === 0) return false;

            const { work_start_time, work_end_time } = result.rows[0];
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS format

            return currentTime >= work_start_time && currentTime <= work_end_time;
        } catch (error) {
            console.error('❌ Error in isWorkingHours:', error);
            return false;
        }
    }

    /**
     * Уведомить пользователя о начале задачи и необходимости включить отслеживание
     * @param {Object} bot - Экземпляр бота
     * @param {number} telegramId - Telegram ID пользователя
     * @param {Object} task - Данные задачи
     */
    async notifyTaskStarted(bot, telegramId, task) {
        try {
            const message = `📋 **Новая задача назначена:**\n\n` +
                `**${task.title}**\n` +
                `${task.description || ''}\n\n` +
                `📍 Для отслеживания выполнения поделитесь live-локацией:\n` +
                `1. Нажмите на скрепку (📎)\n` +
                `2. Выберите "Геопозиция"\n` +
                `3. Включите "Передавать геопозицию"\n` +
                `4. Нажмите "Отправить геопозицию"`;

            await bot.telegram.sendMessage(telegramId, message);
            console.log(`📨 Task notification sent to user ${telegramId} for task ${task.id}`);
        } catch (error) {
            console.error(`❌ Error sending task notification to ${telegramId}:`, error);
        }
    }

    /**
     * Привязать задачу к сессии отслеживания
     * @param {number} sessionId - ID сессии
     * @param {number} taskId - ID задачи
     * @returns {Promise<Object>} - Обновленная сессия
     */
    async attachTaskToSession(sessionId, taskId) {
        try {
            const query = `
                UPDATE sessions
                SET task_id = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
            
            const result = await db.query(query, [taskId, sessionId]);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error in attachTaskToSession:', error);
            throw error;
        }
    }
}

module.exports = new LocationService(); 
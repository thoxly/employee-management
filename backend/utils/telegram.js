const fetch = require('node-fetch');
const crypto = require('crypto');
const config = require('../config');
const { createWebAppKeyboard, getWebAppUrl } = require('./webapp');

/**
 * Отправляет сообщение пользователю через Telegram Bot API
 * @param {number} chatId - ID чата пользователя
 * @param {string} message - Текст сообщения
 * @param {Object} options - Дополнительные опции (parse_mode, reply_markup и т.д.)
 * @returns {Promise<Object>} - Результат отправки
 */
const sendTelegramMessage = async (chatId, message, options = {}) => {
    try {
        const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
        
        const payload = {
            chat_id: chatId,
            text: message,
            ...options
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(`Telegram API error: ${result.description}`);
        }

        return result;
    } catch (error) {
        console.error('Ошибка отправки сообщения в Telegram:', error);
        throw error;
    }
};

/**
 * Отправляет сообщение об успешной регистрации
 * @param {number} telegramId - Telegram ID пользователя
 * @param {string} fullName - Полное имя пользователя
 * @returns {Promise<Object>} - Результат отправки
 */
const sendRegistrationSuccessMessage = async (telegramId, fullName) => {
    const message = `🎉 Добро пожаловать, ${fullName}!

✅ Ваша регистрация успешно завершена!

Теперь вы можете:
• Получать уведомления о задачах
• Отправлять отчеты о выполнении
• Отслеживать свой прогресс

📱 **Доступ к мини-приложению:**
Для полного доступа к функциям используйте мини-приложение через кнопку ниже.`;

    const options = {
        reply_markup: createWebAppKeyboard()
    };

    return sendTelegramMessage(telegramId, message, options);
};

/**
 * Отправляет сообщение об ошибке регистрации
 * @param {number} telegramId - Telegram ID пользователя
 * @param {string} errorMessage - Сообщение об ошибке
 * @returns {Promise<Object>} - Результат отправки
 */
const sendRegistrationErrorMessage = async (telegramId, errorMessage) => {
    const message = `❌ Ошибка регистрации

${errorMessage}

Пожалуйста, проверьте правильность инвайт-кода и попробуйте снова.`;

    return sendTelegramMessage(telegramId, message);
};

/**
 * Отправляет уведомление о назначенной задаче конкретному пользователю
 * @param {number} telegramId - Telegram ID пользователя
 * @param {Object} task - Объект задачи
 * @returns {Promise<Object>} - Результат отправки
 */
const sendAssignedTaskNotification = async (telegramId, task) => {
    const message = `📋 Вам назначена новая задача!

📌 Название: ${task.title}
📝 Описание: ${task.description}
📅 Срок: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Не указан'}

Для управления задачей нажмите кнопку ниже.`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '📋 Открыть в приложении',
                        web_app: { url: getWebAppUrl(`/my-app`) }
                    }
                ]
            ]
        }
    };

    return sendTelegramMessage(telegramId, message, options);
};

/**
 * Отправляет уведомление о новой неназначенной задаче всем сотрудникам компании
 * @param {number[]} telegramIds - Массив Telegram ID пользователей
 * @param {Object} task - Объект задачи
 * @returns {Promise<Object[]>} - Результаты отправки
 */
const sendNotAssignedTaskNotification = async (telegramIds, task) => {
    const message = `🔔 Доступна новая задача!

📌 Название: ${task.title}
📝 Описание: ${task.description}
📅 Срок: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'Не указан'}

Для принятия задачи нажмите кнопку ниже.`;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '📋 Открыть в приложении',
                        web_app: { url: getWebAppUrl(`/my-app/`) }
                    }
                ]
            ]
        }
    };

    return Promise.all(telegramIds.map(telegramId => 
        sendTelegramMessage(telegramId, message, options)
    ));
};

/**
 * Verify Telegram Web App initData
 * @param {string} initData - Raw initData string from Telegram Web App
 * @returns {boolean} - Whether the data is valid
 */
const verifyTelegramWebAppData = (initData) => {
  try {
    console.log('=== VERIFYING TELEGRAM WEB APP DATA ===');
    console.log('InitData:', initData);
    console.log('Bot token exists:', !!config.telegram.botToken);
    
    // Get data-check-string
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    console.log('Hash from initData:', hash);
    console.log('URL params:', Object.fromEntries(urlParams.entries()));
    
    // Generate data-check-string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    console.log('Data check string:', dataCheckString);

    // Generate secret key (as per Telegram docs)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegram.botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    console.log('Calculated hash:', calculatedHash);
    console.log('Hash match:', calculatedHash === hash);
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram Web App data:', error);
    return false;
  }
};

module.exports = {
    sendTelegramMessage,
    sendRegistrationSuccessMessage,
    sendRegistrationErrorMessage,
    sendAssignedTaskNotification,
    sendNotAssignedTaskNotification,
    verifyTelegramWebAppData
}; 
const { createWebAppKeyboard } = require('../../utils/webapp');

const registeredHandler = async (ctx, state) => {
    const text = ctx.message.text.trim();
    
    // Handle different types of messages from registered users
    if (text.toLowerCase().includes('задача') || text.toLowerCase().includes('task')) {
        return ctx.reply('📋 Для просмотра ваших задач используйте команду /app для открытия мини-приложения или дождитесь уведомления о новой задаче.');
    }
    
    if (text.toLowerCase().includes('отчет') || text.toLowerCase().includes('report')) {
        return ctx.reply('📝 Для отправки отчета о выполнении задачи используйте мини-приложение (/app) или ответьте на уведомление о задаче.');
    }
    
    if (text.toLowerCase().includes('приложение') || text.toLowerCase().includes('app')) {
        return ctx.reply('📱 Открываю мини-приложение...', {
            reply_markup: createWebAppKeyboard()
        });
    }
    
    if (text.toLowerCase().includes('помощь') || text.toLowerCase().includes('help')) {
        return ctx.reply(`🤖 Доступные команды:
        
/start - Информация о регистрации
/app - Открыть мини-приложение
/leave - Покинуть компанию
/help - Показать эту справку

📱 Основные возможности:
• Получение уведомлений о новых задачах
• Отправка отчетов о выполнении
• Отслеживание прогресса
• Полный доступ через мини-приложение

💻 Для полного доступа к функциям используйте команду /app`);
    }
    
    // Default response for registered users with inline button
    return ctx.reply('✅ Вы успешно зарегистрированы! Используйте кнопку ниже для доступа к мини-приложению или ожидайте уведомления о новых задачах.', {
        reply_markup: createWebAppKeyboard()
    });
};

module.exports = registeredHandler; 
const userService = require('../services/user.service');
const locationService = require('../services/location.service');

/**
 * Обработчик получения live геолокации
 * @param {Object} ctx - Контекст Telegraf
 * @param {boolean} isEdit - Флаг, указывающий что это обновление (edited_message)
 */
async function handleLocation(ctx, isEdit = false) {
    const telegramId = ctx.from.id;
    const location = ctx.message?.location || ctx.editedMessage?.location;
    
    if (!location) {
        console.log('❌ No location data found in message');
        return;
    }

    console.log(`📍 ${isEdit ? 'Updated' : 'Received'} location from user ${telegramId}:`, {
        latitude: location.latitude,
        longitude: location.longitude,
        live_period: location.live_period,
        heading: location.heading,
        proximity_alert_radius: location.proximity_alert_radius
    });

    try {
        // Проверяем регистрацию пользователя
        const user = await userService.getUserByTelegramId(telegramId);
        if (!user) {
            return ctx.reply('❌ Вы не зарегистрированы в системе. Используйте /start для регистрации.');
        }

        // Проверяем live-режим
        if (!location.live_period || location.live_period <= 0) {
            // Если это обновление сообщения (edited_message) и нет live_period,
            // значит пользователь перестал делиться live-локацией
            if (isEdit) {
                console.log('🛑 Live location sharing stopped by user');
                
                // Получаем активную сессию и деактивируем её
                const activeSession = await locationService.getActiveSession(user.id);
                if (activeSession && activeSession.is_active) {
                    await locationService.deactivateSession(activeSession.id);
                    console.log(`🔴 Session ${activeSession.id} deactivated due to live location stop`);
                    
                    // Удаляем из мониторинга
                    locationService.lastLocationUpdate.delete(telegramId);
                    
                    // Проверяем, есть ли активная задача у пользователя
                    const activeTask = await locationService.getUserActiveTask(user.id);
                    
                    if (activeTask) {
                        // Кейс 1: Есть выполняемая задача - критично
                        await ctx.reply(
                            '⚠️ **Выполняется задача!**\n\n' +
                            `**${activeTask.title}**\n` +
                            `${activeTask.description || ''}\n\n` +
                            '❌ Мы потеряли связь с вашей локацией.\n' +
                            '📍 Убедитесь, что делитесь live-локацией для продолжения отслеживания.'
                        );
                    } else {
                        // Кейс 2: Нет активной задачи - не критично
                        await ctx.reply('🛑 Режим отслеживания деактивирован.');
                    }
                }
                return;
            }
            
            // Для обычных сообщений (не edited_message) просим включить live-режим
            return ctx.reply(
                '📍 Пожалуйста, поделитесь live-локацией!\n\n' +
                '1. Нажмите на скрепку (📎)\n' +
                '2. Выберите "Геопозиция"\n' +
                '3. Включите "Передавать геопозицию" на 15 минут или 1 час\n' +
                '4. Нажмите "Отправить геопозицию"'
            );
        }

        // Для live-локации всегда используем текущее время
        // В режиме live обновления приходят в реальном времени
        if (location.live_period > 0) {
            console.log('🔄 Live location update received');
        } else {
            // Только для обычной (не live) локации проверяем актуальность
            const messageDate = ctx.message?.date || ctx.editedMessage?.date;
            const currentTime = Math.floor(Date.now() / 1000);
            const locationAge = currentTime - messageDate;
            
            if (locationAge > 120) { // 2 минуты
                console.log(`⚠️ Location is too old: ${locationAge} seconds`);
                return;
            }
        }

        // Обновляем время последнего обновления локации
        locationService.updateLastLocationTime(telegramId);

        // Получаем активную сессию пользователя
        let activeSession = await locationService.getActiveSession(user.id);

        // Если нет активной сессии, создаем новую
        if (!activeSession) {
            activeSession = await locationService.createSession(user.id, null);
            console.log(`✅ Created new session ${activeSession.id} for user ${user.id}`);
            
            // Если это первая локация, уведомляем пользователя
            if (!isEdit) {
                await ctx.reply('📍 Начато отслеживание вашей локации. Ожидаем назначения задачи...');
            }
        } else {
            // Реактивируем сессию если она была деактивирована
            if (!activeSession.is_active) {
                await locationService.reactivateSession(activeSession.id);
                
                // Проверяем, есть ли активная задача у пользователя
                const activeTask = await locationService.getUserActiveTask(user.id);
                if (activeTask && !activeSession.task_id) {
                    // Привязываем задачу к сессии
                    await locationService.updateSessionTask(activeSession.id, activeTask.id);
                }
                
                // Проверяем, была ли привязана задача к сессии
                const sessionTask = await locationService.getTaskBySessionId(activeSession.id);
                if (sessionTask || activeTask) {
                    // Кейс 1: Есть задача - критично
                    const taskToShow = sessionTask || activeTask;
                    await ctx.reply(
                        '🟢 **Связь восстановлена!**\n\n' +
                        '📍 Отслеживание локации возобновлено.\n' +
                        '✅ Продолжаем мониторинг выполнения задачи.'
                    );
                } else {
                    // Кейс 2: Нет задачи - не критично
                    await ctx.reply('🟢 Отслеживание локации возобновлено.');
                }
            }
        }

        // Сохраняем позицию
        // Для live-локации используем текущее время, для обычной - время сообщения
        const positionTimestamp = location.live_period > 0 
            ? new Date() 
            : new Date((ctx.message?.date || ctx.editedMessage?.date) * 1000);

        await locationService.savePosition(
            user.id,
            activeSession.id,
            location.latitude,
            location.longitude,
            positionTimestamp
        );

        // Логируем успешное сохранение
        console.log(`✅ Position saved for user ${user.id}, session ${activeSession.id}`);

        // Проверяем, есть ли активная задача и привязана ли она к сессии
        if (!activeSession.task_id) {
            const activeTask = await locationService.getUserActiveTask(user.id);
            if (activeTask) {
                // Привязываем задачу к сессии
                await locationService.updateSessionTask(activeSession.id, activeTask.id);
                console.log(`🔗 Linked task ${activeTask.id} to session ${activeSession.id}`);
                
                if (!isEdit) {
                    await ctx.reply(
                        `📋 Задача привязана к отслеживанию:\n\n` +
                        `**${activeTask.title}**\n` +
                        `${activeTask.description || ''}\n\n` +
                        `🕐 Отслеживание началось в ${positionTimestamp.toLocaleString('ru-RU')}`
                    );
                }
            }
        }

    } catch (error) {
        console.error('❌ Error in handleLocation:', error);
        
        // Не отправляем ошибку пользователю для обновлений локации
        if (!isEdit) {
            await ctx.reply('❌ Произошла ошибка при обработке локации. Пожалуйста, попробуйте позже.');
        }
    }
}

/**
 * Обработчик первоначальной локации
 */
const locationHandler = async (ctx) => {
    return handleLocation(ctx, false);
};

/**
 * Обработчик обновлений локации (edited_message)
 */
const editedLocationHandler = async (ctx) => {
    // Проверяем, что обновленное сообщение содержит локацию
    if (ctx.editedMessage && ctx.editedMessage.location) {
        return handleLocation(ctx, true);
    }
};

module.exports = {
    locationHandler,
    editedLocationHandler,
    handleLocation
}; 
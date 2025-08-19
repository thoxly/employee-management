const fetch = require('node-fetch');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3003/api/auth';

// Функция для создания тестового initData (для тестирования)
function createTestInitData(telegramId, botToken) {
    const user = {
        id: telegramId,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru'
    };

    const params = new URLSearchParams();
    params.set('user', JSON.stringify(user));
    params.set('auth_date', Math.floor(Date.now() / 1000).toString());
    params.set('query_id', 'test_query_id');
    params.set('chat_instance', 'test_chat_instance');
    params.set('chat_type', 'private');

    // Генерируем хеш
    const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    const hash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    params.set('hash', hash);
    
    return params.toString();
}

async function testTelegramWebAppAuth() {
    console.log('🧪 Тестирование Telegram WebApp авторизации...\n');

    try {
        // Тест 1: Проверка существующего пользователя
        console.log('1. Тест авторизации существующего пользователя...');
        
        const testTelegramId = 123456789; // Тестовый Telegram ID
        const botToken = process.env.BOT_TOKEN || 'your-bot-token-here';
        
        const initData = createTestInitData(testTelegramId, botToken);
        
        const authResponse = await fetch(`${BASE_URL}/telegram-web-app`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initData: initData
            }),
        });

        console.log('Status:', authResponse.status);
        
        if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('✅ Авторизация успешна');
            console.log('   User ID:', authData.user.id);
            console.log('   Telegram ID:', authData.user.telegram_id);
            console.log('   Full Name:', authData.user.full_name);
            console.log('   Has Access Token:', !!authData.accessToken);
        } else {
            const errorData = await authResponse.json();
            console.log('❌ Ошибка авторизации:', errorData.message);
            
            if (errorData.needsRegistration) {
                console.log('   Пользователь не зарегистрирован - это ожидаемо для тестового ID');
            }
        }

        // Тест 2: Проверка с неверным initData
        console.log('\n2. Тест с неверным initData...');
        
        const invalidResponse = await fetch(`${BASE_URL}/telegram-web-app`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initData: 'invalid_init_data'
            }),
        });

        console.log('Status:', invalidResponse.status);
        
        if (!invalidResponse.ok) {
            const errorData = await invalidResponse.json();
            console.log('✅ Ошибка ожидаема:', errorData.message);
        } else {
            console.log('❌ Неожиданный успех с неверными данными');
        }

        // Тест 3: Проверка без initData
        console.log('\n3. Тест без initData...');
        
        const noDataResponse = await fetch(`${BASE_URL}/telegram-web-app`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        console.log('Status:', noDataResponse.status);
        
        if (!noDataResponse.ok) {
            const errorData = await noDataResponse.json();
            console.log('✅ Ошибка ожидаема:', errorData.message);
        } else {
            console.log('❌ Неожиданный успех без данных');
        }

    } catch (error) {
        console.error('❌ Ошибка тестирования:', error.message);
    }
}

// Запуск тестов
testTelegramWebAppAuth(); 
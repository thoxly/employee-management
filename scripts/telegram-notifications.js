#!/usr/bin/env node

/**
 * Скрипт для отправки уведомлений через Telegram
 * 
 * Использование:
 * node scripts/telegram-notifications.js "Ваше сообщение"
 */

const https = require('https');
const fs = require('fs');

// Функция для загрузки переменных окружения из файла
function loadEnvFile(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex);
          const value = trimmedLine.substring(equalIndex + 1);
          env[key] = value;
        }
      }
    }
  }
  return env;
}

// Загружаем переменные окружения
const env = loadEnvFile('env.production');

const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || env.BOT_TOKEN;
const CHAT_ID = env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN) {
  console.error('❌ Не найден TELEGRAM_BOT_TOKEN или BOT_TOKEN в переменных окружения');
  process.exit(1);
}

if (!CHAT_ID) {
  console.error('❌ Не найден TELEGRAM_CHAT_ID в переменных окружения');
  process.exit(1);
}

function sendTelegramMessage(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.ok) {
            console.log('✅ Уведомление отправлено успешно');
            resolve(response);
          } else {
            console.error('❌ Ошибка отправки:', response.description);
            reject(new Error(response.description));
          }
        } catch (error) {
          console.error('❌ Ошибка парсинга ответа:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка запроса:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Основная функция
async function main() {
  const message = process.argv[2];
  
  if (!message) {
    console.error('❌ Не указано сообщение для отправки');
    console.log('Использование: node scripts/telegram-notifications.js "Ваше сообщение"');
    process.exit(1);
  }

  try {
    await sendTelegramMessage(message);
  } catch (error) {
    console.error('❌ Не удалось отправить уведомление:', error.message);
    process.exit(1);
  }
}

// Экспортируем функцию для использования в других скриптах
module.exports = { sendTelegramMessage };

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main();
} 
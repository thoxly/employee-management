#!/usr/bin/env node

/**
 * Скрипт для автоматической настройки переменных окружения
 * Использование: node scripts/setup-env.js [environment]
 * 
 * Поддерживаемые среды:
 * - development (локальная разработка)
 * - staging (dev.прибыл.рф)
 * - production (прибыл.рф)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Конфигурации для разных сред
const environments = {
  development: {
    name: 'Локальная разработка',
    root: {
      NODE_ENV: 'development',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_HOST: 'localhost',
      DB_PORT: '5433',
      DB_NAME: 'employee_management',
      JWT_ACCESS_SECRET: 'Kx4$$PZ@qvZs6j!87TyLx1G2PZw3P^dNj',
      JWT_REFRESH_SECRET: 'tR!8Vm1cQ9pU^Xs2zF3@eA%GWy6Ld*oB',
      FRONTEND_URL: 'https://2adbc769f69a.ngrok.app',
      BACKEND_URL: 'http://localhost:3003',
      TELEGRAM_WEBHOOK_URL: 'https://2adbc769f69a.ngrok.app',
      MINI_APP_URL: 'https://2adbc769f69a.ngrok.app',
      BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E',
      ALLOWED_ORIGINS: 'http://localhost:3002,http://localhost:3003,https://2adbc769f69a.ngrok.app'
    },
    frontend: {
      FRONTEND_PORT: '3002',
      REACT_APP_API_URL: 'http://localhost:3003/api',
      REACT_APP_TELEGRAM_API_URL: 'https://athletes-cache-legitimate-dubai.trycloudflare.com',
      REACT_APP_YANDEX_MAP_JS_API: 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734',
      REACT_APP_YANDEX_MAPS_API_KEY: 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734',
      REACT_APP_GEOSUGGEST: '32cdad67-70b0-4cfb-a47b-4eb4f0908952'
    },
    backend: {
      PORT: '3003',
      DATABASE_URL: 'postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'TH5RQZAX0PTIJZD9Z7M8',
      AWS_SECRET_ACCESS_KEY: 'JSRlgPx12dTEthKq0rdWEY9Hn0hxLYNhYsdzSVc1',
      S3_BUCKET_NAME: 'arrive-fr-reports',
      S3_ENDPOINT: 'https://s3.regru.cloud',
      S3_FORCE_PATH_STYLE: 'false',
      BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E'
    },
    bot: {
      PORT: '3004',
      BACKEND_URL: 'http://backend:3003',
      MINI_APP_URL: '${FRONTEND_URL}'
    }
  },
  
  staging: {
    name: 'Staging (dev.прибыл.рф)',
    root: {
      NODE_ENV: 'development',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_HOST: 'db',
      DB_PORT: '5432',
      DB_NAME: 'employee_management_dev',
      JWT_ACCESS_SECRET: 'Kx4$$PZ@qvZs6j!87TyLx1G2PZw3P^dNj',
      JWT_REFRESH_SECRET: 'tR!8Vm1cQ9pU^Xs2zF3@eA%GWy6Ld*oB',
      FRONTEND_URL: 'https://dev.прибыл.рф',
      BACKEND_URL: 'https://dev.прибыл.рф/api',
      TELEGRAM_WEBHOOK_URL: 'https://dev.прибыл.рф/api/telegram/webhook',
      MINI_APP_URL: 'https://dev.прибыл.рф',
      BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E',
      ALLOWED_ORIGINS: 'https://dev.прибыл.рф'
    },
    frontend: {
      FRONTEND_PORT: '3002',
      REACT_APP_API_URL: 'https://dev.прибыл.рф/api',
      REACT_APP_TELEGRAM_API_URL: 'https://dev.прибыл.рф',
      REACT_APP_YANDEX_MAP_JS_API: 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734',
      REACT_APP_YANDEX_MAPS_API_KEY: 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734',
      REACT_APP_GEOSUGGEST: '32cdad67-70b0-4cfb-a47b-4eb4f0908952'
    },
    backend: {
      PORT: '3003',
      DATABASE_URL: 'postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'TH5RQZAX0PTIJZD9Z7M8',
      AWS_SECRET_ACCESS_KEY: 'JSRlgPx12dTEthKq0rdWEY9Hn0hxLYNhYsdzSVc1',
      S3_BUCKET_NAME: 'arrive-fr-reports',
      S3_ENDPOINT: 'https://s3.regru.cloud',
      S3_FORCE_PATH_STYLE: 'false',
      BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E'
    },
    bot: {
      PORT: '3004',
      BACKEND_URL: 'http://backend:3003',
      MINI_APP_URL: '${FRONTEND_URL}'
    }
  },
  
  production: {
    name: 'Продакшен (прибыл.рф)',
    root: {
      NODE_ENV: 'production',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_HOST: 'db',
      DB_PORT: '5432',
      DB_NAME: 'employee_management',
      JWT_ACCESS_SECRET: 'Kx4$$PZ@qvZs6j!87TyLx1G2PZw3P^dNj',
      JWT_REFRESH_SECRET: 'tR!8Vm1cQ9pU^Xs2zF3@eA%GWy6Ld*oB',
      FRONTEND_URL: 'https://прибыл.рф',
      BACKEND_URL: 'https://прибыл.рф/api',
      TELEGRAM_WEBHOOK_URL: 'https://прибыл.рф/api/telegram/webhook',
      MINI_APP_URL: 'https://прибыл.рф',
      BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E',
      ALLOWED_ORIGINS: 'https://прибыл.рф',
      PRODUCTION_HOST: '89.111.169.243',
      PRODUCTION_USER: 'root',
      PRODUCTION_SSH_PRIVATE_KEY: '-----BEGIN OPENSSH PRIVATE KEY-----\n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\n-----END OPENSSH PRIVATE KEY-----',
      TELEGRAM_BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E',
      TELEGRAM_CHAT_ID: '298161005'
    },
    frontend: {
      FRONTEND_PORT: '3000',
      REACT_APP_API_URL: 'https://прибыл.рф/api',
      REACT_APP_TELEGRAM_API_URL: 'https://прибыл.рф',
      REACT_APP_YANDEX_MAP_JS_API: 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734',
      REACT_APP_YANDEX_MAPS_API_KEY: 'e7b69b16-3c2b-4dfa-a2eb-563f03c35734',
      REACT_APP_GEOSUGGEST: '32cdad67-70b0-4cfb-a47b-4eb4f0908952'
    },
    backend: {
      PORT: '3001',
      DATABASE_URL: 'postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'TH5RQZAX0PTIJZD9Z7M8',
      AWS_SECRET_ACCESS_KEY: 'JSRlgPx12dTEthKq0rdWEY9Hn0hxLYNhYsdzSVc1',
      S3_BUCKET_NAME: 'arrive-fr-reports',
      S3_ENDPOINT: 'https://s3.regru.cloud',
      S3_FORCE_PATH_STYLE: 'false',
      BOT_TOKEN: '8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E'
    },
    bot: {
      PORT: '3004',
      BACKEND_URL: 'http://backend:3001',
      MINI_APP_URL: '${FRONTEND_URL}'
    }
  }
};

// Функция для записи .env файла
function writeEnvFile(filePath, variables) {
  const content = Object.entries(variables)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Создан файл: ${filePath}`);
}

// Функция для генерации безопасных ключей
function generateSecureKeys() {
  return {
    JWT_ACCESS_SECRET: crypto.randomBytes(64).toString('hex'),
    JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
    DB_PASSWORD: crypto.randomBytes(32).toString('hex')
  };
}

// Основная функция
function setupEnvironment(envName) {
  const env = environments[envName];
  if (!env) {
    console.error(`❌ Неизвестная среда: ${envName}`);
    console.log('Доступные среды: development, staging, production');
    process.exit(1);
  }

  console.log(`🚀 Настройка среды: ${env.name}\n`);

  // Генерируем безопасные ключи для продакшена
  let secureKeys = {};
  if (envName === 'production') {
    secureKeys = generateSecureKeys();
    console.log('🔐 Сгенерированы безопасные ключи для продакшена');
  }

  // Создаем корневой .env файл
  const rootEnv = { ...env.root, ...secureKeys };
  writeEnvFile('.env', rootEnv);

  // Создаем .env файлы для каждого компонента
  writeEnvFile('frontend/.env', env.frontend);
  writeEnvFile('backend/.env', env.backend);
  writeEnvFile('bot/.env', env.bot);

  console.log('\n🎉 Настройка завершена!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Проверьте .env файлы - все переменные уже настроены');
  console.log('2. Для локальной разработки обновите ngrok URL в .env файлах');
  console.log('3. Запустите проект с помощью Docker');
  
  if (envName === 'production') {
    console.log('\n⚠️  ВАЖНО для продакшена:');
    console.log('- Не коммитьте .env файлы в git');
    console.log('- Настройте SSL сертификаты');
    console.log('- Убедитесь, что домены настроены в nginx');
  }
}

// Обработка аргументов командной строки
const envName = process.argv[2] || 'development';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Использование: node scripts/setup-env.js [environment]');
  console.log('\nДоступные среды:');
  console.log('  development  - Локальная разработка (по умолчанию)');
  console.log('  staging      - Staging (dev.прибыл.рф)');
  console.log('  production   - Продакшен (прибыл.рф)');
  console.log('\nПримеры:');
  console.log('  node scripts/setup-env.js');
  console.log('  node scripts/setup-env.js development');
  console.log('  node scripts/setup-env.js staging');
  console.log('  node scripts/setup-env.js production');
  process.exit(0);
}

setupEnvironment(envName); 
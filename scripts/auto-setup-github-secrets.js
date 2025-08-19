#!/usr/bin/env node

/**
 * Скрипт для автоматического добавления секретов в GitHub
 * 
 * Использование:
 * node scripts/auto-setup-github-secrets.js [environment]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

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

// Маппинг переменных для разных окружений
const secretMappings = {
  production: {
    'DB_HOST': 'PROD_DB_HOST',
    'DB_PORT': 'PROD_DB_PORT',
    'DB_NAME': 'PROD_DB_NAME',
    'DB_USER': 'PROD_DB_USER',
    'DB_PASSWORD': 'PROD_DB_PASSWORD',
    'JWT_ACCESS_SECRET': 'PROD_JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET': 'PROD_JWT_REFRESH_SECRET',
    'BOT_TOKEN': 'PROD_BOT_TOKEN',
    'TELEGRAM_WEBHOOK_URL': 'PROD_TELEGRAM_WEBHOOK_URL',
    'MINI_APP_URL': 'PROD_MINI_APP_URL',
    'FRONTEND_URL': 'PROD_FRONTEND_URL',
    'BACKEND_URL': 'PROD_BACKEND_URL',
    'ALLOWED_ORIGINS': 'PROD_ALLOWED_ORIGINS',
    'REACT_APP_YANDEX_MAP_JS_API': 'PROD_YANDEX_MAP_JS_API',
    'REACT_APP_YANDEX_MAPS_API_KEY': 'PROD_YANDEX_MAPS_API_KEY',
    'REACT_APP_GEOSUGGEST': 'PROD_GEOSUGGEST',
    'AWS_REGION': 'PROD_AWS_REGION',
    'AWS_ACCESS_KEY_ID': 'PROD_AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY': 'PROD_AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME': 'PROD_S3_BUCKET_NAME',
    'S3_ENDPOINT': 'PROD_S3_ENDPOINT',
    'S3_FORCE_PATH_STYLE': 'PROD_S3_FORCE_PATH_STYLE',
    'PRODUCTION_HOST': 'PROD_PRODUCTION_HOST',
    'PRODUCTION_USER': 'PROD_PRODUCTION_USER',
    'PRODUCTION_SSH_PRIVATE_KEY': 'PROD_PRODUCTION_SSH_PRIVATE_KEY',
    'TELEGRAM_BOT_TOKEN': 'PROD_TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID': 'PROD_TELEGRAM_CHAT_ID'
  }
};

function addSecretToGitHub(secretName, secretValue) {
  try {
    // Экранируем специальные символы в значении
    const escapedValue = secretValue.replace(/"/g, '\\"');
    
    const command = `gh secret set ${secretName} --body "${escapedValue}"`;
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function main() {
  const environment = process.argv[2];
  
  if (!environment) {
    error('Укажите окружение: production');
    log('\nИспользование:', 'blue');
    log('node scripts/auto-setup-github-secrets.js production', 'cyan');
    process.exit(1);
  }
  
  if (!['production'].includes(environment)) {
    error('Поддерживается только production окружение');
    process.exit(1);
  }
  
  // Проверяем, что GitHub CLI установлен и авторизован
  try {
    execSync('gh auth status', { stdio: 'pipe' });
  } catch (error) {
    error('GitHub CLI не авторизован. Выполните: gh auth login');
    process.exit(1);
  }
  
  const envFile = path.join(process.cwd(), `env.${environment}`);
  
  if (!fs.existsSync(envFile)) {
    error(`Файл ${envFile} не найден`);
    process.exit(1);
  }
  
  info(`Обрабатываю файл: ${envFile}`);
  
  const env = loadEnvFile(envFile);
  const mapping = secretMappings[environment];
  
  if (!mapping) {
    error(`Неизвестное окружение: ${environment}`);
    process.exit(1);
  }
  
  log(`\n${colors.bright}Добавляю секреты в GitHub для окружения: ${environment.toUpperCase()}${colors.reset}`, 'cyan');
  log('='.repeat(60), 'cyan');
  
  let successCount = 0;
  let errorCount = 0;
  
  Object.entries(mapping).forEach(([envKey, secretName]) => {
    const value = env[envKey];
    
    if (!value) {
      warning(`Пропускаю ${secretName}: значение не найдено для ${envKey}`);
      return;
    }
    
    // Маскируем чувствительные значения для вывода
    const maskedValue = secretName.includes('PASSWORD') || 
                       secretName.includes('SECRET') || 
                       secretName.includes('TOKEN') || 
                       secretName.includes('KEY') 
                       ? '*'.repeat(8) 
                       : value;
    
    log(`Добавляю ${secretName}: ${maskedValue}`, 'green');
    
    if (addSecretToGitHub(secretName, value)) {
      success(`✅ ${secretName} добавлен успешно`);
      successCount++;
    } else {
      error(`❌ Ошибка добавления ${secretName}`);
      errorCount++;
    }
  });
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`Результат: ${successCount} успешно, ${errorCount} ошибок`, 'yellow');
  
  if (errorCount === 0) {
    success('Все секреты успешно добавлены в GitHub!');
  } else {
    warning(`Некоторые секреты не удалось добавить. Проверьте права доступа к репозиторию.`);
  }
}

if (require.main === module) {
  main();
} 
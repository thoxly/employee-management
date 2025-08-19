#!/usr/bin/env node

/**
 * Скрипт для настройки GitHub Secrets на основе .env файлов
 * 
 * Использование:
 * node scripts/setup-github-secrets.js [environment]
 * 
 * environment: development, staging, production
 */

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
  },
  staging: {
    'DB_HOST': 'STAGING_DB_HOST',
    'DB_PORT': 'STAGING_DB_PORT',
    'DB_NAME': 'STAGING_DB_NAME',
    'DB_USER': 'STAGING_DB_USER',
    'DB_PASSWORD': 'STAGING_DB_PASSWORD',
    'JWT_ACCESS_SECRET': 'STAGING_JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET': 'STAGING_JWT_REFRESH_SECRET',
    'BOT_TOKEN': 'STAGING_BOT_TOKEN',
    'TELEGRAM_WEBHOOK_URL': 'STAGING_TELEGRAM_WEBHOOK_URL',
    'MINI_APP_URL': 'STAGING_MINI_APP_URL',
    'FRONTEND_URL': 'STAGING_FRONTEND_URL',
    'BACKEND_URL': 'STAGING_BACKEND_URL',
    'ALLOWED_ORIGINS': 'STAGING_ALLOWED_ORIGINS',
    'REACT_APP_YANDEX_MAP_JS_API': 'STAGING_YANDEX_MAP_JS_API',
    'REACT_APP_YANDEX_MAPS_API_KEY': 'STAGING_YANDEX_MAPS_API_KEY',
    'REACT_APP_GEOSUGGEST': 'STAGING_GEOSUGGEST',
    'AWS_REGION': 'STAGING_AWS_REGION',
    'AWS_ACCESS_KEY_ID': 'STAGING_AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY': 'STAGING_AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME': 'STAGING_S3_BUCKET_NAME',
    'S3_ENDPOINT': 'STAGING_S3_ENDPOINT',
    'S3_FORCE_PATH_STYLE': 'STAGING_S3_FORCE_PATH_STYLE'
  },
  development: {
    'DB_HOST': 'DEV_DB_HOST',
    'DB_PORT': 'DEV_DB_PORT',
    'DB_NAME': 'DEV_DB_NAME',
    'DB_USER': 'DEV_DB_USER',
    'DB_PASSWORD': 'DEV_DB_PASSWORD',
    'JWT_ACCESS_SECRET': 'DEV_JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET': 'DEV_JWT_REFRESH_SECRET',
    'BOT_TOKEN': 'DEV_BOT_TOKEN',
    'TELEGRAM_WEBHOOK_URL': 'DEV_TELEGRAM_WEBHOOK_URL',
    'MINI_APP_URL': 'DEV_MINI_APP_URL',
    'FRONTEND_URL': 'DEV_FRONTEND_URL',
    'BACKEND_URL': 'DEV_BACKEND_URL',
    'ALLOWED_ORIGINS': 'DEV_ALLOWED_ORIGINS',
    'REACT_APP_YANDEX_MAP_JS_API': 'DEV_YANDEX_MAP_JS_API',
    'REACT_APP_YANDEX_MAPS_API_KEY': 'DEV_YANDEX_MAPS_API_KEY',
    'REACT_APP_GEOSUGGEST': 'DEV_GEOSUGGEST',
    'AWS_REGION': 'DEV_AWS_REGION',
    'AWS_ACCESS_KEY_ID': 'DEV_AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY': 'DEV_AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME': 'DEV_S3_BUCKET_NAME',
    'S3_ENDPOINT': 'DEV_S3_ENDPOINT',
    'S3_FORCE_PATH_STYLE': 'DEV_S3_FORCE_PATH_STYLE'
  }
};

function parseEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=');
        }
      }
    });
    
    return env;
  } catch (err) {
    error(`Не удалось прочитать файл ${filePath}: ${err.message}`);
    return null;
  }
}

function generateSecretsList(environment) {
  const envFile = path.join(process.cwd(), `env.${environment}`);
  const env = parseEnvFile(envFile);
  
  if (!env) {
    return null;
  }
  
  const mapping = secretMappings[environment];
  const secrets = {};
  
  Object.keys(mapping).forEach(envKey => {
    if (env[envKey]) {
      secrets[mapping[envKey]] = env[envKey];
    }
  });
  
  return secrets;
}

function generateGitHubSecretsCommands(environment) {
  const secrets = generateSecretsList(environment);
  
  if (!secrets) {
    return null;
  }
  
  log(`\n${colors.bright}GitHub Secrets для окружения: ${environment.toUpperCase()}${colors.reset}`, 'cyan');
  log('='.repeat(50), 'cyan');
  
  const commands = [];
  
  Object.entries(secrets).forEach(([secretName, value]) => {
    // Маскируем чувствительные значения
    const maskedValue = secretName.includes('PASSWORD') || 
                       secretName.includes('SECRET') || 
                       secretName.includes('TOKEN') || 
                       secretName.includes('KEY') 
                       ? '*'.repeat(8) 
                       : value;
    
    log(`${secretName}: ${maskedValue}`, 'green');
    commands.push(`gh secret set ${secretName} --body "${value}"`);
  });
  
  log('\n' + '='.repeat(50), 'cyan');
  log('Команды для добавления секретов в GitHub:', 'yellow');
  log('(Убедитесь, что у вас установлен GitHub CLI и вы авторизованы)', 'yellow');
  log('', 'yellow');
  
  commands.forEach(cmd => {
    log(cmd, 'magenta');
  });
  
  return commands;
}

function main() {
  const environment = process.argv[2];
  
  if (!environment) {
    error('Укажите окружение: development, staging или production');
    log('\nИспользование:', 'blue');
    log('node scripts/setup-github-secrets.js [environment]', 'cyan');
    process.exit(1);
  }
  
  if (!['development', 'staging', 'production'].includes(environment)) {
    error('Неверное окружение. Используйте: development, staging или production');
    process.exit(1);
  }
  
  const envFile = path.join(process.cwd(), `env.${environment}`);
  
  if (!fs.existsSync(envFile)) {
    error(`Файл ${envFile} не найден`);
    process.exit(1);
  }
  
  info(`Обрабатываю файл: ${envFile}`);
  
  const commands = generateGitHubSecretsCommands(environment);
  
  if (!commands) {
    error('Не удалось сгенерировать команды');
    process.exit(1);
  }
  
  log('\n' + '='.repeat(50), 'cyan');
  log('Дополнительные секреты, которые нужно добавить вручную:', 'yellow');
  log('', 'yellow');
  
  const additionalSecrets = {
    [`${environment.toUpperCase()}_HOST`]: 'IP адрес или домен сервера',
    [`${environment.toUpperCase()}_USER`]: 'Пользователь для SSH подключения',
    [`${environment.toUpperCase()}_SSH_PRIVATE_KEY`]: 'Приватный SSH ключ',
  };
  
  Object.entries(additionalSecrets).forEach(([secretName, description]) => {
    log(`${secretName}: ${description}`, 'yellow');
  });
  
  if (environment === 'production') {
    log('SLACK_WEBHOOK_URL: URL webhook для Slack уведомлений', 'yellow');
  }
  
  success('Готово! Используйте команды выше для добавления секретов в GitHub.');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSecretsList,
  generateGitHubSecretsCommands
}; 
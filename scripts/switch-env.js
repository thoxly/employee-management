#!/usr/bin/env node

/**
 * Скрипт для быстрого переключения между средами
 * Использование: node scripts/switch-env.js [environment]
 * 
 * Этот скрипт:
 * 1. Создает резервную копию текущих .env файлов
 * 2. Настраивает новую среду
 * 3. Показывает инструкции по настройке
 */

const { execSync } = require('child_process');
const path = require('path');

const environments = {
  development: {
    name: 'Локальная разработка',
    description: 'Локальная разработка с ngrok/cloudflare туннелями'
  },
  staging: {
    name: 'Staging',
    description: 'Dev среда на dev.прибыл.рф'
  },
  production: {
    name: 'Продакшен',
    description: 'Продакшен среда на прибыл.рф'
  }
};

function switchEnvironment(envName) {
  const env = environments[envName];
  if (!env) {
    console.error(`❌ Неизвестная среда: ${envName}`);
    console.log('Доступные среды: development, staging, production');
    process.exit(1);
  }

  console.log(`🔄 Переключение на среду: ${env.name}`);
  console.log(`📝 ${env.description}\n`);

  try {
    // 1. Создаем резервную копию
    console.log('🔒 Создание резервной копии текущих .env файлов...');
    execSync('node scripts/backup-env.js', { stdio: 'inherit' });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Настраиваем новую среду
    console.log('⚙️  Настройка новой среды...');
    execSync(`node scripts/setup-env.js ${envName}`, { stdio: 'inherit' });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Показываем специфичные инструкции
    showEnvironmentInstructions(envName);
    
  } catch (error) {
    console.error('❌ Ошибка при переключении среды:', error.message);
    process.exit(1);
  }
}

function showEnvironmentInstructions(envName) {
  console.log('📋 Инструкции по настройке:\n');
  
  switch (envName) {
    case 'development':
      console.log('🔧 Для локальной разработки:');
      console.log('1. Запустите ngrok: ngrok http 3002');
      console.log('2. Запустите cloudflare tunnel для backend');
      console.log('3. Обновите TELEGRAM_WEBHOOK_URL в .env');
      console.log('4. Обновите REACT_APP_TELEGRAM_API_URL в frontend/.env');
      console.log('5. Запустите: docker-compose up');
      break;
      
    case 'staging':
      console.log('🔧 Для staging среды:');
      console.log('1. Убедитесь, что dev.прибыл.рф настроен в nginx');
      console.log('2. Настройте SSL сертификаты');
      console.log('3. Обновите BOT_TOKEN в .env файлах');
      console.log('4. Настройте ключи Яндекс Карт');
      console.log('5. Запустите: docker-compose -f docker-compose.staging.yml up -d');
      break;
      
    case 'production':
      console.log('🔧 Для продакшена:');
      console.log('1. Убедитесь, что прибыл.рф настроен в nginx');
      console.log('2. Настройте SSL сертификаты');
      console.log('3. Сохраните сгенерированные ключи в безопасном месте');
      console.log('4. Обновите BOT_TOKEN в .env файлах');
      console.log('5. Настройте ключи Яндекс Карт и AWS S3');
      console.log('6. Запустите: docker-compose -f docker-compose.prod.yml up -d');
      break;
  }
  
  console.log('\n💡 Для отката используйте резервную копию из папки env-backup-*');
}

// Обработка аргументов командной строки
const envName = process.argv[2];

if (!envName || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Использование: node scripts/switch-env.js [environment]');
  console.log('\nДоступные среды:');
  Object.entries(environments).forEach(([key, env]) => {
    console.log(`  ${key.padEnd(12)} - ${env.name}: ${env.description}`);
  });
  console.log('\nПримеры:');
  console.log('  node scripts/switch-env.js development');
  console.log('  node scripts/switch-env.js staging');
  console.log('  node scripts/switch-env.js production');
  process.exit(0);
}

switchEnvironment(envName); 
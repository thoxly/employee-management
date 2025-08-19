#!/usr/bin/env node

/**
 * Скрипт для полной настройки Docker окружения
 * Использование: node scripts/docker-setup.js [environment]
 * 
 * Этот скрипт:
 * 1. Настраивает переменные окружения
 * 2. Собирает Docker образы
 * 3. Запускает контейнеры
 */

const { execSync } = require('child_process');

const environments = {
  development: {
    name: 'Локальная разработка',
    composeFile: 'docker-compose.yml',
    description: 'Локальная разработка с hot reload'
  },
  staging: {
    name: 'Staging',
    composeFile: 'docker-compose.staging.yml',
    description: 'Staging среда на dev.прибыл.рф'
  },
  production: {
    name: 'Продакшен',
    composeFile: 'docker-compose.prod.yml',
    description: 'Продакшен среда на прибыл.рф'
  }
};

function dockerSetup(envName) {
  const env = environments[envName];
  if (!env) {
    console.error(`❌ Неизвестная среда: ${envName}`);
    console.log('Доступные среды: development, staging, production');
    process.exit(1);
  }

  console.log(`🐳 Настройка Docker для среды: ${env.name}`);
  console.log(`📝 ${env.description}\n`);

  try {
    // 1. Настраиваем переменные окружения
    console.log('⚙️  Настройка переменных окружения...');
    execSync(`node scripts/setup-env.js ${envName}`, { stdio: 'inherit' });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Останавливаем существующие контейнеры
    console.log('🛑 Остановка существующих контейнеров...');
    try {
      execSync('docker-compose down', { stdio: 'inherit' });
    } catch (e) {
      console.log('ℹ️  Нет запущенных контейнеров для остановки');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Собираем образы
    console.log('🔨 Сборка Docker образов...');
    execSync(`docker-compose -f ${env.composeFile} build`, { stdio: 'inherit' });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Запускаем контейнеры
    console.log('🚀 Запуск контейнеров...');
    if (envName === 'development') {
      execSync(`docker-compose -f ${env.composeFile} up`, { stdio: 'inherit' });
    } else {
      execSync(`docker-compose -f ${env.composeFile} up -d`, { stdio: 'inherit' });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 5. Показываем статус
    console.log('📊 Статус контейнеров:');
    execSync(`docker-compose -f ${env.composeFile} ps`, { stdio: 'inherit' });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 6. Показываем инструкции
    showDockerInstructions(envName, env);
    
  } catch (error) {
    console.error('❌ Ошибка при настройке Docker:', error.message);
    process.exit(1);
  }
}

function showDockerInstructions(envName, env) {
  console.log('📋 Инструкции по работе с Docker:\n');
  
  console.log('🔧 Основные команды:');
  console.log(`  Запуск: docker-compose -f ${env.composeFile} up -d`);
  console.log(`  Остановка: docker-compose -f ${env.composeFile} down`);
  console.log(`  Логи: docker-compose -f ${env.composeFile} logs -f`);
  console.log(`  Пересборка: docker-compose -f ${env.composeFile} up --build -d`);
  console.log(`  Статус: docker-compose -f ${env.composeFile} ps`);
  
  console.log('\n🔍 Полезные команды:');
  console.log('  Логи конкретного сервиса: docker-compose logs -f [service_name]');
  console.log('  Войти в контейнер: docker-compose exec [service_name] sh');
  console.log('  Очистить все контейнеры: docker system prune -a');
  
  switch (envName) {
    case 'development':
      console.log('\n💡 Для разработки:');
      console.log('- Изменения в коде автоматически перезагружаются');
      console.log('- Логи выводятся в реальном времени');
      console.log('- Для остановки нажмите Ctrl+C');
      break;
      
    case 'staging':
      console.log('\n💡 Для staging:');
      console.log('- Контейнеры запущены в фоновом режиме');
      console.log('- Проверьте доступность на dev.прибыл.рф');
      console.log('- Логи: docker-compose -f docker-compose.staging.yml logs -f');
      break;
      
    case 'production':
      console.log('\n💡 Для продакшена:');
      console.log('- Контейнеры запущены в фоновом режиме');
      console.log('- Автоматический перезапуск при сбоях');
      console.log('- Проверьте доступность на прибыл.рф');
      console.log('- Логи: docker-compose -f docker-compose.prod.yml logs -f');
      break;
  }
}

// Обработка аргументов командной строки
const envName = process.argv[2];

if (!envName || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Использование: node scripts/docker-setup.js [environment]');
  console.log('\nДоступные среды:');
  Object.entries(environments).forEach(([key, env]) => {
    console.log(`  ${key.padEnd(12)} - ${env.name}: ${env.description}`);
  });
  console.log('\nПримеры:');
  console.log('  node scripts/docker-setup.js development');
  console.log('  node scripts/docker-setup.js staging');
  console.log('  node scripts/docker-setup.js production');
  process.exit(0);
}

dockerSetup(envName); 
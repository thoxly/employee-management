#!/usr/bin/env node

/**
 * Скрипт для генерации безопасных секретных ключей
 * Использование: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Генерация безопасных секретных ключей\n');

// Генерация JWT секретов
const accessSecret = crypto.randomBytes(64).toString('hex');
const refreshSecret = crypto.randomBytes(64).toString('hex');

// Генерация случайного пароля для БД
const dbPassword = crypto.randomBytes(32).toString('hex');

console.log('✅ JWT Access Secret:');
console.log(accessSecret);
console.log('\n✅ JWT Refresh Secret:');
console.log(refreshSecret);
console.log('\n✅ Database Password:');
console.log(dbPassword);

console.log('\n📋 Скопируйте эти значения в соответствующие .env файлы:');
console.log('\nJWT_ACCESS_SECRET=' + accessSecret);
console.log('JWT_REFRESH_SECRET=' + refreshSecret);
console.log('DB_PASSWORD=' + dbPassword);

console.log('\n⚠️  ВАЖНО: Храните эти ключи в безопасном месте!');
console.log('⚠️  Не коммитьте их в git репозиторий!'); 
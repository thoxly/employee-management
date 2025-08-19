#!/usr/bin/env node

/**
 * Скрипт для создания резервных копий существующих .env файлов
 * Использование: node scripts/backup-env.js
 */

const fs = require('fs');
const path = require('path');

const envFiles = [
  '.env',
  'frontend/.env',
  'backend/.env',
  'bot/.env'
];

function backupEnvFiles() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `env-backup-${timestamp}`;
  
  console.log(`🔒 Создание резервной копии .env файлов в папку: ${backupDir}\n`);
  
  // Создаем папку для резервной копии
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  let backedUpCount = 0;
  
  envFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(backupDir, filePath);
      const backupDirPath = path.dirname(backupPath);
      
      // Создаем подпапки если нужно
      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }
      
      // Копируем файл
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ Резервная копия: ${filePath} → ${backupPath}`);
      backedUpCount++;
    } else {
      console.log(`⚠️  Файл не найден: ${filePath}`);
    }
  });
  
  console.log(`\n🎉 Резервная копия завершена!`);
  console.log(`📁 Всего скопировано файлов: ${backedUpCount}`);
  console.log(`📂 Папка резервной копии: ${backupDir}`);
  console.log(`\n💡 Для восстановления используйте: cp -r ${backupDir}/* ./`);
}

// Проверяем, есть ли что-то для резервного копирования
const existingFiles = envFiles.filter(filePath => fs.existsSync(filePath));

if (existingFiles.length === 0) {
  console.log('ℹ️  Нет существующих .env файлов для резервного копирования');
  process.exit(0);
}

backupEnvFiles(); 
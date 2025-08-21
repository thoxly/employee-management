#!/bin/bash

# Скрипт для переключения на production среду

set -e

echo "🔄 Переключение на production среду..."

# Останавливаем staging среду
echo "🛑 Останавливаем staging среду..."
docker compose -f docker-compose.staging.yml down 2>/dev/null || true

# Запускаем production среду
echo "🚀 Запускаем production среду..."
docker compose up -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус сервисов:"
docker compose ps

echo ""
echo "✅ Переключение на production завершено!"
echo "🌐 Доступно по адресу: https://прибыл.рф" 
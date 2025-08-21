#!/bin/bash

# Скрипт для переключения на dev среду

set -e

echo "🔄 Переключение на dev среду..."

# Останавливаем все другие среды
echo "🛑 Останавливаем другие среды..."
docker compose down 2>/dev/null || true
docker compose -f docker-compose.staging.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Запускаем dev среду
echo "🚀 Запускаем dev среду..."
./scripts/start-dev.sh

echo ""
echo "✅ Переключение на dev завершено!"
echo "🌐 Доступно по адресу: http://dev.прибыл.рф"
echo "🔥 Hot reload включен - изменения будут автоматически применяться!" 
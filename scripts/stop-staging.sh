#!/bin/bash

# Скрипт для остановки staging среды

set -e

echo "🛑 Остановка staging среды..."

# Останавливаем staging среду
docker compose -f docker-compose.staging.yml down

echo "✅ Staging среда остановлена!"

# Показываем статус всех контейнеров
echo "📊 Статус всех контейнеров:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 
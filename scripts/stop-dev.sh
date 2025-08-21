#!/bin/bash

# Скрипт для остановки dev среды

set -e

echo "🛑 Остановка dev среды..."

# Останавливаем dev среду
docker compose -f docker-compose.dev.yml down

echo ""
echo "✅ Dev среда остановлена!"
echo ""
echo "Для запуска production используйте:"
echo "  ./scripts/switch-to-production.sh"
echo ""
echo "Для запуска staging используйте:"
echo "  ./scripts/switch-to-staging.sh" 
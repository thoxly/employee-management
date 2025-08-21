#!/bin/bash

# Скрипт для переключения на staging среду

set -e

echo "🔄 Переключение на staging среду..."

# Останавливаем production среду
echo "🛑 Останавливаем production среду..."
docker compose down 2>/dev/null || true

# Запускаем staging среду
echo "🚀 Запускаем staging среду..."
./scripts/start-staging.sh

echo ""
echo "✅ Переключение на staging завершено!"
echo "🌐 Доступно по адресу: https://dev.прибыл.рф" 
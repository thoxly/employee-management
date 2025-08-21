#!/bin/bash

# Скрипт для автоматического деплоя в dev среду
# Использование: ./scripts/deploy-dev.sh

set -e

echo "🚀 Starting development deployment..."

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.dev-server.yml" ]; then
    echo "❌ Error: docker-compose.dev-server.yml not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Останавливаем текущие контейнеры
echo "🛑 Stopping current containers..."
docker-compose -f docker-compose.dev-server.yml down || true

# Получаем последние изменения
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/dev

# Копируем переменные окружения
echo "🔧 Setting up environment variables..."
cp env.development-server .env.dev || true

# Собираем и запускаем контейнеры
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.dev-server.yml build --no-cache
docker-compose -f docker-compose.dev-server.yml up -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем статус
echo "🔍 Checking deployment status..."
docker-compose -f docker-compose.dev-server.yml ps

# Проверяем доступность
echo "🌐 Testing application availability..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed, but continuing..."
fi

echo "✅ Development deployment completed!"
echo "🌐 Application available at: https://dev.прибыл.рф"
echo "📊 Container status:"
docker-compose -f docker-compose.dev-server.yml ps 
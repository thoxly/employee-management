#!/bin/bash

# Скрипт для автоматического деплоя в staging среду
# Использование: ./scripts/deploy-staging.sh

set -e

echo "🚀 Starting staging deployment..."

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.staging.yml" ]; then
    echo "❌ Error: docker-compose.staging.yml not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Останавливаем текущие контейнеры
echo "🛑 Stopping current containers..."
docker-compose -f docker-compose.staging.yml down || true

# Получаем последние изменения
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/staging

# Копируем переменные окружения
echo "🔧 Setting up environment variables..."
cp env.staging .env.staging || true

# Собираем и запускаем контейнеры
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем статус
echo "🔍 Checking deployment status..."
docker-compose -f docker-compose.staging.yml ps

# Проверяем доступность
echo "🌐 Testing application availability..."
if curl -f https://staging.прибыл.рф/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed, but continuing..."
fi

echo "✅ Staging deployment completed!"
echo "🌐 Application available at: https://staging.прибыл.рф"
echo "📊 Container status:"
docker-compose -f docker-compose.staging.yml ps 
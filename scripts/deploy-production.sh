#!/bin/bash

# Скрипт для автоматического деплоя в production среду
# Использование: ./scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Проверяем, что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Останавливаем текущие контейнеры
echo "🛑 Stopping current containers..."
docker-compose down || true

# Получаем последние изменения
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/main

# Копируем переменные окружения
echo "🔧 Setting up environment variables..."
cp env.production .env.prod || true

# Собираем и запускаем контейнеры
echo "🔨 Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем статус
echo "🔍 Checking deployment status..."
docker-compose ps

# Проверяем доступность
echo "🌐 Testing application availability..."
if curl -f https://прибыл.рф/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed, but continuing..."
fi

echo "✅ Production deployment completed!"
echo "🌐 Application available at: https://прибыл.рф"
echo "📊 Container status:"
docker-compose ps 
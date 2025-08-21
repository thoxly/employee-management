#!/bin/bash

# Скрипт для проверки подключения к серверу

SERVER_IP="89.111.169.243"
SERVER_USER="root"
PROJECT_PATH="/opt/employee-management"

echo "🔍 Проверка подключения к серверу $SERVER_IP..."

# Проверяем SSH подключение
echo "📡 Проверка SSH подключения..."
if ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "✅ SSH подключение работает"
else
    echo "❌ SSH подключение не работает"
    echo "Проверьте:"
    echo "  - SSH ключи настроены"
    echo "  - Сервер доступен"
    echo "  - Пользователь $SERVER_USER существует"
    exit 1
fi

# Проверяем наличие проекта
echo "📁 Проверка проекта на сервере..."
if ssh $SERVER_USER@$SERVER_IP "[ -d $PROJECT_PATH ]"; then
    echo "✅ Проект найден в $PROJECT_PATH"
else
    echo "❌ Проект не найден в $PROJECT_PATH"
    echo "Создайте папку или укажите правильный путь"
    exit 1
fi

# Проверяем Docker
echo "🐳 Проверка Docker на сервере..."
if ssh $SERVER_USER@$SERVER_IP "docker --version"; then
    echo "✅ Docker установлен"
else
    echo "❌ Docker не установлен"
    exit 1
fi

# Проверяем docker compose
echo "📦 Проверка Docker Compose..."
if ssh $SERVER_USER@$SERVER_IP "docker compose version"; then
    echo "✅ Docker Compose работает"
else
    echo "❌ Docker Compose не работает"
    exit 1
fi

# Проверяем порты
echo "🔌 Проверка портов на сервере..."
ssh $SERVER_USER@$SERVER_IP "netstat -tlnp | grep -E ':(80|443|3002|3003|3004)' || echo 'Порты свободны'"

echo ""
echo "✅ Сервер готов к развертыванию staging!"
echo ""
echo "Для развертывания выполните:"
echo "  ./scripts/deploy-staging-to-server.sh" 
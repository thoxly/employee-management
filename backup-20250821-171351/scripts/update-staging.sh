#!/bin/bash

# Скрипт для быстрого обновления staging конфигурации на сервере

set -e

SERVER_IP="89.111.169.243"
SERVER_USER="root"
PROJECT_PATH="/opt/employee-management"

echo "🔄 Обновление staging конфигурации на сервере..."

# Копируем обновленные файлы
echo "📤 Копируем обновленные файлы..."
scp docker-compose.staging.yml $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp nginx.staging.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp env.staging $SERVER_USER@$SERVER_IP:$PROJECT_PATH/

# Перезапускаем staging
echo "🔄 Перезапускаем staging среду..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml down"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml up -d"

# Ждем запуска
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус сервисов:"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml ps"

echo ""
echo "✅ Staging обновлен!"
echo "🌐 Доступен по адресу: http://dev.прибыл.рф"
echo ""
echo "Для проверки логов:"
echo "  ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml logs -f'" 
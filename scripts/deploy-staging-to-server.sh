#!/bin/bash

# Скрипт для развертывания staging среды на сервере
# Использование: ./scripts/deploy-staging-to-server.sh

set -e

SERVER_IP="89.111.169.243"
SERVER_USER="root"  # Измените на вашего пользователя
PROJECT_PATH="/opt/employee-management"

echo "🚀 Развертывание staging среды на сервере $SERVER_IP..."

# 1. Создаем staging конфигурацию на сервере
echo "📁 Создаем staging конфигурацию..."

# Копируем файлы на сервер
echo "📤 Копируем файлы на сервер..."
scp docker-compose.staging.yml $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp nginx.staging.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp env.staging $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp scripts/start-staging.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
scp scripts/stop-staging.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
scp scripts/debug-staging.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/

# 2. Настраиваем SSL сертификаты
echo "🔒 Настраиваем SSL сертификаты..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_PATH/ssl"

# Проверяем наличие сертификатов
if [ -f "./ssl/dev.прибыл.рф.crt" ] && [ -f "./ssl/dev.прибыл.рф.key" ]; then
    echo "📜 Копируем SSL сертификаты..."
    scp ssl/dev.прибыл.рф.crt $SERVER_USER@$SERVER_IP:$PROJECT_PATH/ssl/
    scp ssl/dev.прибыл.рф.key $SERVER_USER@$SERVER_IP:$PROJECT_PATH/ssl/
else
    echo "⚠️  SSL сертификаты не найдены локально"
    echo "Создайте сертификаты для dev.прибыл.рф в папке ./ssl/"
fi

# 3. Настраиваем права доступа
echo "🔐 Настраиваем права доступа..."
ssh $SERVER_USER@$SERVER_IP "chmod +x $PROJECT_PATH/scripts/*.sh"

# 4. Останавливаем production если запущен
echo "🛑 Останавливаем production среду..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose down 2>/dev/null || true"

# 5. Запускаем staging среду
echo "🚀 Запускаем staging среду..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/start-staging.sh"

echo ""
echo "✅ Развертывание завершено!"
echo "🌐 Staging доступен по адресу: https://dev.прибыл.рф"
echo ""
echo "Для проверки статуса на сервере выполните:"
echo "  ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && ./scripts/debug-staging.sh'"
echo ""
echo "Для остановки staging:"
echo "  ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && ./scripts/stop-staging.sh'" 
#!/bin/bash

# Скрипт для синхронизации кода с сервером
# Использование: ./scripts/sync-to-server.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}
SERVER_IP="89.111.169.243"
SERVER_USER="root"
PROJECT_PATH="/var/www/prod"

echo "🔄 Синхронизация кода с сервером (среда: $ENVIRONMENT)..."

SSH_KEY="~/.ssh/id_rsa_server"

# Проверяем подключение к серверу
echo "🔍 Проверяем подключение к серверу..."
if ! ssh -i $SSH_KEY -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Подключение успешно'" 2>/dev/null; then
    echo "❌ Не удается подключиться к серверу $SERVER_IP"
    exit 1
fi

echo "✅ Подключение к серверу успешно"

case $ENVIRONMENT in
    "dev")
        echo "📤 Синхронизация для dev среды..."
        
        # Создаем директорию scripts на сервере
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_PATH/scripts"
        
        # Загружаем основные файлы
        scp docker-compose.dev.yml $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        scp nginx.dev.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        scp env.development $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        
        # Загружаем скрипты
        scp scripts/manage-environments.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        scp scripts/start-dev.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        scp scripts/switch-to-dev.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        scp scripts/stop-dev.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        
        # Делаем скрипты исполняемыми
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "chmod +x $PROJECT_PATH/scripts/*.sh"
        
        echo "✅ Файлы синхронизированы для dev среды"
        ;;
        
    "staging")
        echo "📤 Синхронизация для staging среды..."
        
        # Загружаем staging файлы
        scp docker-compose.staging.yml $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        scp nginx.staging.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        scp env.staging $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        
        # Загружаем скрипты staging
        scp scripts/start-staging.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        scp scripts/switch-to-staging.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        scp scripts/stop-staging.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        
        echo "✅ Файлы синхронизированы для staging среды"
        ;;
        
    "prod"|"production")
        echo "📤 Синхронизация для production среды..."
        
        # Загружаем production файлы
        scp docker-compose.prod.yml $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        scp nginx.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        scp env.production $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
        
        # Загружаем скрипты production
        scp scripts/switch-to-production.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
        
        echo "✅ Файлы синхронизированы для production среды"
        ;;
        
    *)
        echo "❌ Неизвестная среда: $ENVIRONMENT"
        echo "Доступные среды: dev, staging, prod"
        exit 1
        ;;
esac

echo ""
echo "✅ Синхронизация завершена!"
echo ""
echo "🌐 Для запуска на сервере:"
echo "  ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && ./scripts/manage-environments.sh $ENVIRONMENT'" 
#!/bin/bash

# Скрипт для управления средами на сервере
# Использование: ./scripts/server-manage.sh [dev|staging|prod|status|logs]

set -e

ENVIRONMENT=${1:-status}
SERVER_IP="89.111.169.243"
SERVER_USER="root"
PROJECT_PATH="/var/www/prod"
SSH_KEY="~/.ssh/id_rsa_server"

echo "🌍 Управление сервером ($SERVER_IP)..."

# Проверяем подключение к серверу
echo "🔍 Проверяем подключение к серверу..."
if ! ssh -i $SSH_KEY -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Подключение успешно'" 2>/dev/null; then
    echo "❌ Не удается подключиться к серверу $SERVER_IP"
    echo "Проверьте SSH подключение"
    exit 1
fi

echo "✅ Подключение к серверу успешно"

case $ENVIRONMENT in
    "dev")
        echo "🔄 Переключение на dev среду на сервере..."
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/manage-environments-server.sh dev"
        echo ""
        echo "✅ Dev среда запущена на сервере!"
        echo "🌐 Доступно по адресу: http://dev.прибыл.рф"
        ;;
        
    "staging")
        echo "🔄 Переключение на staging среду на сервере..."
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/manage-environments-server.sh staging"
        echo ""
        echo "✅ Staging среда запущена на сервере!"
        echo "🌐 Доступно по адресу: https://dev.прибыл.рф"
        ;;
        
    "prod"|"production")
        echo "🔄 Переключение на production среду на сервере..."
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/manage-environments-server.sh prod"
        echo ""
        echo "✅ Production среда запущена на сервере!"
        echo "🌐 Доступно по адресу: https://прибыл.рф"
        ;;
        
    "status")
        echo "📊 Статус сред на сервере..."
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/manage-environments-server.sh status"
        ;;
        
    "logs")
        echo "📋 Логи сервера..."
        echo "Выберите среду для просмотра логов:"
        echo "  1. dev"
        echo "  2. staging"
        echo "  3. production"
        read -p "Выберите (1-3): " log_choice
        
        case $log_choice in
            1)
                echo "📋 Логи dev среды..."
                ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.dev.yml logs -f"
                ;;
            2)
                echo "📋 Логи staging среды..."
                ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml logs -f"
                ;;
            3)
                echo "📋 Логи production среды..."
                ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose logs -f"
                ;;
            *)
                echo "❌ Неверный выбор"
                exit 1
                ;;
        esac
        ;;
        
    "stop")
        echo "🛑 Остановка всех сред на сервере..."
        ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/manage-environments-server.sh stop"
        echo "✅ Все среды остановлены"
        ;;
        
    *)
        echo "❌ Неизвестная команда: $ENVIRONMENT"
        echo ""
        echo "Доступные команды:"
        echo "  ./scripts/server-manage.sh dev       - запустить dev среду"
        echo "  ./scripts/server-manage.sh staging   - запустить staging среду"
        echo "  ./scripts/server-manage.sh prod      - запустить production среду"
        echo "  ./scripts/server-manage.sh status    - показать статус"
        echo "  ./scripts/server-manage.sh logs      - показать логи"
        echo "  ./scripts/server-manage.sh stop      - остановить все среды"
        echo ""
        echo "🌐 Доступные URL:"
        echo "  🏠 Локальная разработка: http://localhost/"
        echo "  🌍 Серверная dev среда: http://dev.прибыл.рф"
        echo "  🧪 Staging: https://dev.прибыл.рф"
        echo "  🚀 Production: https://прибыл.рф"
        exit 1
        ;;
esac 
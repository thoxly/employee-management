#!/bin/bash

# Скрипт для автоматизации workflow разработки
# Использование: ./scripts/dev-workflow.sh [sync|deploy|status|logs]

set -e

ACTION=${1:-sync}

case $ACTION in
    "sync")
        echo "🔄 Синхронизация кода с сервером..."
        ./scripts/sync-to-server.sh dev
        echo ""
        echo "✅ Код синхронизирован!"
        echo "🌐 Для запуска dev среды: ./scripts/server-manage.sh dev"
        ;;
        
    "deploy")
        echo "🚀 Деплой в продакшн..."
        ./scripts/server-manage.sh prod
        echo ""
        echo "✅ Деплой завершен!"
        echo "🌐 Доступно по адресу: https://прибыл.рф"
        ;;
        
    "dev")
        echo "🔥 Запуск dev среды..."
        ./scripts/server-manage.sh dev
        echo ""
        echo "✅ Dev среда запущена!"
        echo "🌐 Доступно по адресу: https://dev.прибыл.рф"
        echo "🔥 Hot reload включен!"
        ;;
        
    "status")
        echo "📊 Статус сред..."
        ./scripts/server-manage.sh status
        ;;
        
    "logs")
        echo "📋 Логи dev среды..."
        ssh -i ~/.ssh/id_rsa_server root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.dev-server.yml logs -f"
        ;;
        
    "stop")
        echo "🛑 Остановка всех сред..."
        ./scripts/server-manage.sh stop
        echo "✅ Все среды остановлены!"
        ;;
        
    *)
        echo "❌ Неизвестная команда: $ACTION"
        echo ""
        echo "Доступные команды:"
        echo "  ./scripts/dev-workflow.sh sync   - синхронизировать код"
        echo "  ./scripts/dev-workflow.sh dev    - запустить dev среду"
        echo "  ./scripts/dev-workflow.sh deploy - деплой в продакшн"
        echo "  ./scripts/dev-workflow.sh status - показать статус"
        echo "  ./scripts/dev-workflow.sh logs   - показать логи"
        echo "  ./scripts/dev-workflow.sh stop   - остановить все среды"
        echo ""
        echo "🔄 Полный workflow:"
        echo "  1. ./scripts/dev-workflow.sh sync"
        echo "  2. ./scripts/dev-workflow.sh dev"
        echo "  3. ./scripts/dev-workflow.sh deploy"
        exit 1
        ;;
esac 
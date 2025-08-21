#!/bin/bash

# Скрипт для управления средами разработки на сервере
# Использование: ./scripts/manage-environments-server.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}

case $ENVIRONMENT in
    "dev"|"development")
        echo "🔄 Переключение на dev среду..."
        ./scripts/switch-to-dev-server.sh
        ;;
    "staging")
        echo "🔄 Переключение на staging среду..."
        ./scripts/switch-to-staging.sh
        ;;
    "prod"|"production")
        echo "🔄 Переключение на production среду..."
        ./scripts/switch-to-production.sh
        ;;
    "stop")
        echo "🛑 Остановка всех сред..."
        docker-compose down 2>/dev/null || true
        docker-compose -f docker-compose.staging.yml down 2>/dev/null || true
        docker-compose -f docker-compose.dev-server.yml down 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
        echo "✅ Все среды остановлены!"
        ;;
    "status")
        echo "📊 Статус всех сред:"
        echo ""
        echo "🔍 Проверяем dev среду..."
        docker-compose -f docker-compose.dev-server.yml ps 2>/dev/null || echo "❌ Dev среда не запущена"
        echo ""
        echo "🔍 Проверяем staging среду..."
        docker-compose -f docker-compose.staging.yml ps 2>/dev/null || echo "❌ Staging среда не запущена"
        echo ""
        echo "🔍 Проверяем production среду..."
        docker-compose ps 2>/dev/null || echo "❌ Production среда не запущена"
        ;;
    *)
        echo "❌ Неизвестная среда: $ENVIRONMENT"
        echo ""
        echo "Доступные команды:"
        echo "  ./scripts/manage-environments-server.sh dev      - запустить dev среду"
        echo "  ./scripts/manage-environments-server.sh staging  - запустить staging среду"
        echo "  ./scripts/manage-environments-server.sh prod     - запустить production среду"
        echo "  ./scripts/manage-environments-server.sh stop     - остановить все среды"
        echo "  ./scripts/manage-environments-server.sh status   - показать статус всех сред"
        echo ""
        echo "Среды:"
        echo "  🌐 Dev:      https://dev.прибыл.рф (с hot reload)"
        echo "  🧪 Staging:  https://dev.прибыл.рф (тестирование)"
        echo "  🚀 Prod:     https://прибыл.рф (продакшн)"
        exit 1
        ;;
esac 
#!/bin/bash

# Скрипт для запуска dev среды на домене dev.прибыл.рф (серверная версия)

set -e

echo "🚀 Запуск dev среды на сервере..."

# Проверяем наличие переменных окружения
if [ ! -f "./env.development-server" ]; then
    echo "❌ Файл env.development-server не найден!"
    echo "Создайте файл env.development-server"
    exit 1
fi

# Останавливаем все другие среды
echo "🛑 Останавливаем другие среды..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.staging.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Загружаем переменные окружения для dev
export $(cat ./env.development-server | grep -v '^#' | xargs)

# Запускаем dev среду
echo "🔧 Запускаем dev среду..."
docker-compose -f docker-compose.dev-server.yml up -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 15

# Проверяем статус
echo "📊 Статус сервисов:"
docker-compose -f docker-compose.dev-server.yml ps

echo ""
echo "✅ Dev среда запущена!"
echo "🌐 Frontend: https://dev.прибыл.рф"
echo "🔧 Backend API: https://dev.прибыл.рф/api"
echo "🤖 Bot webhook: https://dev.прибыл.рф/bot"
echo "💾 Database: localhost:5434"
echo ""
echo "🔥 Hot reload включен - изменения будут автоматически применяться!"
echo ""
echo "Для просмотра логов используйте:"
echo "  docker-compose -f docker-compose.dev-server.yml logs -f"
echo ""
echo "Для остановки используйте:"
echo "  docker-compose -f docker-compose.dev-server.yml down"
echo ""
echo "Для переключения на production:"
echo "  ./scripts/switch-to-production.sh" 
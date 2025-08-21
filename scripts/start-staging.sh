#!/bin/bash

# Скрипт для запуска staging среды на домене dev.прибыл.рф

set -e

echo "🚀 Запуск staging среды..."

# Проверяем наличие SSL сертификатов
if [ ! -f "./ssl/dev.прибыл.рф.crt" ] || [ ! -f "./ssl/dev.прибыл.рф.key" ]; then
    echo "❌ SSL сертификаты для dev.прибыл.рф не найдены!"
    echo "Создайте сертификаты в папке ./ssl/"
    echo "Файлы должны называться:"
    echo "  - dev.прибыл.рф.crt"
    echo "  - dev.прибыл.рф.key"
    exit 1
fi

# Проверяем наличие переменных окружения
if [ ! -f "./env.staging" ]; then
    echo "❌ Файл env.staging не найден!"
    exit 1
fi

# Останавливаем production если запущен
echo "🛑 Останавливаем production среду..."
docker compose down 2>/dev/null || true

# Загружаем переменные окружения для staging
export $(cat ./env.staging | grep -v '^#' | xargs)

# Запускаем staging среду
echo "🔧 Запускаем staging среду..."
docker compose -f docker-compose.staging.yml up -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус сервисов:"
docker compose -f docker-compose.staging.yml ps

echo ""
echo "✅ Staging среда запущена!"
echo "🌐 Frontend: https://dev.прибыл.рф"
echo "🔧 Backend API: https://dev.прибыл.рф/api"
echo "🤖 Bot webhook: https://dev.прибыл.рф/bot"
echo "💾 Database: localhost:5434"
echo ""
echo "Для просмотра логов используйте:"
echo "  docker compose -f docker-compose.staging.yml logs -f"
echo ""
echo "Для остановки используйте:"
echo "  docker compose -f docker-compose.staging.yml down" 
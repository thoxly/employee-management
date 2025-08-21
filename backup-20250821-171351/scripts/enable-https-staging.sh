#!/bin/bash

# Скрипт для включения HTTPS в staging

set -e

SERVER_IP="89.111.169.243"
SERVER_USER="root"
PROJECT_PATH="/opt/employee-management"

echo "🔒 Включение HTTPS для staging..."

# Проверяем наличие SSL сертификатов
echo "🔍 Проверка SSL сертификатов..."
if ssh $SERVER_USER@$SERVER_IP "[ -f $PROJECT_PATH/ssl/dev.прибыл.рф.crt ] && [ -f $PROJECT_PATH/ssl/dev.прибыл.рф.key ]"; then
    echo "✅ SSL сертификаты найдены"
else
    echo "❌ SSL сертификаты не найдены"
    echo "Создайте сертификаты на сервере:"
    echo "  ssh $SERVER_USER@$SERVER_IP"
    echo "  mkdir -p $PROJECT_PATH/ssl"
    echo "  cd $PROJECT_PATH/ssl"
    echo "  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
    echo "    -keyout dev.прибыл.рф.key \\"
    echo "    -out dev.прибыл.рф.crt \\"
    echo "    -subj '/C=RU/ST=Moscow/L=Moscow/O=Company/CN=dev.прибыл.рф'"
    exit 1
fi

# Копируем HTTPS конфигурацию
echo "📤 Копируем HTTPS конфигурацию..."
scp nginx.staging.https.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/nginx.staging.conf

# Обновляем docker-compose для HTTPS
echo "🔧 Обновляем docker-compose для HTTPS..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && sed -i 's/- \"80:80\"/- \"80:80\"\\n      - \"443:443\"/' docker-compose.staging.yml"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && sed -i 's/- \.\/nginx\.staging\.conf:\/etc\/nginx\/nginx\.conf:ro/- \.\/nginx\.staging\.conf:\/etc\/nginx\/nginx\.conf:ro\\n      - \.\/ssl:\/etc\/nginx\/ssl:ro/' docker-compose.staging.yml"

# Обновляем переменные окружения для HTTPS
echo "🔧 Обновляем переменные окружения..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && sed -i 's|http://dev.прибыл.рф|https://dev.прибыл.рф|g' env.staging"

# Перезапускаем staging
echo "🔄 Перезапускаем staging с HTTPS..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml down"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml up -d"

# Ждем запуска
echo "⏳ Ждем запуска сервисов..."
sleep 10

# Проверяем статус
echo "📊 Статус сервисов:"
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.staging.yml ps"

echo ""
echo "✅ HTTPS включен для staging!"
echo "🌐 Доступен по адресу: https://dev.прибыл.рф"
echo ""
echo "Для проверки:"
echo "  curl -I https://dev.прибыл.рф" 
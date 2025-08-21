#!/bin/bash

# Скрипт для настройки SSL сертификатов
# Использование: ./scripts/setup-ssl.sh

set -e

echo "🔐 Setting up SSL certificates..."

# Проверяем, что мы на сервере
if [ "$(whoami)" != "root" ]; then
    echo "❌ This script must be run as root"
    exit 1
fi

# Обновляем систему
echo "📦 Updating system packages..."
apt update

# Устанавливаем certbot
echo "🔧 Installing certbot..."
apt install -y certbot python3-certbot-nginx

# Останавливаем nginx для получения сертификатов
echo "🛑 Stopping nginx..."
systemctl stop nginx || true

# Получаем сертификаты для всех доменов
echo "📜 Obtaining SSL certificates..."

# Основной домен
echo "🔑 Getting certificate for прибыл.рф..."
certbot certonly --standalone -d прибыл.рф -d www.прибыл.рф --non-interactive --agree-tos --email admin@прибыл.рф

# Dev поддомен
echo "🔑 Getting certificate for dev.прибыл.рф..."
certbot certonly --standalone -d dev.прибыл.рф --non-interactive --agree-tos --email admin@прибыл.рф

# Staging поддомен
echo "🔑 Getting certificate for staging.прибыл.рф..."
certbot certonly --standalone -d staging.прибыл.рф --non-interactive --agree-tos --email admin@прибыл.рф

# Настраиваем автоматическое обновление
echo "⏰ Setting up automatic renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Проверяем сертификаты
echo "🔍 Checking certificates..."
certbot certificates

echo "✅ SSL certificates setup completed!"
echo "🌐 Domains with SSL:"
echo "   - https://прибыл.рф"
echo "   - https://dev.прибыл.рф"
echo "   - https://staging.прибыл.рф"

# Тестируем обновление
echo "🧪 Testing certificate renewal..."
certbot renew --dry-run

echo "🎉 SSL setup completed successfully!" 
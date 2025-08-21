#!/bin/bash

# Скрипт для проверки статуса всех сред
# Использование: ./scripts/status.sh

set -e

echo "📊 Checking status of all environments..."
echo ""

# Проверяем локальные контейнеры
echo "🔍 Local containers:"
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo "✅ Local containers are running"
    docker-compose ps
else
    echo "❌ No local containers running"
fi
echo ""

# Проверяем dev контейнеры
echo "🔍 Development containers:"
if docker-compose -f docker-compose.dev-server.yml ps 2>/dev/null | grep -q "Up"; then
    echo "✅ Development containers are running"
    docker-compose -f docker-compose.dev-server.yml ps
else
    echo "❌ No development containers running"
fi
echo ""

# Проверяем staging контейнеры
echo "🔍 Staging containers:"
if docker-compose -f docker-compose.staging.yml ps 2>/dev/null | grep -q "Up"; then
    echo "✅ Staging containers are running"
    docker-compose -f docker-compose.staging.yml ps
else
    echo "❌ No staging containers running"
fi
echo ""

# Проверяем production контейнеры
echo "🔍 Production containers:"
if docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "Up"; then
    echo "✅ Production containers are running"
    docker-compose -f docker-compose.prod.yml ps
else
    echo "❌ No production containers running"
fi
echo ""

# Проверяем DNS
echo "🌐 DNS Status:"
echo "Checking domain resolution..."

# Основной домен
if nslookup прибыл.рф > /dev/null 2>&1; then
    echo "✅ прибыл.рф resolves correctly"
else
    echo "❌ прибыл.рф DNS resolution failed"
fi

# Dev поддомен
if nslookup dev.прибыл.рф > /dev/null 2>&1; then
    echo "✅ dev.прибыл.рф resolves correctly"
else
    echo "❌ dev.прибыл.рф DNS resolution failed"
fi

# Staging поддомен
if nslookup staging.прибыл.рф > /dev/null 2>&1; then
    echo "✅ staging.прибыл.рф resolves correctly"
else
    echo "❌ staging.прибыл.рф DNS resolution failed"
fi
echo ""

# Проверяем доступность сервисов
echo "🌐 Service Availability:"

# Production
echo "Checking production (https://прибыл.рф)..."
if curl -f -s https://прибыл.рф/health > /dev/null 2>&1; then
    echo "✅ Production is accessible"
else
    echo "❌ Production is not accessible"
fi

# Development
echo "Checking development (https://dev.прибыл.рф)..."
if curl -f -s https://dev.прибыл.рф/health > /dev/null 2>&1; then
    echo "✅ Development is accessible"
else
    echo "❌ Development is not accessible"
fi

# Staging
echo "Checking staging (https://staging.прибыл.рф)..."
if curl -f -s https://staging.прибыл.рф/health > /dev/null 2>&1; then
    echo "✅ Staging is accessible"
else
    echo "❌ Staging is not accessible"
fi
echo ""

# Проверяем SSL сертификаты (если на сервере)
if [ "$(whoami)" = "root" ]; then
    echo "🔐 SSL Certificates:"
    if command -v certbot &> /dev/null; then
        certbot certificates
    else
        echo "⚠️ Certbot not installed"
    fi
    echo ""
fi

# Показываем команды управления
echo "🛠️ Management Commands:"
echo "  ./scripts/deploy-dev.sh        - Deploy to development"
echo "  ./scripts/deploy-staging.sh    - Deploy to staging"
echo "  ./scripts/deploy-production.sh - Deploy to production"
echo "  ./scripts/server-manage.sh dev - Manage dev on server"
echo "  ./scripts/server-manage.sh staging - Manage staging on server"
echo "  ./scripts/server-manage.sh prod - Manage production on server"
echo ""

echo "📊 Status check completed!" 
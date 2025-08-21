#!/bin/bash

# Диагностический скрипт для staging среды

echo "🔍 Диагностика staging среды..."

echo ""
echo "1. Проверка статуса контейнеров:"
docker compose -f docker-compose.staging.yml ps

echo ""
echo "2. Проверка логов nginx:"
docker compose -f docker-compose.staging.yml logs nginx --tail=20

echo ""
echo "3. Проверка логов frontend:"
docker compose -f docker-compose.staging.yml logs frontend --tail=10

echo ""
echo "4. Проверка доступности сервисов внутри Docker сети:"
echo "Frontend (порт 3002):"
docker compose -f docker-compose.staging.yml exec nginx curl -s -o /dev/null -w "%{http_code}" http://frontend:3002 || echo "недоступен"

echo ""
echo "Backend (порт 3003):"
docker compose -f docker-compose.staging.yml exec nginx curl -s -o /dev/null -w "%{http_code}" http://backend:3003 || echo "недоступен"

echo ""
echo "5. Проверка SSL сертификатов:"
if [ -f "./ssl/dev.прибыл.рф.crt" ]; then
    echo "✅ SSL сертификат найден"
    openssl x509 -in ./ssl/dev.прибыл.рф.crt -text -noout | grep "Subject:"
else
    echo "❌ SSL сертификат не найден: ./ssl/dev.прибыл.рф.crt"
fi

if [ -f "./ssl/dev.прибыл.рф.key" ]; then
    echo "✅ SSL ключ найден"
else
    echo "❌ SSL ключ не найден: ./ssl/dev.прибыл.рф.key"
fi

echo ""
echo "6. Проверка DNS:"
nslookup dev.прибыл.рф

echo ""
echo "7. Проверка портов:"
netstat -tlnp | grep -E ":(80|443|3002|3003|3004)" || echo "Порты не найдены"

echo ""
echo "8. Проверка конфигурации nginx:"
docker compose -f docker-compose.staging.yml exec nginx nginx -t

echo ""
echo "🔍 Диагностика завершена!" 
#!/bin/bash

# Скрипт для настройки dev среды на сервере
# Использование: ./scripts/setup-server-dev.sh

set -e

# Настройки сервера
SERVER_IP="89.111.169.243"
SERVER_USER="root"
PROJECT_PATH="/root/employee-management"

echo "🚀 Настройка dev среды на сервере..."

# Проверяем подключение к серверу
echo "🔍 Проверяем подключение к серверу..."
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Подключение успешно'" 2>/dev/null; then
    echo "❌ Не удается подключиться к серверу $SERVER_IP"
    echo "Проверьте:"
    echo "  1. SSH ключи настроены"
    echo "  2. Сервер доступен"
    echo "  3. Пользователь $SERVER_USER существует"
    exit 1
fi

echo "✅ Подключение к серверу успешно"

# Создаем директорию проекта на сервере
echo "📁 Создаем директорию проекта..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_PATH"

# Загружаем файлы на сервер
echo "📤 Загружаем файлы на сервер..."

# Основные конфигурации
scp docker-compose.dev.yml $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp nginx.dev.conf $SERVER_USER@$SERVER_IP:$PROJECT_PATH/
scp env.development $SERVER_USER@$SERVER_IP:$PROJECT_PATH/

# Скрипты
scp scripts/manage-environments.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
scp scripts/start-dev.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
scp scripts/switch-to-dev.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/
scp scripts/stop-dev.sh $SERVER_USER@$SERVER_IP:$PROJECT_PATH/scripts/

# Делаем скрипты исполняемыми
ssh $SERVER_USER@$SERVER_IP "chmod +x $PROJECT_PATH/scripts/*.sh"

echo "✅ Файлы загружены"

# Настраиваем DNS (если есть доступ к панели управления)
echo "🌐 Настройка DNS..."
echo ""
echo "⚠️  ВАЖНО: Нужно настроить DNS запись в панели управления доменом:"
echo "   Тип: A"
echo "   Имя: dev"
echo "   Значение: $SERVER_IP"
echo "   TTL: 300"
echo ""
echo "Это создаст запись: dev.прибыл.рф → $SERVER_IP"
echo ""

read -p "DNS настроен? (y/n): " dns_configured

if [ "$dns_configured" != "y" ]; then
    echo "❌ Настройте DNS перед продолжением"
    exit 1
fi

# Останавливаем production среду
echo "🛑 Останавливаем production среду..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose down 2>/dev/null || true"

# Запускаем dev среду
echo "🚀 Запускаем dev среду на сервере..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && ./scripts/start-dev.sh"

# Проверяем статус
echo "📊 Проверяем статус..."
ssh $SERVER_USER@$SERVER_IP "cd $PROJECT_PATH && docker compose -f docker-compose.dev.yml ps"

echo ""
echo "✅ Dev среда настроена на сервере!"
echo ""
echo "🌐 Доступные URL:"
echo "  🏠 Локальная разработка: http://localhost/"
echo "  🌍 Серверная dev среда: http://dev.прибыл.рф"
echo "  🧪 Staging: https://dev.прибыл.рф (SSL)"
echo "  🚀 Production: https://прибыл.рф"
echo ""
echo "📋 Команды управления:"
echo "  Локально: ./scripts/manage-environments.sh dev"
echo "  На сервере: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && ./scripts/manage-environments.sh dev'"
echo ""
echo "🔧 Для просмотра логов на сервере:"
echo "  ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_PATH && docker compose -f docker-compose.dev.yml logs -f'" 
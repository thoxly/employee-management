#!/bin/bash

# Скрипт для настройки универсальной конфигурации nginx
# Использование: ./scripts/setup-universal-nginx.sh

set -e

echo "🌐 Setting up universal nginx configuration..."

# Проверяем, что мы в правильной директории
if [ ! -f "nginx.universal.conf" ]; then
    echo "❌ Error: nginx.universal.conf not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Останавливаем текущие контейнеры
echo "🛑 Stopping current containers..."
docker-compose down || true
docker-compose -f docker-compose.dev-server.yml down || true
docker-compose -f docker-compose.staging.yml down || true

# Копируем универсальную конфигурацию
echo "📋 Copying universal nginx configuration..."
cp nginx.universal.conf nginx.conf

# Создаем универсальный docker-compose файл
echo "🐳 Creating universal docker-compose configuration..."
cat > docker-compose.universal.yml << 'EOF'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
      - bot
    networks:
      - universal_network
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_universal:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/1_init.sql
    networks:
      - universal_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    env_file:
      - ./frontend/.env
      - ./env.development-server
    environment:
      - HOST=0.0.0.0
      - PORT=3002
      - CHOKIDAR_USEPOLLING=true
      - WDS_SOCKET_HOST=0.0.0.0
      - WDS_SOCKET_PORT=3002
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - universal_network
    command: npm start
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3003:3003"
    env_file:
      - ./backend/.env
      - ./env.development-server
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - db
    networks:
      - universal_network
    command: npm run dev
    restart: unless-stopped

  bot:
    build:
      context: ./bot
      dockerfile: Dockerfile.dev
    ports:
      - "3004:3004"
    env_file:
      - ./bot/.env
      - ./env.development-server
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - ./bot:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - universal_network
    command: npm run dev
    restart: unless-stopped

volumes:
  postgres_data_universal:

networks:
  universal_network:
    driver: bridge
EOF

# Собираем и запускаем контейнеры
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.universal.yml build --no-cache
docker-compose -f docker-compose.universal.yml up -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 30

# Проверяем статус
echo "🔍 Checking deployment status..."
docker-compose -f docker-compose.universal.yml ps

# Проверяем доступность
echo "🌐 Testing application availability..."
echo "Testing dev.прибыл.рф..."
curl -f http://dev.прибыл.рф/health || echo "❌ dev.прибыл.рф failed"
echo "Testing staging.прибыл.рф..."
curl -f http://staging.прибыл.рф/health || echo "❌ staging.прибыл.рф failed"
echo "Testing прибыл.рф..."
curl -f http://прибыл.рф/health || echo "❌ прибыл.рф failed"

echo "✅ Universal nginx setup completed!"
echo "🌐 All domains should now work:"
echo "   - http://dev.прибыл.рф"
echo "   - http://staging.прибыл.рф"
echo "   - http://прибыл.рф"
echo "   - https://dev.прибыл.рф (redirects to HTTP)"
echo "   - https://staging.прибыл.рф (redirects to HTTP)"
echo "   - https://прибыл.рф (redirects to HTTP)" 
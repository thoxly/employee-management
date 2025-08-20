# 🚀 Руководство по деплою и работе с проектом

## 📋 Обзор проекта

**Employee Management System** - это полнофункциональная система управления сотрудниками с веб-интерфейсом, API и Telegram ботом.

### 🏗️ Архитектура

- **Frontend** - React приложение
- **Backend** - Node.js API (Express)
- **Bot** - Telegram бот
- **Database** - PostgreSQL
- **Proxy** - Nginx
- **Containerization** - Docker & Docker Compose

---

## 🌐 Доступные URL'ы

### Production (прибыл.рф)

- **Frontend:** https://прибыл.рф/
- **API:** https://прибыл.рф/api/
- **API Endpoints:**
  - `/api/auth` - Аутентификация
  - `/api/employees` - Управление сотрудниками
  - `/api/tasks` - Управление задачами
  - `/api/company` - Управление компаниями
  - `/api/sessions` - Сессии

### Прямой доступ к сервисам (IP: 89.111.169.243)

- **Frontend:** http://89.111.169.243:3000/
- **Backend:** http://89.111.169.243:3001/
- **Bot:** http://89.111.169.243:3004/
- **Database:** 89.111.169.243:5432

---

## 🐳 Управление Docker контейнерами

### Проверка статуса

```bash
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml ps"
```

### Просмотр логов

```bash
# Все сервисы
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs"

# Конкретный сервис
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs [service_name]"

# Логи в реальном времени
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs -f [service_name]"
```

### Перезапуск сервисов

```bash
# Все сервисы
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml restart"

# Конкретный сервис
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml restart [service_name]"
```

### Остановка/Запуск

```bash
# Остановить все
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml down"

# Запустить все
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml up -d"
```

---

## 🔄 Обновление кода

### 1. Локальная разработка

```bash
# Внести изменения в код
git add .
git commit -m "Описание изменений"
git push
```

### 2. Деплой на сервер

```bash
# Обновить код на сервере
ssh root@89.111.169.243 "cd /var/www/prod && git pull"

# Перезапустить сервисы (если нужно)
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml up -d"
```

### 3. Пересборка (если изменились зависимости)

```bash
# Пересобрать конкретный сервис
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml build [service_name]"

# Пересобрать все сервисы
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml build"

# Пересобрать и запустить
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml up -d --build"
```

---

## 🔧 Мониторинг и отладка

### Проверка здоровья сервисов

```bash
# Frontend
curl -s http://прибыл.рф/ | grep -o '<title>.*</title>'

# API
curl -s http://прибыл.рф/api/

# Backend напрямую
curl -s http://89.111.169.243:3001/
```

### Проверка ресурсов сервера

```bash
# Свободное место на диске
ssh root@89.111.169.243 "df -h"

# Использование памяти
ssh root@89.111.169.243 "free -h"

# Загрузка CPU
ssh root@89.111.169.243 "top -bn1 | grep 'Cpu(s)'"
```

### Очистка Docker

```bash
# Удалить неиспользуемые образы и контейнеры
ssh root@89.111.169.243 "docker system prune -af"

# Удалить все контейнеры и образы
ssh root@89.111.169.243 "docker system prune -a --volumes"
```

---

## 📁 Структура проекта

```
employee-management/
├── frontend/                 # React приложение
│   ├── src/                 # Исходный код
│   ├── public/              # Статические файлы
│   ├── Dockerfile           # Docker конфигурация
│   └── .env.production      # Production переменные
├── backend/                 # Node.js API
│   ├── controllers/         # Контроллеры
│   ├── routes/              # Маршруты
│   ├── middleware/          # Middleware
│   ├── services/            # Сервисы
│   ├── Dockerfile           # Docker конфигурация
│   └── .env.production      # Production переменные
├── bot/                     # Telegram бот
│   ├── handlers/            # Обработчики команд
│   ├── services/            # Сервисы
│   ├── Dockerfile           # Docker конфигурация
│   └── .env.production      # Production переменные
├── docker-compose.prod.yml  # Production Docker Compose
├── nginx.conf               # Nginx конфигурация
└── README.md                # Основная документация
```

---

## 🔐 Переменные окружения

### Frontend (.env.production)

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
REACT_APP_API_URL=https://прибыл.рф/api
REACT_APP_TELEGRAM_API_URL=https://прибыл.рф
REACT_APP_YANDEX_MAP_JS_API=your_api_key
REACT_APP_YANDEX_MAPS_API_KEY=your_api_key
REACT_APP_GEOSUGGEST=your_api_key
```

### Backend (.env.production)

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=employee_management
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_secret
BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://прибыл.рф/api/telegram/webhook
MINI_APP_URL=https://прибыл.рф
FRONTEND_URL=https://прибыл.рф
BACKEND_URL=https://прибыл.рф/api
ALLOWED_ORIGINS=https://прибыл.рф
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_bucket
S3_ENDPOINT=https://s3.regru.cloud
S3_FORCE_PATH_STYLE=false
```

### Bot (.env.production)

```env
NODE_ENV=production
PORT=3004
HOST=0.0.0.0
BACKEND_URL=http://backend:3001
MINI_APP_URL=https://прибыл.рф
BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://прибыл.рф/api/telegram/webhook
```

---

## 🚨 Устранение неполадок

### Проблема: Сервис не запускается

```bash
# Проверить логи
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs [service_name]"

# Перезапустить сервис
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml restart [service_name]"
```

### Проблема: Не хватает места на диске

```bash
# Очистить Docker
ssh root@89.111.169.243 "docker system prune -af"

# Проверить свободное место
ssh root@89.111.169.243 "df -h"
```

### Проблема: API не отвечает

```bash
# Проверить backend напрямую
curl -s http://89.111.169.243:3001/

# Проверить nginx логи
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs nginx"
```

### Проблема: Frontend не собирается

```bash
# Увеличить лимит памяти в Dockerfile
# Добавить в Dockerfile: RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Пересобрать frontend
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml build frontend"
```

---

## 📞 Контакты и поддержка

### Сервер

- **IP:** 89.111.169.243
- **SSH:** root@89.111.169.243
- **Домен:** прибыл.рф

### Полезные команды

```bash
# Подключение к серверу
ssh root@89.111.169.243

# Переход в директорию проекта
cd /var/www/prod

# Просмотр всех контейнеров
docker ps

# Просмотр логов в реальном времени
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 📝 Чек-лист деплоя

- [x] Настроены DNS записи для домена
- [x] Установлен Docker и Docker Compose на сервере
- [x] Созданы production .env файлы
- [x] Настроена nginx конфигурация
- [x] Собраны и запущены все контейнеры
- [x] Проверена работа frontend
- [x] Проверена работа API
- [x] Проверена работа Telegram бота
- [x] Настроены SSL сертификаты (если нужно)
- [x] Настроены бэкапы базы данных
- [x] Настроен мониторинг

---

**🎉 Проект успешно развернут и готов к использованию!**

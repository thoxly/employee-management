# Руководство по работе с Docker

## 🚀 Быстрый старт

### Полная настройка и запуск (рекомендуется)

```bash
# Для локальной разработки
node scripts/docker-setup.js development

# Для staging
node scripts/docker-setup.js staging

# Для продакшена
node scripts/docker-setup.js production
```

Этот скрипт автоматически:

- ✅ Настроит все .env файлы
- ✅ Соберет Docker образы
- ✅ Запустит контейнеры
- ✅ Покажет статус и инструкции

## 📋 Ручное управление

### 1. Настройка переменных окружения

```bash
# Настроить переменные для конкретной среды
node scripts/setup-env.js development
node scripts/setup-env.js staging
node scripts/setup-env.js production
```

### 2. Запуск контейнеров

```bash
# Локальная разработка (с логами в реальном времени)
docker-compose up

# Staging (в фоновом режиме)
docker-compose -f docker-compose.staging.yml up -d

# Продакшен (в фоновом режиме)
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Остановка контейнеров

```bash
# Остановить все контейнеры
docker-compose down
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Основные команды Docker

### Управление контейнерами

```bash
# Посмотреть статус контейнеров
docker-compose ps
docker-compose -f docker-compose.staging.yml ps
docker-compose -f docker-compose.prod.yml ps

# Посмотреть логи
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f bot

# Пересобрать и запустить
docker-compose up --build -d
docker-compose -f docker-compose.staging.yml up --build -d
docker-compose -f docker-compose.prod.yml up --build -d
```

### Работа с контейнерами

```bash
# Войти в контейнер
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec bot sh

# Выполнить команду в контейнере
docker-compose exec backend npm run migrate
docker-compose exec frontend npm run build
```

### Очистка

```bash
# Остановить и удалить контейнеры
docker-compose down

# Удалить все неиспользуемые контейнеры, сети, образы
docker system prune -a

# Удалить конкретные volumes
docker volume rm employee-management_postgres_data
docker volume rm employee-management_postgres_data_staging
docker volume rm employee-management_postgres_data_prod
```

## 🌍 Конфигурации для разных сред

### Development (Локальная разработка)

- **Файл**: `docker-compose.yml`
- **Порты**: 3002 (frontend), 3003 (backend), 3004 (bot), 5433 (db)
- **Особенности**: Hot reload, логи в реальном времени
- **Команда**: `docker-compose up`

### Staging (dev.прибыл.рф)

- **Файл**: `docker-compose.staging.yml`
- **Порты**: 3002 (frontend), 3003 (backend), 3004 (bot), 5432 (db)
- **Особенности**: Отдельная сеть, отдельные volumes
- **Команда**: `docker-compose -f docker-compose.staging.yml up -d`

### Production (прибыл.рф)

- **Файл**: `docker-compose.prod.yml`
- **Порты**: 3000 (frontend), 3001 (backend), 3004 (bot), 5432 (db)
- **Особенности**: Автоперезапуск, production режим
- **Команда**: `docker-compose -f docker-compose.prod.yml up -d`

## 🔍 Мониторинг и отладка

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f bot
docker-compose logs -f db

# Логи с временными метками
docker-compose logs -f -t
```

### Проверка состояния

```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Информация о контейнере
docker-compose exec backend ps aux
docker-compose exec frontend ps aux
```

### Отладка проблем

```bash
# Проверить переменные окружения в контейнере
docker-compose exec backend env
docker-compose exec frontend env

# Проверить подключение к БД
docker-compose exec backend node -e "console.log(process.env.DATABASE_URL)"

# Проверить сетевые подключения
docker network ls
docker network inspect employee-management_default
```

## 🚨 Решение проблем

### Контейнер не запускается

```bash
# Проверить логи
docker-compose logs [service_name]

# Проверить переменные окружения
docker-compose exec [service_name] env

# Пересобрать образ
docker-compose build --no-cache [service_name]
```

### Проблемы с базой данных

```bash
# Проверить подключение к БД
docker-compose exec backend node -e "
const { Pool } = require('pg');
const pool = new Pool();
pool.query('SELECT NOW()', (err, res) => {
  console.log(err || res.rows[0]);
  pool.end();
});
"

# Сбросить БД
docker-compose down
docker volume rm employee-management_postgres_data
docker-compose up
```

### Проблемы с портами

```bash
# Проверить занятые порты
lsof -i :3002
lsof -i :3003
lsof -i :3004

# Остановить процессы на портах
sudo kill -9 $(lsof -t -i:3002)
```

## 📝 Полезные алиасы

Добавьте в ваш `.bashrc` или `.zshrc`:

```bash
# Алиасы для быстрого доступа
alias dcup='docker-compose up'
alias dcupd='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'

# Для staging
alias dcup-staging='docker-compose -f docker-compose.staging.yml up -d'
alias dcdown-staging='docker-compose -f docker-compose.staging.yml down'
alias dclogs-staging='docker-compose -f docker-compose.staging.yml logs -f'

# Для production
alias dcup-prod='docker-compose -f docker-compose.prod.yml up -d'
alias dcdown-prod='docker-compose -f docker-compose.prod.yml down'
alias dclogs-prod='docker-compose -f docker-compose.prod.yml logs -f'
```

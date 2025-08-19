# Быстрый старт - Переменные окружения

## 🚀 Настройка за 5 минут

### 1. Выберите среду и скопируйте файл

```bash
# Для локальной разработки
cp env.development .env

# ИЛИ для staging/dev
cp env.staging .env

# ИЛИ для продакшена
cp env.production .env
```

### 2. Настройте переменные окружения

```bash
# Автоматическая настройка всех .env файлов
node scripts/setup-env.js development
```

### 3. Проверьте .env файлы

```bash
# Все переменные уже настроены с реальными значениями
cat .env
cat frontend/.env
cat backend/.env
cat bot/.env
```

Для локальной разработки обновите ngrok URL в .env файлах:

- `TELEGRAM_WEBHOOK_URL` в корневом .env
- `REACT_APP_TELEGRAM_API_URL` в frontend/.env

### 4. Запустите проект

```bash
# Локальная разработка
docker-compose up

# ИЛИ продакшен
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 Что нужно получить

### Telegram Bot Token

1. Найдите @BotFather в Telegram
2. `/newbot` → выберите имя и username
3. Скопируйте токен

### Яндекс Карты API

1. https://developer.tech.yandex.ru/
2. Создайте приложение
3. Получите ключи для JavaScript API и Geocoder

## 🔧 Проблемы?

- **БД не подключается**: проверьте `DB_HOST` и `DB_PORT`
- **CORS ошибки**: проверьте `FRONTEND_URL` и `BACKEND_URL`
- **Telegram не работает**: проверьте `BOT_TOKEN` и webhook URL

## 📖 Подробная документация

См. [ENV_SETUP.md](ENV_SETUP.md) для полной документации.

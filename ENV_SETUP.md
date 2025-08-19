# Настройка переменных окружения

## Обзор

Проект использует переменные окружения для конфигурации разных компонентов. Созданы шаблоны для разных сред:

- `env.example` - основной шаблон со всеми переменными
- `env.development` - для локальной разработки
- `env.staging` - для dev/staging среды
- `env.production` - для продакшена

## Быстрый старт

### 1. Локальная разработка

```bash
# Скопируйте файл для локальной разработки
cp env.development .env

# Сгенерируйте безопасные ключи
node scripts/generate-secrets.js

# Отредактируйте .env файл, заполнив реальные значения
nano .env
```

### 2. Staging/Dev среда

```bash
# Скопируйте файл для staging
cp env.staging .env

# Заполните реальные значения
nano .env
```

### 3. Продакшен

```bash
# Скопируйте файл для продакшена
cp env.production .env

# Сгенерируйте безопасные ключи
node scripts/generate-secrets.js

# Заполните реальные значения
nano .env
```

## Обязательные переменные

### База данных

- `DB_HOST` - хост базы данных
- `DB_PORT` - порт базы данных (5432 для Docker, 5433 для локальной разработки)
- `DB_NAME` - имя базы данных
- `DB_USER` - пользователь базы данных
- `DB_PASSWORD` - пароль базы данных

### JWT токены

- `JWT_ACCESS_SECRET` - секрет для access токенов
- `JWT_REFRESH_SECRET` - секрет для refresh токенов

### Telegram Bot

- `BOT_TOKEN` - токен бота от @BotFather
- `TELEGRAM_WEBHOOK_URL` - URL для webhook (только для продакшена)
- `MINI_APP_URL` - URL для мини-приложения Telegram

### Frontend

- `FRONTEND_URL` - URL фронтенда
- `BACKEND_URL` - URL API бэкенда
- `FRONTEND_PORT` - порт фронтенда

### Яндекс Карты

- `REACT_APP_YANDEX_MAP_JS_API` - ключ API Яндекс Карт
- `REACT_APP_YANDEX_MAPS_API_KEY` - ключ API Яндекс Карт
- `REACT_APP_GEOSUGGEST` - ключ API для геопоиска

## Генерация безопасных ключей

Используйте встроенный скрипт для генерации безопасных ключей:

```bash
node scripts/generate-secrets.js
```

Этот скрипт сгенерирует:

- JWT Access Secret (64 байта)
- JWT Refresh Secret (64 байта)
- Database Password (32 байта)

## Настройка для разных сред

### Локальная разработка

- База данных: `localhost:5433`
- Frontend: `http://localhost:3002`
- Backend: `http://localhost:3003`
- Telegram webhook: через ngrok/cloudflare tunnel

### Staging/Dev

- База данных: `db:5432` (Docker)
- Frontend: `https://dev.прибыл.рф`
- Backend: `https://dev.прибыл.рф/api`
- Telegram webhook: `https://dev.прибыл.рф/api/telegram/webhook`

### Продакшен

- База данных: `db:5432` (Docker)
- Frontend: `https://прибыл.рф`
- Backend: `https://прибыл.рф/api`
- Telegram webhook: `https://прибыл.рф/api/telegram/webhook`

## Безопасность

⚠️ **ВАЖНЫЕ ПРАВИЛА БЕЗОПАСНОСТИ:**

1. **Никогда не коммитьте .env файлы в git!**
2. Используйте разные ключи для разных сред
3. Регулярно обновляйте JWT секреты
4. Используйте сложные пароли для базы данных
5. Ограничьте доступ к .env файлам на сервере

## Получение API ключей

### Telegram Bot Token

1. Найдите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен

### Яндекс Карты API

1. Перейдите на https://developer.tech.yandex.ru/
2. Создайте приложение
3. Получите ключи для:
   - JavaScript API
   - Geocoder API
   - Geosuggest API

## Troubleshooting

### Проблемы с подключением к БД

- Проверьте правильность `DB_HOST` и `DB_PORT`
- Убедитесь, что база данных запущена
- Проверьте права доступа пользователя

### Проблемы с Telegram Bot

- Проверьте правильность `BOT_TOKEN`
- Для webhook убедитесь, что URL доступен извне
- Проверьте SSL сертификат для HTTPS

### Проблемы с CORS

- Проверьте настройки `FRONTEND_URL` и `BACKEND_URL`
- Убедитесь, что домены добавлены в CORS конфигурацию

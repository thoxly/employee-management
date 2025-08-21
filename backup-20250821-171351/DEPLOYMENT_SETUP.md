# Настройка деплоя и уведомлений

## Настроенные переменные окружения

### SSH подключение к серверу

- `PRODUCTION_HOST=89.111.169.243` - IP адрес сервера
- `PRODUCTION_USER=root` - пользователь для SSH подключения
- `PRODUCTION_SSH_PRIVATE_KEY` - приватный SSH ключ для аутентификации

### Telegram уведомления

- `TELEGRAM_BOT_TOKEN=8093953412:AAHY7Zz8vco5HiPdAW-7saVyTFWgz57jp-E` - токен бота
- `TELEGRAM_CHAT_ID=298161005` - ID чата для уведомлений

## Использование

### Отправка уведомлений через Telegram

```bash
node scripts/telegram-notifications.js "Ваше сообщение"
```

### Настройка окружения

```bash
# Для продакшена
node scripts/setup-env.js production

# Для staging
node scripts/setup-env.js staging

# Для разработки
node scripts/setup-env.js development
```

### Настройка GitHub Secrets

```bash
node scripts/setup-github-secrets.js production
```

## Файлы конфигурации

- `env.production` - переменные для продакшена
- `scripts/telegram-notifications.js` - скрипт для отправки уведомлений
- `scripts/setup-env.js` - скрипт настройки окружения
- `scripts/setup-github-secrets.js` - скрипт настройки GitHub Secrets

## Безопасность

⚠️ **Важно**: SSH приватный ключ и другие секретные данные хранятся в файлах конфигурации.
Убедитесь, что эти файлы не попадают в публичные репозитории.

## GitHub Secrets

Все переменные окружения автоматически добавлены в GitHub Secrets:

### Добавленные секреты (27 штук):

- `PROD_DB_HOST` - хост базы данных
- `PROD_DB_PORT` - порт базы данных
- `PROD_DB_NAME` - имя базы данных
- `PROD_DB_USER` - пользователь базы данных
- `PROD_DB_PASSWORD` - пароль базы данных
- `PROD_JWT_ACCESS_SECRET` - секрет для JWT токенов
- `PROD_JWT_REFRESH_SECRET` - секрет для refresh токенов
- `PROD_BOT_TOKEN` - токен Telegram бота
- `PROD_TELEGRAM_WEBHOOK_URL` - URL webhook для Telegram
- `PROD_MINI_APP_URL` - URL мини-приложения
- `PROD_FRONTEND_URL` - URL фронтенда
- `PROD_BACKEND_URL` - URL бэкенда
- `PROD_ALLOWED_ORIGINS` - разрешенные домены
- `PROD_YANDEX_MAP_JS_API` - API ключ Яндекс карт
- `PROD_YANDEX_MAPS_API_KEY` - ключ API Яндекс карт
- `PROD_GEOSUGGEST` - ключ геокодера
- `PROD_AWS_REGION` - регион AWS
- `PROD_AWS_ACCESS_KEY_ID` - ключ доступа AWS
- `PROD_AWS_SECRET_ACCESS_KEY` - секретный ключ AWS
- `PROD_S3_BUCKET_NAME` - имя S3 бакета
- `PROD_S3_ENDPOINT` - эндпоинт S3
- `PROD_S3_FORCE_PATH_STYLE` - стиль пути S3
- `PROD_PRODUCTION_HOST` - хост продакшн сервера
- `PROD_PRODUCTION_USER` - пользователь SSH
- `PROD_PRODUCTION_SSH_PRIVATE_KEY` - приватный SSH ключ
- `PROD_TELEGRAM_BOT_TOKEN` - токен бота для уведомлений
- `PROD_TELEGRAM_CHAT_ID` - ID чата для уведомлений

### Автоматическое добавление секретов:

```bash
node scripts/auto-setup-github-secrets.js production
```

## Следующие шаги

1. ✅ Настройте CI/CD pipeline для автоматического деплоя
2. ✅ Добавьте уведомления о статусе деплоя через Telegram
3. Настройте мониторинг сервера
4. Создайте GitHub Actions workflow для автоматического деплоя

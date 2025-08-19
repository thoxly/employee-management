# Настройка GitHub Secrets для CI/CD

Этот документ описывает все необходимые секреты для настройки CI/CD в GitHub Actions.

## Общие секреты

### SSH ключи

- `SSH_PRIVATE_KEY` - приватный SSH ключ для подключения к продакшен серверу
- `STAGING_SSH_PRIVATE_KEY` - приватный SSH ключ для подключения к staging серверу
- `DEV_SSH_PRIVATE_KEY` - приватный SSH ключ для подключения к development серверу

### Уведомления

- `SLACK_WEBHOOK_URL` - URL webhook для отправки уведомлений в Slack

## Production Environment

### Сервер

- `PROD_HOST` - IP адрес или домен продакшен сервера
- `PROD_USER` - пользователь для SSH подключения к продакшен серверу

### База данных

- `PROD_DB_HOST` - хост базы данных
- `PROD_DB_PORT` - порт базы данных (обычно 5432)
- `PROD_DB_NAME` - имя базы данных
- `PROD_DB_USER` - пользователь базы данных
- `PROD_DB_PASSWORD` - пароль базы данных

### Приложение

- `PROD_JWT_ACCESS_SECRET` - секретный ключ для JWT access токенов
- `PROD_JWT_REFRESH_SECRET` - секретный ключ для JWT refresh токенов
- `PROD_BOT_TOKEN` - токен Telegram бота
- `PROD_TELEGRAM_WEBHOOK_URL` - URL для Telegram webhook
- `PROD_MINI_APP_URL` - URL для Telegram мини-приложения

### Frontend URLs

- `PROD_FRONTEND_URL` - URL фронтенда
- `PROD_BACKEND_URL` - URL бэкенда
- `PROD_ALLOWED_ORIGINS` - разрешенные домены для CORS

### Яндекс Карты

- `PROD_YANDEX_MAP_JS_API` - ключ API Яндекс Карт JavaScript
- `PROD_YANDEX_MAPS_API_KEY` - ключ API Яндекс Карт
- `PROD_GEOSUGGEST` - ключ API для геопоиска

### AWS S3 Storage

- `PROD_AWS_REGION` - регион AWS
- `PROD_AWS_ACCESS_KEY_ID` - Access Key ID для AWS
- `PROD_AWS_SECRET_ACCESS_KEY` - Secret Access Key для AWS
- `PROD_S3_BUCKET_NAME` - имя S3 bucket
- `PROD_S3_ENDPOINT` - endpoint S3
- `PROD_S3_FORCE_PATH_STYLE` - стиль пути S3

## Staging Environment

### Сервер

- `STAGING_HOST` - IP адрес или домен staging сервера
- `STAGING_USER` - пользователь для SSH подключения к staging серверу

### База данных

- `STAGING_DB_HOST` - хост базы данных
- `STAGING_DB_PORT` - порт базы данных
- `STAGING_DB_NAME` - имя базы данных
- `STAGING_DB_USER` - пользователь базы данных
- `STAGING_DB_PASSWORD` - пароль базы данных

### Приложение

- `STAGING_JWT_ACCESS_SECRET` - секретный ключ для JWT access токенов
- `STAGING_JWT_REFRESH_SECRET` - секретный ключ для JWT refresh токенов
- `STAGING_BOT_TOKEN` - токен Telegram бота
- `STAGING_TELEGRAM_WEBHOOK_URL` - URL для Telegram webhook
- `STAGING_MINI_APP_URL` - URL для Telegram мини-приложения

### Frontend URLs

- `STAGING_FRONTEND_URL` - URL фронтенда
- `STAGING_BACKEND_URL` - URL бэкенда
- `STAGING_ALLOWED_ORIGINS` - разрешенные домены для CORS

### Яндекс Карты

- `STAGING_YANDEX_MAP_JS_API` - ключ API Яндекс Карт JavaScript
- `STAGING_YANDEX_MAPS_API_KEY` - ключ API Яндекс Карт
- `STAGING_GEOSUGGEST` - ключ API для геопоиска

### AWS S3 Storage

- `STAGING_AWS_REGION` - регион AWS
- `STAGING_AWS_ACCESS_KEY_ID` - Access Key ID для AWS
- `STAGING_AWS_SECRET_ACCESS_KEY` - Secret Access Key для AWS
- `STAGING_S3_BUCKET_NAME` - имя S3 bucket
- `STAGING_S3_ENDPOINT` - endpoint S3
- `STAGING_S3_FORCE_PATH_STYLE` - стиль пути S3

## Development Environment

### Сервер

- `DEV_HOST` - IP адрес или домен development сервера
- `DEV_USER` - пользователь для SSH подключения к development серверу

### База данных

- `DEV_DB_HOST` - хост базы данных
- `DEV_DB_PORT` - порт базы данных
- `DEV_DB_NAME` - имя базы данных
- `DEV_DB_USER` - пользователь базы данных
- `DEV_DB_PASSWORD` - пароль базы данных

### Приложение

- `DEV_JWT_ACCESS_SECRET` - секретный ключ для JWT access токенов
- `DEV_JWT_REFRESH_SECRET` - секретный ключ для JWT refresh токенов
- `DEV_BOT_TOKEN` - токен Telegram бота
- `DEV_TELEGRAM_WEBHOOK_URL` - URL для Telegram webhook
- `DEV_MINI_APP_URL` - URL для Telegram мини-приложения

### Frontend URLs

- `DEV_FRONTEND_URL` - URL фронтенда
- `DEV_BACKEND_URL` - URL бэкенда
- `DEV_ALLOWED_ORIGINS` - разрешенные домены для CORS

### Яндекс Карты

- `DEV_YANDEX_MAP_JS_API` - ключ API Яндекс Карт JavaScript
- `DEV_YANDEX_MAPS_API_KEY` - ключ API Яндекс Карт
- `DEV_GEOSUGGEST` - ключ API для геопоиска

### AWS S3 Storage

- `DEV_AWS_REGION` - регион AWS
- `DEV_AWS_ACCESS_KEY_ID` - Access Key ID для AWS
- `DEV_AWS_SECRET_ACCESS_KEY` - Secret Access Key для AWS
- `DEV_S3_BUCKET_NAME` - имя S3 bucket
- `DEV_S3_ENDPOINT` - endpoint S3
- `DEV_S3_FORCE_PATH_STYLE` - стиль пути S3

## Как добавить секреты

1. Перейдите в настройки репозитория на GitHub
2. Выберите "Secrets and variables" → "Actions"
3. Нажмите "New repository secret"
4. Добавьте каждый секрет с соответствующим именем и значением

## Environments

Создайте следующие environments в настройках репозитория:

### Production

- Название: `production`
- Protection rules: Require a review to deploy
- Deployment branches: `main`

### Staging

- Название: `staging`
- Protection rules: Require a review to deploy
- Deployment branches: `develop`

### Development

- Название: `development`
- Protection rules: None
- Deployment branches: `develop`

## Генерация SSH ключей

Для генерации SSH ключей выполните:

```bash
# Генерация ключа для продакшена
ssh-keygen -t rsa -b 4096 -C "production@example.com" -f ~/.ssh/production_key

# Генерация ключа для staging
ssh-keygen -t rsa -b 4096 -C "staging@example.com" -f ~/.ssh/staging_key

# Генерация ключа для development
ssh-keygen -t rsa -b 4096 -C "development@example.com" -f ~/.ssh/development_key
```

Добавьте публичные ключи на соответствующие серверы:

```bash
# На сервере
cat ~/.ssh/production_key.pub >> ~/.ssh/authorized_keys
```

## Безопасность

- Никогда не коммитьте секреты в репозиторий
- Регулярно ротируйте секреты
- Используйте разные секреты для разных окружений
- Ограничьте доступ к секретам только необходимыми пользователями

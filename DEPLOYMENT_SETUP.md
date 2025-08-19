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

## Следующие шаги

1. Настройте CI/CD pipeline для автоматического деплоя
2. Добавьте уведомления о статусе деплоя
3. Настройте мониторинг сервера

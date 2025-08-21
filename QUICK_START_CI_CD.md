# 🚀 Быстрый старт CI/CD

## ⚡ Быстрая настройка (5 минут)

### 1. Настройка DNS (если еще не настроено)

```
Добавьте в панели управления доменом:
- A запись: dev → 89.111.169.243
- A запись: staging → 89.111.169.243
```

### 2. Настройка GitHub Secrets

```bash
# Установите GitHub CLI
brew install gh  # macOS
# или скачайте с https://cli.github.com/

# Авторизуйтесь
gh auth login

# Настройте секреты
./scripts/setup-github-secrets.sh
```

### 3. Настройка SSL на сервере

```bash
# Подключитесь к серверу
ssh root@89.111.169.243

# Настройте SSL
cd /var/www/prod
./scripts/setup-ssl.sh
```

### 4. Запуск первой среды

```bash
# Создайте ветку dev
git checkout -b dev
git push origin dev

# Автоматический деплой на https://dev.прибыл.рф
```

## 🔄 Workflow разработки

### Разработка новой функции:

```bash
# 1. Создайте feature ветку
git checkout -b feature/new-feature
git checkout dev

# 2. Разрабатывайте
# ... пишите код ...

# 3. Пуш в dev (автоматический деплой)
git push origin dev
# → Автоматически деплоится на https://dev.прибыл.рф
```

### Тестирование:

```bash
# 1. Переключитесь на staging
git checkout staging
git merge dev
git push origin staging

# 2. Автоматический деплой на https://staging.прибыл.рф
```

### Продакшн:

```bash
# 1. Деплой в продакшн
git checkout main
git merge staging
git push origin main

# 2. Автоматический деплой на https://прибыл.рф
```

## 🛠️ Команды управления

### Проверка статуса:

```bash
./scripts/status.sh
```

### Ручной деплой (если нужно):

```bash
./scripts/deploy-dev.sh      # Dev среда
./scripts/deploy-staging.sh  # Staging среда
./scripts/deploy-production.sh # Production среда
```

### Управление на сервере:

```bash
./scripts/server-manage.sh dev      # Dev на сервере
./scripts/server-manage.sh staging  # Staging на сервере
./scripts/server-manage.sh prod     # Production на сервере
```

## 🌐 Доступные среды

- **🔄 Development**: https://dev.прибыл.рф (hot reload, автоматический деплой с ветки `dev`)
- **🧪 Staging**: https://staging.прибыл.рф (тестирование, автоматический деплой с ветки `staging`)
- **🚀 Production**: https://прибыл.рф (продакшн, автоматический деплой с ветки `main`)

## 📱 Уведомления

После настройки Telegram бота вы будете получать уведомления:

- ✅ Успешный деплой
- ❌ Ошибка деплоя
- 🧪 Статус тестов

## 🚨 Troubleshooting

### Домены не открываются:

```bash
# Проверьте DNS
nslookup dev.прибыл.рф
nslookup staging.прибыл.рф

# Проверьте SSL
sudo certbot certificates
```

### Проблемы с деплоем:

```bash
# Проверьте статус
./scripts/status.sh

# Просмотрите логи
docker-compose logs -f
```

## 🎯 Результат

После настройки у вас будет:

- ✅ **Автоматический CI/CD** - деплой при каждом push
- ✅ **Три среды разработки** с SSL
- ✅ **Hot reload** для быстрой разработки
- ✅ **Telegram уведомления** о статусе
- ✅ **Простое управление** через Git ветки

## 📞 Поддержка

При проблемах:

1. Проверьте статус: `./scripts/status.sh`
2. Просмотрите логи: `docker-compose logs -f`
3. Проверьте GitHub Actions в репозитории

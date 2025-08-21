# 🚀 Автоматический CI/CD и среды разработки

## 📋 Проблемы и решения

### ❌ Текущие проблемы:

1. **DNS работает**, но домены не открываются из-за неправильной конфигурации nginx
2. **SSL сертификаты** не настроены для dev поддомена
3. **Нет автоматического CI/CD** - все делается вручную
4. **Сложная система** переключения между средами

### ✅ Решения:

1. **Автоматический CI/CD** с GitHub Actions
2. **Правильная настройка SSL** для всех доменов
3. **Упрощенная система** управления средами
4. **Hot reload** для разработки

## 🏗️ Архитектура CI/CD

### Схема работы:

```
GitHub Push → GitHub Actions → Автоматический деплой → Сервер
     ↓
   Тестирование → Сборка → Деплой → Уведомления
```

### Среды:

- **🔄 Development**: `https://dev.прибыл.рф` (автоматический деплой с ветки `dev`)
- **🧪 Staging**: `https://staging.прибыл.рф` (автоматический деплой с ветки `staging`)
- **🚀 Production**: `https://прибыл.рф` (автоматический деплой с ветки `main`)

## 🔧 Настройка DNS

### 1. Основной домен (уже настроен):

```
Тип: A
Имя: @
Значение: 89.111.169.243
TTL: 300
```

### 2. Dev поддомен:

```
Тип: A
Имя: dev
Значение: 89.111.169.243
TTL: 300
```

### 3. Staging поддомен:

```
Тип: A
Имя: staging
Значение: 89.111.169.243
TTL: 300
```

## 🔐 Настройка SSL сертификатов

### Автоматическое получение SSL через Let's Encrypt:

```bash
# На сервере
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Получение сертификатов
sudo certbot --nginx -d прибыл.рф -d www.прибыл.рф
sudo certbot --nginx -d dev.прибыл.рф
sudo certbot --nginx -d staging.прибыл.рф

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 GitHub Actions CI/CD

### Workflow файлы:

#### 1. Development (dev.yml)

```yaml
name: Deploy to Development
on:
  push:
    branches: [dev]
  pull_request:
    branches: [dev]

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Dev Server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: 89.111.169.243
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/prod
            git pull origin dev
            ./scripts/deploy-dev.sh
```

#### 2. Staging (staging.yml)

```yaml
name: Deploy to Staging
on:
  push:
    branches: [staging]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Staging Server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: 89.111.169.243
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/prod
            git pull origin staging
            ./scripts/deploy-staging.sh
```

#### 3. Production (production.yml)

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production Server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: 89.111.169.243
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/prod
            git pull origin main
            ./scripts/deploy-production.sh
```

## 📁 Структура проекта

```
├── .github/
│   └── workflows/
│       ├── dev.yml
│       ├── staging.yml
│       └── production.yml
├── scripts/
│   ├── deploy-dev.sh
│   ├── deploy-staging.sh
│   ├── deploy-production.sh
│   └── setup-ci-cd.sh
├── docker-compose.dev.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
├── nginx.dev.conf
├── nginx.staging.conf
├── nginx.prod.conf
└── ...
```

## 🔄 Workflow разработки

### 1. Разработка новой функции:

```bash
# Создание ветки для разработки
git checkout -b feature/new-feature
git checkout dev

# Разработка
# ... пишем код ...

# Пуш в dev ветку (автоматический деплой на dev.прибыл.рф)
git push origin dev
```

### 2. Тестирование:

```bash
# Переключение на staging
git checkout staging
git merge dev
git push origin staging

# Автоматический деплой на staging.прибыл.рф
```

### 3. Продакшн:

```bash
# Деплой в продакшн
git checkout main
git merge staging
git push origin main

# Автоматический деплой на прибыл.рф
```

## 🛠️ Команды для быстрого старта

### Настройка CI/CD:

```bash
# 1. Настройка GitHub Secrets
./scripts/setup-github-secrets.sh

# 2. Настройка сервера
./scripts/setup-ci-cd.sh

# 3. Настройка SSL
./scripts/setup-ssl.sh
```

### Управление средами:

```bash
# Проверка статуса всех сред
./scripts/status.sh

# Ручной деплой (если нужно)
./scripts/deploy-dev.sh
./scripts/deploy-staging.sh
./scripts/deploy-production.sh
```

## 📊 Мониторинг и логи

### Логи в реальном времени:

```bash
# Dev среда
docker-compose -f docker-compose.dev.yml logs -f

# Staging среда
docker-compose -f docker-compose.staging.yml logs -f

# Production среда
docker-compose -f docker-compose.prod.yml logs -f
```

### Мониторинг здоровья:

- Dev: https://dev.прибыл.рф/health
- Staging: https://staging.прибыл.рф/health
- Production: https://прибыл.рф/health

## 🔔 Уведомления

### Telegram уведомления о деплоях:

- Успешный деплой ✅
- Ошибка деплоя ❌
- Статус тестов 🧪

## ⚡ Hot Reload для разработки

### Dev среда с hot reload:

- **Frontend**: Автоматическое обновление при изменении файлов
- **Backend**: Автоматический перезапуск при изменении кода
- **Bot**: Автоматический перезапуск при изменении кода

### Настройка hot reload:

```bash
# В docker-compose.dev.yml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WDS_SOCKET_HOST=0.0.0.0
  - WDS_SOCKET_PORT=3002
```

## 🚨 Troubleshooting

### Проблемы с DNS:

```bash
# Проверка DNS
nslookup dev.прибыл.рф
nslookup staging.прибыл.рф
nslookup прибыл.рф

# Проверка доступности
curl -I https://dev.прибыл.рф
curl -I https://staging.прибыл.рф
curl -I https://прибыл.рф
```

### Проблемы с SSL:

```bash
# Проверка сертификатов
sudo certbot certificates

# Обновление сертификатов
sudo certbot renew

# Проверка nginx конфигурации
sudo nginx -t
sudo systemctl reload nginx
```

### Проблемы с деплоем:

```bash
# Проверка статуса контейнеров
docker-compose ps

# Перезапуск всех контейнеров
docker-compose down && docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

## 📞 Поддержка

При возникновении проблем:

1. **Проверьте статус**: `./scripts/status.sh`
2. **Просмотрите логи**: `docker-compose logs -f`
3. **Проверьте DNS**: `nslookup домен`
4. **Проверьте SSL**: `sudo certbot certificates`

## 🎯 Результат

После настройки у вас будет:

✅ **Автоматический CI/CD** - деплой при каждом push  
✅ **Три среды разработки** - dev, staging, production  
✅ **SSL сертификаты** для всех доменов  
✅ **Hot reload** для быстрой разработки  
✅ **Уведомления** о статусе деплоев  
✅ **Мониторинг** здоровья приложений  
✅ **Простое управление** через Git ветки

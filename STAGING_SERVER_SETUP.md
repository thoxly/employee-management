# Настройка Staging среды на сервере

## 🎯 Цель

Настроить staging среду на домене `dev.прибыл.рф` на сервере `89.111.169.243`

## 📋 Предварительные требования

### 1. DNS настройки

Добавьте A-запись в DNS:

```
dev.прибыл.рф → 89.111.169.243
```

### 2. SSL сертификаты

Создайте SSL сертификаты для домена `dev.прибыл.рф`:

#### Вариант A: Let's Encrypt (рекомендуется)

```bash
# На сервере
sudo apt update
sudo apt install certbot

# Получаем сертификат
sudo certbot certonly --standalone -d dev.прибыл.рф

# Копируем сертификаты в проект
sudo cp /etc/letsencrypt/live/dev.прибыл.рф/fullchain.pem /opt/employee-management/ssl/dev.прибыл.рф.crt
sudo cp /etc/letsencrypt/live/dev.прибыл.рф/privkey.pem /opt/employee-management/ssl/dev.прибыл.рф.key
sudo chown $USER:$USER /opt/employee-management/ssl/dev.прибыл.рф.*
```

#### Вариант B: Самоподписанный сертификат (для тестирования)

```bash
# На сервере
mkdir -p /opt/employee-management/ssl
cd /opt/employee-management/ssl

# Создаем самоподписанный сертификат
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout dev.прибыл.рф.key \
  -out dev.прибыл.рф.crt \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=Company/CN=dev.прибыл.рф"
```

## 🚀 Развертывание

### 1. Автоматическое развертывание (локально)

```bash
# Из локальной среды
./scripts/deploy-staging-to-server.sh
```

### 2. Ручное развертывание (на сервере)

```bash
# Подключаемся к серверу
ssh root@89.111.169.243

# Переходим в проект
cd /opt/employee-management

# Запускаем staging
./scripts/start-staging.sh
```

## 🔧 Проверка и диагностика

### Проверка статуса

```bash
# На сервере
cd /opt/employee-management
./scripts/debug-staging.sh
```

### Проверка логов

```bash
# Логи nginx
docker compose -f docker-compose.staging.yml logs nginx

# Логи frontend
docker compose -f docker-compose.staging.yml logs frontend

# Логи backend
docker compose -f docker-compose.staging.yml logs backend
```

### Проверка доступности

```bash
# Проверка HTTP
curl -I http://dev.прибыл.рф

# Проверка HTTPS
curl -I https://dev.прибыл.рф

# Проверка API
curl https://dev.прибыл.рф/api/health
```

## 🔄 Управление средами

### Переключение на staging

```bash
# Останавливаем production
docker compose down

# Запускаем staging
./scripts/start-staging.sh
```

### Переключение на production

```bash
# Останавливаем staging
./scripts/stop-staging.sh

# Запускаем production
docker compose up -d
```

## 🐛 Устранение проблем

### Проблема: Редирект на HTTPS

**Решение:** Проверьте SSL сертификаты и nginx конфигурацию

### Проблема: Сервисы недоступны

**Решение:** Проверьте логи и статус контейнеров

### Проблема: DNS не резолвится

**Решение:** Проверьте A-запись в DNS настройках

## 📊 Мониторинг

### Полезные команды

```bash
# Статус контейнеров
docker compose -f docker-compose.staging.yml ps

# Использование ресурсов
docker stats

# Проверка портов
netstat -tlnp | grep -E ":(80|443|3002|3003|3004)"
```

## 🔒 Безопасность

- Staging использует отдельную базу данных
- Отдельные порты для избежания конфликтов
- Изолированная Docker сеть
- Отдельные переменные окружения

## 📝 Примечания

- Staging среда работает на портах 3002-3004
- База данных staging на порту 5434
- Все URL в staging используют домен `dev.прибыл.рф`

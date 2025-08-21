# 🖥️ Настройка сервера для CI/CD

## 📋 Что нужно сделать на сервере

### 1. Подключение к серверу

```bash
ssh root@89.111.169.243
```

### 2. Переход в директорию проекта

```bash
cd /var/www/prod
```

### 3. Получение последних изменений

```bash
git fetch origin
git reset --hard origin/main
```

### 4. Настройка SSL сертификатов

```bash
# Установка certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификатов для всех доменов
sudo certbot certonly --standalone -d прибыл.рф -d www.прибыл.рф --non-interactive --agree-tos --email admin@прибыл.рф
sudo certbot certonly --standalone -d dev.прибыл.рф --non-interactive --agree-tos --email admin@прибыл.рф
sudo certbot certonly --standalone -d staging.прибыл.рф --non-interactive --agree-tos --email admin@прибыл.рф

# Настройка автоматического обновления
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

### 5. Проверка SSL сертификатов

```bash
sudo certbot certificates
```

### 6. Запуск первой среды (dev)

```bash
# Остановка всех контейнеров
docker-compose down || true
docker-compose -f docker-compose.dev-server.yml down || true
docker-compose -f docker-compose.staging.yml down || true

# Запуск dev среды
./scripts/deploy-dev.sh
```

## 🔧 Проверка работы

### Проверка контейнеров:

```bash
docker-compose -f docker-compose.dev-server.yml ps
```

### Проверка логов:

```bash
docker-compose -f docker-compose.dev-server.yml logs -f
```

### Проверка доступности:

```bash
curl -I https://dev.прибыл.рф
```

## 🚨 Возможные проблемы

### 1. Порт 80/443 занят

```bash
# Остановка nginx
sudo systemctl stop nginx

# Проверка процессов на портах
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 2. Проблемы с Docker

```bash
# Перезапуск Docker
sudo systemctl restart docker

# Очистка Docker
docker system prune -f
```

### 3. Проблемы с SSL

```bash
# Проверка сертификатов
sudo certbot certificates

# Обновление сертификатов
sudo certbot renew
```

## 📊 Мониторинг

### Статус всех сред:

```bash
./scripts/status.sh
```

### Логи в реальном времени:

```bash
# Dev среда
docker-compose -f docker-compose.dev-server.yml logs -f

# Staging среда
docker-compose -f docker-compose.staging.yml logs -f

# Production среда
docker-compose logs -f
```

## 🔄 Управление средами

### Переключение между средами:

```bash
./scripts/deploy-dev.sh      # Dev среда
./scripts/deploy-staging.sh  # Staging среда
./scripts/deploy-production.sh # Production среда
```

### Остановка всех сред:

```bash
docker-compose down
docker-compose -f docker-compose.dev-server.yml down
docker-compose -f docker-compose.staging.yml down
```

## 🎯 Результат

После настройки на сервере:

- ✅ **SSL сертификаты** для всех доменов
- ✅ **Dev среда** доступна по https://dev.прибыл.рф
- ✅ **Staging среда** готова к запуску
- ✅ **Production среда** готова к запуску
- ✅ **Автоматические деплои** будут работать

## 📞 Следующие шаги

1. **Настройте DNS записи** (см. DNS_SETUP_GUIDE.md)
2. **Настройте GitHub Secrets** (см. QUICK_START_CI_CD.md)
3. **Протестируйте автоматический деплой**:
   ```bash
   git checkout dev
   # внесите изменения
   git push origin dev
   ```

# Локальная разработка

## 🚀 Быстрый старт

### 1. Запуск dev среды

```bash
# Запустить dev среду
./scripts/manage-environments.sh dev
```

### 2. Настройка DNS

Для работы с доменом `dev.прибыл.рф` добавьте в файл `/etc/hosts`:

```bash
# Добавить запись в hosts файл
echo "127.0.0.1 dev.прибыл.рф" | sudo tee -a /etc/hosts
```

### 3. Доступ к приложению

После запуска dev среды приложение будет доступно по адресам:

- **Frontend**: http://dev.прибыл.рф
- **Backend API**: http://dev.прибыл.рф/api
- **Bot webhook**: http://dev.прибыл.рф/bot
- **Database**: localhost:5434

### 4. Hot Reload

Dev среда поддерживает hot reload:

- Изменения в коде автоматически применяются
- Кэширование отключено
- WebSocket поддержка для мгновенного обновления

## 🔧 Управление

### Команды управления:

```bash
# Запуск
./scripts/manage-environments.sh dev

# Остановка
./scripts/manage-environments.sh stop

# Статус
./scripts/manage-environments.sh status

# Логи
docker compose -f docker-compose.dev.yml logs -f
```

### Переключение сред:

```bash
# На staging
./scripts/manage-environments.sh staging

# На production
./scripts/manage-environments.sh prod
```

## 🐛 Отладка

### Проверка работы сервисов:

```bash
# Проверить статус
docker compose -f docker-compose.dev.yml ps

# Проверить логи nginx
docker compose -f docker-compose.dev.yml logs nginx

# Проверить логи frontend
docker compose -f docker-compose.dev.yml logs frontend

# Проверить логи backend
docker compose -f docker-compose.dev.yml logs backend
```

### Тестирование API:

```bash
# Health check
curl http://localhost/health

# Frontend
curl http://localhost/

# Backend API
curl http://localhost/api/
```

## 📝 Особенности dev среды

- **HTTP без SSL** для упрощения разработки
- **CORS разрешен** для всех доменов
- **Мягкие лимиты** запросов
- **Отключенное кэширование**
- **WebSocket поддержка** для hot reload
- **Отдельная база данных** (порт 5434)

## ⚠️ Важные замечания

1. **Одновременно может работать только одна среда**
2. **База данных изолирована** от других сред
3. **Изменения в коде** автоматически применяются
4. **Для продакшна** используйте staging для тестирования

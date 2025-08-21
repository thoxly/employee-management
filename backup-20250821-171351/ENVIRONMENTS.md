# Управление средами разработки

Этот проект поддерживает три среды разработки:

## 🌐 Среды

### 1. **Dev (Разработка)**

- **Локально**: `http://localhost/`
- **На сервере**: `http://dev.прибыл.рф`
- **Назначение**: Активная разработка с hot reload
- **Особенности**:
  - Автоматическое обновление при изменении кода
  - Отключенное кэширование
  - CORS разрешен для всех доменов
  - Мягкие лимиты запросов
  - WebSocket поддержка для hot reload

### 2. **Staging (Тестирование)**

- **URL**: `https://dev.прибыл.рф` (с SSL)
- **Назначение**: Тестирование перед деплоем на продакшн
- **Особенности**:
  - SSL сертификаты
  - Более строгие настройки безопасности
  - Отдельная база данных

### 3. **Production (Продакшн)**

- **URL**: `https://прибыл.рф`
- **Назначение**: Рабочая версия для пользователей
- **Особенности**:
  - Максимальная производительность
  - Строгие настройки безопасности
  - Кэширование включено

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Запуск dev среды (локально)
./scripts/manage-environments.sh dev

# Остановка всех сред
./scripts/manage-environments.sh stop

# Проверка статуса
./scripts/manage-environments.sh status
```

### Серверное управление

```bash
# Настройка dev среды на сервере (первый раз)
./scripts/setup-server-dev.sh

# Синхронизация кода с сервером
./scripts/sync-to-server.sh dev

# Управление средами на сервере
./scripts/server-manage.sh dev      # запустить dev
./scripts/server-manage.sh staging  # запустить staging
./scripts/server-manage.sh prod     # запустить production
./scripts/server-manage.sh status   # показать статус
./scripts/server-manage.sh logs     # показать логи
```

## 📋 Команды управления

### Локальная разработка

```bash
# Запуск
./scripts/manage-environments.sh dev

# Остановка
./scripts/manage-environments.sh stop

# Логи
docker compose -f docker-compose.dev.yml logs -f
```

### Серверное управление

```bash
# Настройка (первый раз)
./scripts/setup-server-dev.sh

# Синхронизация
./scripts/sync-to-server.sh dev

# Управление
./scripts/server-manage.sh dev
./scripts/server-manage.sh staging
./scripts/server-manage.sh prod
./scripts/server-manage.sh status
./scripts/server-manage.sh logs
```

## 🔧 Настройка DNS

Для работы с доменом `dev.прибыл.рф` необходимо настроить DNS:

### В панели управления доменом добавьте:

```
Тип: A
Имя: dev
Значение: 89.111.169.243
TTL: 300
```

Это создаст запись: `dev.прибыл.рф → 89.111.169.243`

## 📁 Структура файлов

```
├── docker-compose.yml          # Локальная разработка
├── docker-compose.dev.yml      # Dev среда
├── docker-compose.staging.yml  # Staging среда
├── docker-compose.prod.yml     # Production среда
├── nginx.conf                  # Production nginx
├── nginx.dev.conf              # Dev nginx
├── nginx.staging.conf          # Staging nginx
├── env.development             # Переменные для dev
├── env.staging                 # Переменные для staging
├── env.production              # Переменные для production
└── scripts/
    ├── manage-environments.sh  # Локальное управление
    ├── server-manage.sh        # Серверное управление
    ├── setup-server-dev.sh     # Настройка сервера
    ├── sync-to-server.sh       # Синхронизация с сервером
    └── ...
```

## 🔄 Workflow разработки

### Вариант 1: Локальная разработка

1. **Разработка**: `./scripts/manage-environments.sh dev`
2. **Тестирование**: `./scripts/server-manage.sh staging`
3. **Деплой**: `./scripts/server-manage.sh prod`

### Вариант 2: Серверная разработка

1. **Синхронизация**: `./scripts/sync-to-server.sh dev`
2. **Запуск**: `./scripts/server-manage.sh dev`
3. **Тестирование**: `./scripts/server-manage.sh staging`
4. **Деплой**: `./scripts/server-manage.sh prod`

## 🐛 Отладка

### Локальная отладка

```bash
# Dev среда
docker compose -f docker-compose.dev.yml logs -f

# Staging среда
docker compose -f docker-compose.staging.yml logs -f

# Production среда
docker compose logs -f
```

### Серверная отладка

```bash
# Статус всех сред
./scripts/server-manage.sh status

# Логи конкретной среды
./scripts/server-manage.sh logs
```

## ⚠️ Важные замечания

1. **Одновременно может работать только одна среда**
2. **Dev среда использует HTTP (без SSL) для упрощения разработки**
3. **Staging и Production используют HTTPS**
4. **Базы данных изолированы между средами**
5. **Hot reload работает только в локальной dev среде**

## 🔐 Безопасность

- **Dev**: Минимальные ограничения для удобства разработки
- **Staging**: Средние ограничения для тестирования
- **Production**: Максимальные ограничения для безопасности

## 📞 Поддержка

При возникновении проблем:

1. Проверьте статус сред: `./scripts/manage-environments.sh status`
2. Просмотрите логи соответствующей среды
3. Перезапустите среду: `./scripts/manage-environments.sh stop && ./scripts/manage-environments.sh dev`

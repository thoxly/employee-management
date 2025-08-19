# Employee Management System - Monorepo

Система управления сотрудниками с интеграцией Telegram бота и веб-интерфейсом, организованная как монорепозиторий.

## 🏗️ Архитектура

Это монорепозиторий, содержащий следующие компоненты:

```
employee-management/
├── backend/          # API сервер (Node.js + Express)
├── frontend/         # React приложение
├── bot/             # Telegram бот
├── .github/         # GitHub Actions workflows
├── scripts/         # Утилиты и скрипты
└── docker-compose.yml
```

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий**

   ```bash
   git clone https://github.com/thoxly/arrive-rf.git
   cd arrive-rf
   ```

2. **Установите зависимости**

   ```bash
   npm run install:all
   ```

3. **Настройте переменные окружения**

   ```bash
   # Скопируйте файл для локальной разработки
   cp env.development .env

   # Сгенерируйте безопасные ключи
   node scripts/generate-secrets.js

   # Отредактируйте .env файл
   nano .env
   ```

4. **Запустите с помощью Docker Compose**

   ```bash
   npm run docker:dev
   ```

   Или запустите компоненты локально:

   ```bash
   npm run dev
   ```

### Продакшен развертывание

1. **Настройте GitHub Secrets**:

   ```bash
   # Автоматическая генерация команд для добавления секретов
   node scripts/setup-github-secrets.js production
   node scripts/setup-github-secrets.js staging
   node scripts/setup-github-secrets.js development

   # Или настройте вручную (см. [SECRETS_SETUP.md](.github/SECRETS_SETUP.md))
   ```

2. **Создайте environments в GitHub**:

   - `production` - для продакшена
   - `staging` - для staging
   - `development` - для development

3. **Деплой автоматически запустится при push в main**

## 📋 Основные возможности

- **Управление компаниями и сотрудниками**
- **Создание и назначение задач**
- **Отслеживание местоположения сотрудников**
- **Интеграция с Telegram для мобильных сотрудников**
- **Веб-интерфейс для администраторов**
- **Система уведомлений**
- **Автоматический CI/CD**

## 🛠️ Технологии

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Bootstrap
- **Bot**: node-telegram-bot-api
- **Maps**: Yandex Maps API
- **Deployment**: Docker, Docker Compose, GitHub Actions
- **CI/CD**: GitHub Actions, GitHub Container Registry

## 🔄 CI/CD Pipeline

### Workflows

- **`deploy-production.yml`** - Деплой в продакшен при push в `main`
- **`deploy-development.yml`** - Деплой в staging/development при push в `develop` или PR
- **`test.yml`** - Тестирование при каждом PR

### Environments

- **Production** (`main` branch) - Продакшен сервер
- **Staging** (`develop` branch) - Staging сервер
- **Development** (PR) - Временные окружения для PR

## 📁 Структура монорепозитория

### Корневые скрипты

```bash
# Разработка
npm run dev                    # Запуск всех сервисов локально
npm run dev:backend           # Только backend
npm run dev:frontend          # Только frontend
npm run dev:bot               # Только bot

# Сборка
npm run build                 # Сборка всех компонентов
npm run build:backend         # Сборка backend
npm run build:frontend        # Сборка frontend
npm run build:bot             # Сборка bot

# Docker
npm run docker:dev           # Запуск в dev режиме
npm run docker:prod          # Запуск в prod режиме
npm run docker:staging       # Запуск в staging режиме
npm run docker:down          # Остановка контейнеров
npm run docker:build         # Сборка образов
npm run docker:logs          # Просмотр логов

# Тестирование
npm test                     # Запуск всех тестов
npm run lint                 # Проверка кода
npm run clean                # Очистка node_modules
```

## 🔧 Разработка

### Добавление новых зависимостей

```bash
# В корне монорепозитория
npm install package-name --workspace=backend
npm install package-name --workspace=frontend
npm install package-name --workspace=bot
```

### Создание новой ветки

```bash
# Для новой функции
git checkout -b feature/new-feature

# Для исправления бага
git checkout -b fix/bug-description

# Для hotfix
git checkout -b hotfix/critical-fix
```

### Workflow разработки

1. Создайте ветку от `develop`
2. Разработайте функционал
3. Создайте Pull Request в `develop`
4. После ревью и тестов, PR будет автоматически задеплоен
5. После тестирования в staging, создайте PR из `develop` в `main`

## 🐳 Docker

### Локальная разработка

```bash
docker-compose up -d
```

### Продакшен

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Staging

```bash
docker-compose -f docker-compose.staging.yml up -d
```

## 📚 Документация

- [Настройка переменных окружения](ENV_SETUP.md)
- [Быстрый старт](QUICK_START.md)
- [Настройка GitHub Secrets](.github/SECRETS_SETUP.md)
- [Docker Guide](DOCKER_GUIDE.md)

## 🔐 Безопасность

- Все секреты хранятся в GitHub Secrets
- Разные секреты для разных окружений
- Автоматическое сканирование уязвимостей
- Регулярные обновления зависимостей

## 🤝 Contributing

1. Fork репозиторий
2. Создайте ветку для вашей функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

- **Issues**: [GitHub Issues](https://github.com/thoxly/arrive-rf/issues)
- **Discussions**: [GitHub Discussions](https://github.com/thoxly/arrive-rf/discussions)

---

**Версия**: 1.0.0  
**Последнее обновление**: 2024

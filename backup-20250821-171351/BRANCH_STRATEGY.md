# Стратегия веток (Git Flow)

Этот документ описывает стратегию веток для монорепозитория Employee Management System.

## 🌿 Основные ветки

### `main` (продакшен)

- **Назначение**: Продакшен код
- **Источник**: `develop` через Pull Request
- **Автоматический деплой**: Да (в продакшен)
- **Защита**: Да (требует ревью)

### `develop` (разработка)

- **Назначение**: Интеграционная ветка для разработки
- **Источник**: feature ветки через Pull Request
- **Автоматический деплой**: Да (в staging)
- **Защита**: Да (требует ревью)

## 🌱 Временные ветки

### `feature/*`

- **Назначение**: Разработка новых функций
- **Источник**: `develop`
- **Цель**: `develop`
- **Названия**: `feature/user-authentication`, `feature/task-management`

### `fix/*`

- **Назначение**: Исправление багов
- **Источник**: `develop`
- **Цель**: `develop`
- **Названия**: `fix/login-error`, `fix/database-connection`

### `hotfix/*`

- **Назначение**: Критические исправления для продакшена
- **Источник**: `main`
- **Цель**: `main` и `develop`
- **Названия**: `hotfix/security-vulnerability`, `hotfix/critical-bug`

### `release/*`

- **Назначение**: Подготовка релиза
- **Источник**: `develop`
- **Цель**: `main` и `develop`
- **Названия**: `release/v1.2.0`, `release/v2.0.0`

## 🔄 Workflow разработки

### 1. Начало работы над новой функцией

```bash
# Убедитесь, что develop актуальна
git checkout develop
git pull origin develop

# Создайте feature ветку
git checkout -b feature/new-feature
```

### 2. Разработка

```bash
# Вносите изменения и коммитьте
git add .
git commit -m "feat: add new feature"

# Периодически синхронизируйтесь с develop
git fetch origin
git rebase origin/develop
```

### 3. Завершение разработки

```bash
# Убедитесь, что все тесты проходят
npm test

# Проверьте код
npm run lint

# Создайте Pull Request в develop
git push origin feature/new-feature
```

### 4. Code Review

- Создайте Pull Request в `develop`
- Дождитесь ревью и одобрения
- После merge ветка автоматически удаляется

### 5. Релиз в продакшен

```bash
# Создайте release ветку
git checkout develop
git checkout -b release/v1.2.0

# Внесите финальные изменения (версия, документация)
git add .
git commit -m "chore: prepare release v1.2.0"

# Создайте Pull Request в main
git push origin release/v1.2.0
```

## 🚨 Hotfix процесс

### 1. Создание hotfix

```bash
# Создайте hotfix ветку от main
git checkout main
git checkout -b hotfix/critical-fix
```

### 2. Исправление

```bash
# Внесите исправления
git add .
git commit -m "fix: critical security vulnerability"

# Создайте Pull Request в main
git push origin hotfix/critical-fix
```

### 3. Merge в main и develop

После merge в `main`:

```bash
git checkout develop
git merge main
git push origin develop
```

## 📋 Правила именования

### Коммиты

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve login error
docs: update README
style: format code
refactor: restructure components
test: add unit tests
chore: update dependencies
```

### Ветки

```
feature/user-dashboard
fix/database-connection
hotfix/security-patch
release/v1.2.0
```

## 🔒 Защита веток

### main

- ✅ Require a pull request before merging
- ✅ Require approvals (2)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### develop

- ✅ Require a pull request before merging
- ✅ Require approvals (1)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging

## 🧪 CI/CD интеграция

### Автоматические проверки

- **Тестирование**: При каждом PR
- **Линтинг**: При каждом PR
- **Сборка Docker**: При каждом PR
- **Сканирование безопасности**: При каждом PR

### Автоматический деплой

- **PR в develop**: Деплой в development окружение
- **Push в develop**: Деплой в staging
- **Merge в main**: Деплой в продакшен

## 📊 Мониторинг

### GitHub Insights

- **Network**: Визуализация истории веток
- **Pulse**: Активность репозитория
- **Contributors**: Вклад участников

### Метрики

- Время от PR до merge
- Количество конфликтов
- Покрытие тестами
- Качество кода

## 🛠️ Полезные команды

```bash
# Просмотр всех веток
git branch -a

# Удаление локальных веток
git branch -d feature/completed-feature

# Удаление удаленных веток
git push origin --delete feature/completed-feature

# Просмотр истории веток
git log --graph --oneline --all

# Синхронизация с удаленным репозиторием
git fetch --prune

# Очистка локальных веток
git remote prune origin
```

## 📚 Дополнительные ресурсы

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Branching Strategies](https://www.atlassian.com/git/tutorials/comparing-workflows)

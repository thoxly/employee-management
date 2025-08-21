# ⚡ Быстрый старт - Employee Management System

## 🚀 Проект развернут и работает!

### 🌐 Доступ к приложению

- **Веб-интерфейс:** https://прибыл.рф/
- **API:** https://прибыл.рф/api/

---

## 🔧 Основные команды для управления

### Проверить статус всех сервисов

```bash
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml ps"
```

### Посмотреть логи

```bash
# Все сервисы
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs"

# Конкретный сервис (frontend, backend, bot, nginx, db)
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml logs [service_name]"
```

### Обновить код на сервере

```bash
ssh root@89.111.169.243 "cd /var/www/prod && git pull && docker-compose -f docker-compose.prod.yml up -d"
```

### Перезапустить сервис

```bash
ssh root@89.111.169.243 "cd /var/www/prod && docker-compose -f docker-compose.prod.yml restart [service_name]"
```

---

## 🐛 Устранение проблем

### Если что-то не работает:

1. **Проверить статус:** `docker-compose -f docker-compose.prod.yml ps`
2. **Посмотреть логи:** `docker-compose -f docker-compose.prod.yml logs [service_name]`
3. **Перезапустить:** `docker-compose -f docker-compose.prod.yml restart [service_name]`

### Если не хватает места:

```bash
ssh root@89.111.169.243 "docker system prune -af"
```

---

## 📞 Контакты

- **Сервер:** 89.111.169.243
- **SSH:** root@89.111.169.243
- **Домен:** прибыл.рф

---

**📖 Подробная документация:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

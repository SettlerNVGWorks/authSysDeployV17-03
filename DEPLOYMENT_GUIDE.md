# 🚀 Полное руководство по развертыванию PrognozSports1.ru на Aeza

## 📋 Что подготовлено

✅ Docker конфигурация для всех сервисов  
✅ Production настройки для backend и frontend  
✅ Nginx с SSL поддержкой  
✅ Автоматические скрипты развертывания  
✅ MongoDB с индексами  
✅ Система логирования  

## 🖥️ Требования к серверу Aeza

- **ОС**: Ubuntu 20.04 или новее
- **RAM**: Минимум 2GB (рекомендуется 4GB)
- **CPU**: 2+ ядра
- **Диск**: 20GB+ свободного места
- **Сеть**: Статический IP адрес

## 📍 Пошаговая инструкция

### Шаг 1: Подготовка сервера

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
sudo apt install -y curl wget git nginx ufw

# Настраиваем firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### Шаг 2: Установка Docker

```bash
# Устанавливаем Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезайдите в систему для применения изменений группы
exit
# Войдите заново по SSH
```

### Шаг 3: Настройка домена

В панели управления вашим доменом PrognozSports1.ru:

1. Создайте A-запись:
   - **Тип**: A
   - **Имя**: @ (или пустое)
   - **Значение**: IP адрес вашего сервера Aeza
   - **TTL**: 300

2. Создайте A-запись для www:
   - **Тип**: A  
   - **Имя**: www
   - **Значение**: IP адрес вашего сервера Aeza
   - **TTL**: 300

### Шаг 4: Загрузка проекта на сервер

```bash
# Клонируйте проект (или загрузите файлы)
git clone <ваш-репозиторий> sport-predictions
cd sport-predictions

# Или создайте папку и загрузите файлы
mkdir sport-predictions
cd sport-predictions
# Загрузите все файлы проекта сюда
```

### Шаг 5: Настройка переменных окружения

```bash
# Проверьте и отредактируйте production настройки
nano backend/.env.production

# ВАЖНО: Измените следующие параметры:
# - JWT_SECRET (создайте сложный секретный ключ)
# - SENDGRID_FROM_EMAIL (на ваш домен noreply@prognozSports1.ru)
# - Email настройки если нужно
```

### Шаг 6: Развертывание приложения

```bash
# Делаем скрипты исполняемыми
chmod +x deploy.sh
chmod +x ssl-setup.sh

# Запускаем развертывание
./deploy.sh
```

### Шаг 7: Настройка SSL сертификатов

```bash
# ВАЖНО: Дождитесь когда DNS запись начнет работать (до 24 часов)
# Проверьте: ping prognozSports1.ru

# Настройте SSL
./ssl-setup.sh
```

## 🔧 Проверка работоспособности

После развертывания проверьте:

```bash
# Статус сервисов
docker-compose ps

# Логи если что-то не работает
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
docker-compose logs mongodb

# Проверка API
curl https://prognozSports1.ru/api/health

# Проверка сайта
curl https://prognozSports1.ru
```

## 📊 Мониторинг и управление

### Полезные команды:

```bash
# Просмотр логов в реальном времени
docker-compose logs -f backend
docker-compose logs -f nginx

# Перезапуск сервиса
docker-compose restart backend
docker-compose restart frontend

# Обновление приложения
git pull
docker-compose up -d --build

# Полная остановка
docker-compose down

# Очистка логов
sudo truncate -s 0 logs/nginx/*.log
```

### Автоматические бэкапы:

```bash
# Создайте скрипт бэкапа MongoDB
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
docker-compose exec -T mongodb mongodump --db sport_predictions --archive=/tmp/backup_$DATE.archive
docker-compose cp mongodb:/tmp/backup_$DATE.archive ./backups/
docker-compose exec -T mongodb rm /tmp/backup_$DATE.archive
```

## 🔍 Тестирование интеграций

### Email (SendGrid):
1. Откройте сайт и попробуйте регистрацию
2. Проверьте логи: `docker-compose logs backend | grep sendgrid`

### Telegram Bot:
1. Перейдите к боту: https://t.me/ByWin52Bot
2. Проверьте что бот отвечает
3. Проверьте логи: `docker-compose logs backend | grep telegram`

### Sports API:
1. Откройте https://prognozSports1.ru
2. Проверьте что загружаются матчи
3. Проверьте API: https://prognozSports1.ru/api/matches/today

## 🚨 Решение проблем

### Если сайт не открывается:
```bash
# Проверьте DNS
nslookup prognozSports1.ru

# Проверьте nginx
docker-compose logs nginx

# Проверьте firewall
sudo ufw status
```

### Если API не работает:
```bash
# Проверьте backend
docker-compose logs backend

# Проверьте MongoDB
docker-compose exec mongodb mongosh sport_predictions --eval "db.stats()"
```

### Если SSL не работает:
```bash
# Проверьте сертификаты
sudo certbot certificates

# Перезапустите nginx
docker-compose restart nginx
```

## 📞 Поддержка

После развертывания ваш сайт будет доступен по адресам:
- **Основной**: https://prognozSports1.ru
- **С www**: https://www.prognozSports1.ru

**Важные файлы конфигурации:**
- `docker-compose.yml` - основная конфигурация
- `nginx/nginx.conf` - настройки веб-сервера
- `backend/.env.production` - настройки backend
- `frontend/.env.production` - настройки frontend

**Логи находятся в:**
- `logs/nginx/` - логи веб-сервера
- `docker-compose logs` - логи приложений
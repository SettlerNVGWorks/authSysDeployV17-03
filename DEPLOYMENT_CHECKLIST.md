# 📋 Чек-лист развертывания PrognozSports1.ru

## ✅ Подготовка завершена

### 🔧 Что создано:

- **Docker Configuration** ✅
  - `docker-compose.yml` - основная конфигурация
  - `backend/Dockerfile` - контейнер для Node.js
  - `frontend/Dockerfile` - контейнер для React
  - `nginx/nginx.conf` - веб-сервер с SSL

- **Production Settings** ✅
  - `backend/.env.production` - настройки для продакшена
  - `frontend/.env.production` - конфигурация фронтенда
  - `mongo-init.js` - инициализация базы данных

- **Deployment Scripts** ✅
  - `deploy.sh` - автоматическое развертывание
  - `ssl-setup.sh` - настройка SSL сертификатов
  - `test-integrations.sh` - проверка интеграций

- **Documentation** ✅
  - `DEPLOYMENT_GUIDE.md` - полное руководство
  - Этот чек-лист

## 🎯 Что нужно сделать на сервере:

### 1. Подготовка сервера Aeza:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx ufw
sudo ufw allow ssh && sudo ufw allow 80 && sudo ufw allow 443
sudo ufw --force enable
```

### 2. Установка Docker:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Настройка DNS:
- **A-запись**: @ → IP сервера
- **A-запись**: www → IP сервера
- **TTL**: 300 секунд

### 4. Загрузка проекта:
```bash
# Загрузите все файлы проекта на сервер
mkdir sport-predictions
cd sport-predictions
# Скопируйте все файлы сюда
```

### 5. Развертывание:
```bash
chmod +x *.sh
./deploy.sh
```

### 6. Настройка SSL (после работы DNS):
```bash
./ssl-setup.sh
```

### 7. Проверка:
```bash
./test-integrations.sh
```

## 🔍 Проверка работоспособности:

### Backend API:
- ✅ https://prognozSports1.ru/api/health
- ✅ https://prognozSports1.ru/api/stats
- ✅ https://prognozSports1.ru/api/matches/today

### Frontend:
- ✅ https://prognozSports1.ru
- ✅ https://www.prognozSports1.ru

### Интеграции:
- 📧 **Email**: Регистрация и подтверждение
- 🤖 **Telegram**: @ByWin52Bot
- 🏒 **Sports API**: Матчи и статистика

## ⚠️ Важные моменты:

### Email настройки:
- **From email**: `noreply@prognozSports1.ru`
- **SendGrid API**: Настроен и работает
- **Verification URL**: `https://prognozSports1.ru/verify-email`

### Telegram настройки:
- **Bot Username**: @ByWin52Bot
- **Webhook URL**: `https://prognozSports1.ru/api/telegram/webhook`
- **Auth URL**: `https://t.me/ByWin52Bot?start=auth_TOKEN`

### Security:
- **JWT Secret**: Изменить в production!
- **SSL**: Let's Encrypt автообновление
- **CORS**: Настроен для prognozSports1.ru
- **Rate Limiting**: Включен

## 🚀 После развертывания:

### 1. Настройка Telegram webhook:
```bash
curl -X POST https://prognozSports1.ru/api/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://prognozSports1.ru/api/telegram/webhook"}'
```

### 2. Тестирование:
- Откройте https://prognozSports1.ru
- Зарегистрируйтесь с email
- Проверьте почту для подтверждения
- Попробуйте Telegram авторизацию
- Проверьте загрузку матчей

### 3. Мониторинг:
```bash
# Логи в реальном времени
docker-compose logs -f backend
docker-compose logs -f nginx

# Статус сервисов
docker-compose ps

# Проверка SSL
curl -I https://prognozSports1.ru
```

## 📞 Техническая поддержка:

### Полезные команды:
```bash
# Перезапуск сервиса
docker-compose restart backend

# Обновление приложения
git pull && docker-compose up -d --build

# Бэкап базы данных
docker-compose exec mongodb mongodump --db sport_predictions --archive=/tmp/backup.archive

# Просмотр логов
docker-compose logs backend | grep error
```

### Файлы логов:
- **Nginx**: `logs/nginx/access.log`, `logs/nginx/error.log`
- **Backend**: `docker-compose logs backend`
- **Frontend**: `docker-compose logs frontend`

## 🎉 Готово!

После выполнения всех шагов ваш сайт **PrognozSports1.ru** будет полностью работать в интернете с:

- ✅ HTTPS сертификатом
- ✅ Собственным доменом
- ✅ Регистрацией через email
- ✅ Авторизацией через Telegram
- ✅ Реальными спортивными данными
- ✅ Professional production setup

**Ваш сайт будет доступен людям по адресу: https://prognozSports1.ru** 🚀
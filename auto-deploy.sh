#!/bin/bash

# 🚀 СУПЕР ПРОСТОЙ СКРИПТ РАЗВЕРТЫВАНИЯ НА СЕРВЕРЕ
# Скопируйте этот скрипт на сервер и запустите!

set -e

echo "🚀 Начинаем развертывание сайта на IP 185.174.136.113..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Функция для проверки команд
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 не найден. Устанавливаем...${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 найден${NC}"
        return 0
    fi
}

# Обновляем систему
echo -e "${YELLOW}📦 Обновляю систему...${NC}"
sudo apt update -y

# Устанавливаем необходимые пакеты
echo -e "${YELLOW}📦 Устанавливаю необходимые пакеты...${NC}"
sudo apt install -y curl wget git ufw

# Настраиваем firewall
echo -e "${YELLOW}🔒 Настраиваю firewall...${NC}"
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw --force enable

# Проверяем и устанавливаем Docker
if ! check_command docker; then
    echo -e "${YELLOW}🐳 Устанавливаю Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# Проверяем и устанавливаем Docker Compose
if ! check_command docker-compose; then
    echo -e "${YELLOW}🐳 Устанавливаю Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Клонируем проект
echo -e "${YELLOW}📁 Клонирую проект...${NC}"
if [ -d "sport-predictions" ]; then
    echo -e "${YELLOW}📁 Удаляю старую версию...${NC}"
    rm -rf sport-predictions
fi

git clone https://github.com/SettlerNVGWorks/01-07-DeployVersion sport-predictions
cd sport-predictions

# Запускаем развертывание
echo -e "${YELLOW}🚀 Запускаю развертывание...${NC}"
chmod +x deploy-ip.sh
./deploy-ip.sh

echo ""
echo -e "${GREEN}🎉 ГОТОВО! Ваш сайт развернут!${NC}"
echo ""
echo -e "${GREEN}🌐 Сайт доступен по адресу: http://185.174.136.113${NC}"
echo -e "${GREEN}🔧 API доступен по адресу: http://185.174.136.113/api/health${NC}"
echo ""
echo -e "${YELLOW}📊 Полезные команды:${NC}"
echo "   Статус сервисов: docker-compose ps"
echo "   Логи: docker-compose logs"
echo "   Перезапуск: docker-compose restart"
echo "   Остановка: docker-compose down"
echo ""
echo -e "${YELLOW}⚠️  Если нужно перезайти в систему после установки Docker, выполните:${NC}"
echo "   exit"
echo "   ssh root@185.174.136.113"
echo "   cd sport-predictions && ./deploy-ip.sh"
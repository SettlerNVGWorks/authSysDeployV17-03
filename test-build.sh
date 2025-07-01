#!/bin/bash

# 🧪 Скрипт для тестирования сборки Docker перед развертыванием

set -e

echo "🧪 Тестируем сборку Docker образов..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Очистка старых образов
echo -e "${YELLOW}🧹 Очищаем Docker cache...${NC}"
docker system prune -f
docker builder prune -f

# Тестируем сборку backend
echo -e "${YELLOW}🔨 Тестируем сборку backend...${NC}"
cd backend
if docker build -t test-backend .; then
    echo -e "${GREEN}✅ Backend собирается успешно${NC}"
    docker rmi test-backend
else
    echo -e "${RED}❌ Ошибка сборки backend${NC}"
    exit 1
fi

# Тестируем сборку frontend
echo -e "${YELLOW}🔨 Тестируем сборку frontend...${NC}"
cd ../frontend
if docker build --build-arg REACT_APP_BACKEND_URL=http://185.174.136.113 -t test-frontend .; then
    echo -e "${GREEN}✅ Frontend собирается успешно${NC}"
    docker rmi test-frontend
else
    echo -e "${RED}❌ Ошибка сборки frontend${NC}"
    exit 1
fi

cd ..

echo -e "${GREEN}🎉 Все образы собираются успешно! Можно развертывать на сервере.${NC}"
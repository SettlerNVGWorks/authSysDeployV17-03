#!/bin/bash

# Deployment script for PrognozSports1.ru
set -e

echo "🚀 Starting deployment for PrognozSports1.ru..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs/nginx
mkdir -p nginx/ssl
mkdir -p data/mongodb

# Set permissions
chmod 755 logs/nginx
chmod 700 nginx/ssl

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

# Pull latest images
echo -e "${YELLOW}📦 Pulling latest images...${NC}"
docker-compose pull

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose up -d --build

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Health check
echo -e "${YELLOW}🔍 Performing health checks...${NC}"

# Check backend
if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs backend
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose logs frontend
fi

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" sport_predictions > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
else
    echo -e "${RED}❌ MongoDB health check failed${NC}"
    docker-compose logs mongodb
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "📋 Service Status:"
docker-compose ps

echo ""
echo "🔗 URLs:"
echo "   Frontend: http://localhost (will redirect to HTTPS)"
echo "   Backend API: https://prognozSports1.ru/api/health"
echo "   Nginx Status: https://prognozSports1.ru/health"

echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose logs -f [service_name]"
echo "   Restart service: docker-compose restart [service_name]"
echo "   Stop all: docker-compose down"
echo "   Update: git pull && ./deploy.sh"

echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "   1. Set up SSL certificates in nginx/ssl/"
echo "   2. Configure your domain DNS to point to this server"
echo "   3. Test email and Telegram integrations"
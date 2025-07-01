#!/bin/bash

# Deployment script for PrognozSports1.ru on IP 185.174.136.113
set -e

echo "🚀 Starting deployment for IP 185.174.136.113..."

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
mkdir -p data/mongodb

# Set permissions
chmod 755 logs/nginx

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

# Clean up old images and build cache
echo -e "${YELLOW}🧹 Cleaning up Docker cache...${NC}"
docker system prune -f
docker builder prune -f

# Build and start services (without pulling - we want fresh builds)
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose up -d --build --force-recreate

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
echo "   Website: http://185.174.136.113"
echo "   Backend API: http://185.174.136.113/api/health"
echo "   Nginx Status: http://185.174.136.113/health"

echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose logs -f [service_name]"
echo "   Restart service: docker-compose restart [service_name]"
echo "   Stop all: docker-compose down"
echo "   Update: git pull && ./deploy-ip.sh"

echo ""
echo -e "${GREEN}✅ Your website is now available at: http://185.174.136.113${NC}"
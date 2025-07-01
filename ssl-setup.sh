#!/bin/bash

# SSL Certificate setup script for PrognozSports1.ru
set -e

echo "🔐 Setting up SSL certificates for PrognozSports1.ru..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="prognozSports1.ru"
EMAIL="admin@prognozSports1.ru"  # Замените на ваш email

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create webroot directory for ACME challenge
echo -e "${YELLOW}📁 Creating webroot directory...${NC}"
sudo mkdir -p /var/www/certbot

# Stop nginx temporarily to allow certbot to bind to port 80
echo -e "${YELLOW}🛑 Stopping nginx temporarily...${NC}"
docker-compose stop nginx

# Generate certificate using standalone mode
echo -e "${YELLOW}🔐 Generating SSL certificate...${NC}"
sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN

# Copy certificates to nginx directory
echo -e "${YELLOW}📋 Copying certificates...${NC}"
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/

# Set proper permissions
sudo chown $(whoami):$(whoami) ./nginx/ssl/fullchain.pem
sudo chown $(whoami):$(whoami) ./nginx/ssl/privkey.pem
chmod 644 ./nginx/ssl/fullchain.pem
chmod 600 ./nginx/ssl/privkey.pem

# Start nginx again
echo -e "${YELLOW}🚀 Starting nginx with SSL...${NC}"
docker-compose up -d nginx

# Set up automatic renewal
echo -e "${YELLOW}⏰ Setting up automatic certificate renewal...${NC}"
sudo crontab -l | grep -v "certbot renew" | sudo crontab -
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cd $(pwd) && docker-compose restart nginx'") | sudo crontab -

echo -e "${GREEN}✅ SSL certificates have been set up successfully!${NC}"
echo ""
echo "🔗 Your site is now available at:"
echo "   https://prognozSports1.ru"
echo "   https://www.prognozSports1.ru"
echo ""
echo "📋 Certificate info:"
sudo certbot certificates

echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Update your DNS records to point to this server"
echo "   2. Test your site: https://prognozSports1.ru"
echo "   3. Check SSL grade: https://www.ssllabs.com/ssltest/"
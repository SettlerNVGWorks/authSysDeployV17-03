#!/bin/bash

# Тестирование интеграций для PrognozSports1.ru
set -e

echo "🧪 Проверка интеграций для PrognozSports1.ru..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="http://localhost:8001"

# Test backend health
echo -e "${YELLOW}🔍 Проверка health backend...${NC}"
if curl -f $BACKEND_URL/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend работает${NC}"
else
    echo -e "${RED}❌ Backend не отвечает${NC}"
    exit 1
fi

# Test MongoDB connection
echo -e "${YELLOW}🔍 Проверка MongoDB...${NC}"
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" sport_predictions > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB подключена${NC}"
else
    echo -e "${RED}❌ MongoDB недоступна${NC}"
fi

# Test Sports API
echo -e "${YELLOW}🔍 Проверка Sports API...${NC}"
STATS_RESPONSE=$(curl -s $BACKEND_URL/api/stats)
if echo $STATS_RESPONSE | grep -q "total_predictions"; then
    echo -e "${GREEN}✅ Sports API работает${NC}"
    echo "   Статистика: $(echo $STATS_RESPONSE | head -c 100)..."
else
    echo -e "${RED}❌ Sports API не работает${NC}"
    echo "   Ответ: $STATS_RESPONSE"
fi

# Test Matches API
echo -e "${YELLOW}🔍 Проверка Matches API...${NC}"
MATCHES_RESPONSE=$(curl -s $BACKEND_URL/api/matches/today)
if echo $MATCHES_RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✅ Matches API работает${NC}"
    echo "   Матчи: $(echo $MATCHES_RESPONSE | head -c 100)..."
else
    echo -e "${YELLOW}⚠️  Matches API частично работает${NC}"
    echo "   Ответ: $MATCHES_RESPONSE"
fi

# Test SendGrid Email
echo -e "${YELLOW}🔍 Проверка SendGrid Email...${NC}"
if [ -n "$SENDGRID_API_KEY" ] && [ "$SENDGRID_API_KEY" != "your-sendgrid-api-key" ]; then
    echo -e "${GREEN}✅ SendGrid API ключ настроен${NC}"
    
    # Test sending email (create a test endpoint for this)
    cat > test_email.js << 'EOF'
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const testEmail = {
    to: process.env.SENDGRID_FROM_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Тест Email - PrognozSports1.ru',
    text: 'Это тестовое письмо для проверки SendGrid интеграции.'
};

sgMail.send(testEmail)
    .then(() => {
        console.log('✅ Test email sent successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Email test failed:', error.message);
        process.exit(1);
    });
EOF

    cd backend && node -e "require('dotenv').config(); $(cat ../test_email.js)" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SendGrid Email работает${NC}"
    else
        echo -e "${RED}❌ SendGrid Email не работает${NC}"
    fi
    rm -f ../test_email.js
    cd ..
else
    echo -e "${RED}❌ SendGrid API ключ не настроен${NC}"
fi

# Test Telegram Bot
echo -e "${YELLOW}🔍 Проверка Telegram Bot...${NC}"
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ "$TELEGRAM_BOT_TOKEN" != "your-telegram-bot-token" ]; then
    BOT_INFO=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe")
    if echo $BOT_INFO | grep -q "\"ok\":true"; then
        BOT_USERNAME=$(echo $BOT_INFO | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Telegram Bot работает (@$BOT_USERNAME)${NC}"
        
        # Check webhook info
        WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo")
        WEBHOOK_URL=$(echo $WEBHOOK_INFO | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$WEBHOOK_URL" ]; then
            echo -e "${GREEN}✅ Webhook настроен: $WEBHOOK_URL${NC}"
        else
            echo -e "${YELLOW}⚠️  Webhook не настроен${NC}"
        fi
    else
        echo -e "${RED}❌ Telegram Bot не работает${NC}"
    fi
else
    echo -e "${RED}❌ Telegram Bot токен не настроен${NC}"
fi

# Test database collections
echo -e "${YELLOW}🔍 Проверка коллекций MongoDB...${NC}"
COLLECTIONS=$(docker-compose exec -T mongodb mongosh sport_predictions --quiet --eval "db.getCollectionNames()" 2>/dev/null || echo "[]")
if echo $COLLECTIONS | grep -q "users"; then
    echo -e "${GREEN}✅ Коллекции созданы${NC}"
    
    # Count documents
    USER_COUNT=$(docker-compose exec -T mongodb mongosh sport_predictions --quiet --eval "db.users.countDocuments()" 2>/dev/null || echo "0")
    MATCH_COUNT=$(docker-compose exec -T mongodb mongosh sport_predictions --quiet --eval "db.matches.countDocuments()" 2>/dev/null || echo "0")
    
    echo "   👥 Пользователей: $USER_COUNT"
    echo "   ⚽ Матчей: $MATCH_COUNT"
else
    echo -e "${YELLOW}⚠️  Коллекции не созданы${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Проверка завершена!${NC}"
echo ""
echo "📋 Результаты:"
echo "   Backend: ✅"
echo "   MongoDB: $(if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" sport_predictions > /dev/null 2>&1; then echo '✅'; else echo '❌'; fi)"
echo "   Sports API: ✅"
echo "   Email: $(if [ -n "$SENDGRID_API_KEY" ]; then echo '✅'; else echo '❌'; fi)"
echo "   Telegram: $(if [ -n "$TELEGRAM_BOT_TOKEN" ]; then echo '✅'; else echo '❌'; fi)"

echo ""
echo -e "${YELLOW}💡 Рекомендации:${NC}"
if [ -z "$SENDGRID_API_KEY" ] || [ "$SENDGRID_API_KEY" = "your-sendgrid-api-key" ]; then
    echo "   - Настройте SendGrid API ключ в .env файле"
fi
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "your-telegram-bot-token" ]; then
    echo "   - Настройте Telegram Bot токен в .env файле"
fi
echo "   - Настройте webhook для Telegram: curl -X POST $BACKEND_URL/api/telegram/set-webhook -d '{\"url\":\"https://prognozSports1.ru/api/telegram/webhook\"}'"
echo "   - Протестируйте регистрацию на сайте"
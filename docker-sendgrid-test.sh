#!/bin/bash

echo "🔧 Диагностика SendGrid в Docker контейнере"
echo "==========================================="

# Проверяем статус контейнеров
echo "📊 Статус Docker контейнеров:"
docker compose ps

echo ""
echo "🔍 Проверяем переменные окружения в backend контейнере:"
docker compose exec backend printenv | grep -E "(SENDGRID|FRONTEND_URL|NODE_ENV)"

echo ""
echo "📧 Запускаем тест SendGrid внутри backend контейнера:"
docker compose exec backend node -e "
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('API Key:', process.env.SENDGRID_API_KEY ? 'Установлен' : 'НЕ УСТАНОВЛЕН');
console.log('From Email:', process.env.SENDGRID_FROM_EMAIL || 'НЕ УСТАНОВЛЕН');
console.log('Frontend URL:', process.env.FRONTEND_URL || 'НЕ УСТАНОВЛЕН');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail.send({
    to: process.env.SENDGRID_FROM_EMAIL,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Тест из Docker',
    text: 'Тестовое письмо из Docker контейнера'
  }).then(() => {
    console.log('✅ Email отправлен успешно');
  }).catch(err => {
    console.error('❌ Ошибка отправки:', err.message);
    if (err.response) {
      console.error('Код ошибки:', err.response.status);
      console.error('Тело ответа:', err.response.body);
    }
  });
} else {
  console.error('❌ SendGrid API key не найден');
}
"

echo ""
echo "📋 Последние логи backend контейнера:"
docker compose logs backend --tail=20
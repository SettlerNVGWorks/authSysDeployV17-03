// Демонстрация универсального email сервиса с Brevo API
require('dotenv').config();

console.log('🔍 Проверка конфигурации email сервисов...\n');

// Проверяем какие сервисы доступны
const checkEmailServices = () => {
  console.log('📋 Доступные email сервисы:');
  
  // Brevo API (приоритет №1)
  if (process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL) {
    console.log('✅ Brevo API - настроен и готов (ПРИОРИТЕТ)');
  } else {
    console.log('❌ Brevo API - не настроен');
    console.log('   Нужно: BREVO_API_KEY и BREVO_FROM_EMAIL');
  }
  
  // Brevo SMTP (приоритет №2)
  if (process.env.BREVO_USER && process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_KEY !== 'YOUR_BREVO_SMTP_KEY_HERE') {
    console.log('✅ Brevo SMTP - настроен и готов');
  } else {
    console.log('❌ Brevo SMTP - не настроен');
    console.log('   Нужно: BREVO_USER и BREVO_SMTP_KEY');
  }
  
  // Gmail
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'YOUR_GMAIL_APP_PASSWORD_HERE') {
    console.log('✅ Gmail SMTP - настроен и готов');
  } else {
    console.log('❌ Gmail SMTP - не настроен');
    console.log('   Нужно: GMAIL_USER и GMAIL_APP_PASSWORD');
  }
  
  // SendGrid
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    console.log('✅ SendGrid - настроен');
  } else {
    console.log('❌ SendGrid - не настроен');
    console.log('   Нужно: SENDGRID_API_KEY и SENDGRID_FROM_EMAIL');
  }
  
  console.log('');
};

// Симуляция выбора сервиса
const simulateServiceSelection = () => {
  console.log('🎯 Приоритет выбора сервиса:');
  console.log('1. Brevo API (1000 писем/день на free)');
  console.log('2. Brevo SMTP (300 писем/день)');
  console.log('3. Gmail SMTP (500 писем/день)'); 
  console.log('4. SendGrid (100 писем/день на free tier)');
  console.log('');
  
  // Проверяем что будет выбрано
  if (process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL) {
    console.log('🔥 БУДЕТ ВЫБРАН: Brevo API');
  } else if (process.env.BREVO_USER && process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_KEY !== 'YOUR_BREVO_SMTP_KEY_HERE') {
    console.log('🔥 БУДЕТ ВЫБРАН: Brevo SMTP');
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'YOUR_GMAIL_APP_PASSWORD_HERE') {
    console.log('🔥 БУДЕТ ВЫБРАН: Gmail SMTP');
  } else if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    console.log('🔥 БУДЕТ ВЫБРАН: SendGrid');
  } else {
    console.log('❌ НИ ОДИН СЕРВИС НЕ НАСТРОЕН');
  }
  
  console.log('');
};

checkEmailServices();
simulateServiceSelection();

console.log('📧 Для настройки Brevo API:');
console.log('1. Войдите в https://app.brevo.com');
console.log('2. Получите API ключ в Settings → API Keys');
console.log('3. Обновите .env:');
console.log('   BREVO_API_KEY=ваш-api-ключ');
console.log('   BREVO_FROM_EMAIL=ваш-email');
console.log('4. Перезапустите сервер');
console.log('');
console.log('🧪 После настройки запустите:');
console.log('   node test-brevo-api.js');
console.log('');
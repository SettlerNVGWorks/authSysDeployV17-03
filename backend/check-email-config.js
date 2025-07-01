// Демонстрация универсального email сервиса без настоящих ключей
require('dotenv').config({ path: '.env.production' });

console.log('🔍 Проверка конфигурации email сервисов...\n');

// Проверяем какие сервисы доступны
const checkEmailServices = () => {
  console.log('📋 Доступные email сервисы:');
  
  // Brevo
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
  console.log('1. Brevo SMTP (300 писем/день)');
  console.log('2. Gmail SMTP (500 писем/день)'); 
  console.log('3. SendGrid (100 писем/день на free tier)');
  console.log('');
  
  // Проверяем что будет выбрано
  if (process.env.BREVO_USER && process.env.BREVO_SMTP_KEY && process.env.BREVO_SMTP_KEY !== 'YOUR_BREVO_SMTP_KEY_HERE') {
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

console.log('📧 Для настройки Brevo:');
console.log('1. Зарегистрируйтесь: https://www.brevo.com');
console.log('2. Получите SMTP ключ в Settings → SMTP & API');
console.log('3. Обновите .env.production:');
console.log('   BREVO_USER=vpfilter111@gmail.com');
console.log('   BREVO_SMTP_KEY=ваш-реальный-smtp-ключ');
console.log('4. Перезапустите Docker');
console.log('');
console.log('🧪 После настройки запустите:');
console.log('   node test-brevo.js');
console.log('');
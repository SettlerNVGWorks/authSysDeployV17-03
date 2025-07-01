// Тест SendGrid API
require('dotenv').config({ path: '.env.production' });
const sgMail = require('@sendgrid/mail');

console.log('🔍 Тестирование SendGrid...\n');

console.log('📋 Конфигурация:');
console.log(`API Key: ${process.env.SENDGRID_API_KEY ? 'Есть (' + process.env.SENDGRID_API_KEY.substring(0, 15) + '...)' : 'НЕТ'}`);
console.log(`From Email: ${process.env.SENDGRID_FROM_EMAIL || 'НЕТ'}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'НЕТ'}\n`);

if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
  console.error('❌ Отсутствуют обязательные настройки!');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testEmail() {
  try {
    console.log('📧 Отправляем тестовое письмо...');
    
    const result = await sgMail.send({
      to: process.env.SENDGRID_FROM_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: '🧪 Тест SendGrid - Sport Predictions',
      html: `
        <h2>✅ Тест SendGrid работает!</h2>
        <p>Время: ${new Date().toISOString()}</p>
        <p>API Key: ${process.env.SENDGRID_API_KEY.substring(0, 15)}...</p>
        <p>Frontend URL: ${process.env.FRONTEND_URL}</p>
      `
    });
    
    console.log('✅ Успешно отправлено!');
    console.log(`📨 ID: ${result[0].headers['x-message-id']}`);
    console.log(`📊 Статус: ${result[0].statusCode}`);
    
  } catch (error) {
    console.error('❌ Ошибка SendGrid:');
    console.error(`Код: ${error.code || 'неизвестен'}`);
    console.error(`Сообщение: ${error.message}`);
    
    if (error.response && error.response.body) {
      console.error('Детали:', JSON.stringify(error.response.body, null, 2));
    }
    
    // Анализ ошибок
    if (error.code === 401 || error.message.includes('authentication')) {
      console.error('\n🔑 ПРОБЛЕМА: Неверный API ключ SendGrid');
    } else if (error.code === 403 || error.message.includes('sender identity')) {
      console.error('\n🚫 ПРОБЛЕМА: Email не верифицирован в SendGrid');
      console.error('   Решение: Войдите в SendGrid и подтвердите email ' + process.env.SENDGRID_FROM_EMAIL);
    } else if (error.code === 429) {
      console.error('\n⏰ ПРОБЛЕМА: Превышены лимиты SendGrid');
    }
  }
}

testEmail();
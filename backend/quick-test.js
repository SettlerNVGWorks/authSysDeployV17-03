// Быстрый тест SendGrid с таймаутом
require('dotenv').config({ path: '.env.production' });
const sgMail = require('@sendgrid/mail');

console.log('🧪 Быстрый тест SendGrid API...\n');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Тест с таймаутом
const testWithTimeout = () => {
  return Promise.race([
    sgMail.send({
      to: 'test@example.com', // Фиктивный email для быстрого теста
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Тест',
      text: 'Тест'
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут 10 сек')), 10000)
    )
  ]);
};

testWithTimeout()
  .then(() => console.log('✅ SendGrid API отвечает'))
  .catch(error => {
    console.error('❌ Ошибка SendGrid:', error.message);
    
    // Проверяем конкретные ошибки
    if (error.message.includes('Таймаут')) {
      console.error('🌐 Проблема с сетью или медленный ответ SendGrid');
    } else if (error.code === 401) {
      console.error('🔑 Неверный API ключ');
    } else if (error.code === 403) {
      console.error('🚫 Email не верифицирован в SendGrid');
    } else if (error.response) {
      console.error('📊 Код ответа:', error.response.status);
      console.error('📄 Тело ответа:', error.response.body);
    }
    
    // Возможные решения
    console.error('\n💡 Возможные решения:');
    console.error('1. Проверьте что API ключ действителен в SendGrid');
    console.error('2. Убедитесь что email vpfilter111@gmail.com верифицирован');
    console.error('3. Проверьте интернет-соединение на сервере');
    console.error('4. Возможно превышены лимиты SendGrid (бесплатный план)');
  });
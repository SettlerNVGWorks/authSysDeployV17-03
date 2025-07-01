#!/usr/bin/env node

// Тест SendGrid API для диагностики проблем с отправкой email
require('dotenv').config({ path: './backend/.env.production' });
const sgMail = require('@sendgrid/mail');

console.log('🔍 Тестирование SendGrid конфигурации...\n');

// Проверяем переменные окружения
console.log('📋 Конфигурация:');
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'Установлен (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : 'НЕ УСТАНОВЛЕН'}`);
console.log(`SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL || 'НЕ УСТАНОВЛЕН'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'НЕ УСТАНОВЛЕН'}`);
console.log('');

if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ ОШИБКА: SENDGRID_API_KEY не установлен');
  process.exit(1);
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error('❌ ОШИБКА: SENDGRID_FROM_EMAIL не установлен');
  process.exit(1);
}

// Настройка SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testSendGrid() {
  try {
    console.log('🧪 Тестируем отправку тестового email...');
    
    const testEmail = {
      to: process.env.SENDGRID_FROM_EMAIL, // Отправляем на тот же email для теста
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Тест SendGrid'
      },
      subject: '🧪 Тест отправки email - Sport Predictions',
      html: `
        <h2>✅ Тест успешен!</h2>
        <p>Если вы получили это письмо, значит SendGrid работает правильно.</p>
        <p><strong>Время теста:</strong> ${new Date().toISOString()}</p>
        <p><strong>API Key:</strong> ${process.env.SENDGRID_API_KEY.substring(0, 10)}...</p>
        <p><strong>From Email:</strong> ${process.env.SENDGRID_FROM_EMAIL}</p>
        <p><strong>Frontend URL:</strong> ${process.env.FRONTEND_URL}</p>
        <hr>
        <p><small>Это автоматическое тестовое письмо из системы Sport Predictions</small></p>
      `
    };

    console.log(`📧 Отправляем тестовое письмо на: ${testEmail.to}`);
    
    const result = await sgMail.send(testEmail);
    
    console.log('✅ Письмо отправлено успешно!');
    console.log(`📨 Message ID: ${result[0].headers['x-message-id']}`);
    console.log(`🏷️  Status: ${result[0].statusCode}`);
    
    return { success: true, messageId: result[0].headers['x-message-id'] };
    
  } catch (error) {
    console.error('❌ Ошибка отправки email:');
    console.error('📄 Полная ошибка:', error);
    
    if (error.response) {
      console.error('🔍 Детали ошибки:');
      console.error(`   Статус: ${error.response.status}`);
      console.error(`   Сообщение: ${error.response.statusText}`);
      console.error(`   Тело ответа:`, error.response.body);
    }
    
    // Анализ типичных ошибок
    if (error.code === 401) {
      console.error('🔑 ДИАГНОСТИКА: Неверный API ключ');
    } else if (error.code === 403) {
      console.error('🚫 ДИАГНОСТИКА: Email адрес не верифицирован в SendGrid');
    } else if (error.code === 429) {
      console.error('⏰ ДИАГНОСТИКА: Превышены лимиты SendGrid');
    }
    
    return { success: false, error: error.message };
  }
}

// Запуск теста
testSendGrid().then(result => {
  if (result.success) {
    console.log('\n🎉 Тест завершен успешно! SendGrid работает правильно.');
  } else {
    console.log('\n💥 Тест не пройден. Нужно исправить конфигурацию SendGrid.');
  }
}).catch(error => {
  console.error('\n💥 Критическая ошибка при тестировании:', error);
});
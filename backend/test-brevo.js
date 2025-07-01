// Тест Brevo SMTP с тестовыми данными
require('dotenv').config({ path: '.env.production' });
const nodemailer = require('nodemailer');

console.log('🧪 Тест Brevo SMTP конфигурации...\n');

// Показываем текущие настройки
console.log('📋 Текущие настройки:');
console.log(`BREVO_USER: ${process.env.BREVO_USER || 'НЕ УСТАНОВЛЕН'}`);
console.log(`BREVO_SMTP_KEY: ${process.env.BREVO_SMTP_KEY ? 'Установлен (' + process.env.BREVO_SMTP_KEY.substring(0, 15) + '...)' : 'НЕ УСТАНОВЛЕН'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'НЕ УСТАНОВЛЕН'}\n`);

// Проверяем наличие настроек
if (!process.env.BREVO_USER || !process.env.BREVO_SMTP_KEY) {
  console.error('❌ НАСТРОЙКИ НЕ НАЙДЕНЫ!');
  console.error('');
  console.error('Для настройки Brevo:');
  console.error('1. Зарегистрируйтесь на https://www.brevo.com');
  console.error('2. Получите SMTP ключ в Settings → SMTP & API');
  console.error('3. Обновите .env.production:');
  console.error('   BREVO_USER=vpfilter111@gmail.com');
  console.error('   BREVO_SMTP_KEY=ваш-smtp-ключ');
  process.exit(1);
}

// Создаем Brevo транспортер
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_SMTP_KEY
  },
  debug: true // Включаем отладку
});

async function testBrevo() {
  try {
    console.log('🔄 Проверяем соединение с Brevo SMTP...');
    
    // Проверяем соединение
    await transporter.verify();
    console.log('✅ Соединение с Brevo SMTP установлено!');
    
    // Отправляем тестовое письмо
    console.log('\n📧 Отправляем тестовое письмо...');
    
    const verificationLink = `${process.env.FRONTEND_URL || 'http://185.174.136.113'}/verify-email?token=test-token-12345`;
    
    const result = await transporter.sendMail({
      from: {
        name: 'Прогнозы на спорт №1',
        address: process.env.BREVO_USER
      },
      to: process.env.BREVO_USER, // Отправляем на себя для теста
      subject: '🧪 Тест Brevo SMTP - Прогнозы на спорт №1',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { 
                    background: linear-gradient(135deg, #16a34a, #15803d); 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0;
                }
                .content { 
                    padding: 30px; 
                    background: #ffffff;
                    border: 1px solid #16a34a;
                    border-top: none;
                }
                .button { 
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block; 
                    margin: 20px 0;
                    font-weight: bold;
                }
                .footer { 
                    background-color: #1f2937; 
                    color: #9ca3af;
                    padding: 20px; 
                    text-align: center; 
                    font-size: 12px;
                    border-radius: 0 0 8px 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ BREVO SMTP РАБОТАЕТ!</h1>
                    <h2>Тестовое письмо</h2>
                </div>
                <div class="content">
                    <h2>🎉 Отлично! Brevo настроен правильно!</h2>
                    <p>Это тестовое письмо подтверждает, что ваша система email работает.</p>
                    <p>Теперь регистрация пользователей будет работать корректно.</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationLink}" class="button">🔗 Тестовая ссылка подтверждения</a>
                    </div>
                    
                    <hr>
                    <p><strong>Технические детали:</strong></p>
                    <ul>
                        <li>Сервис: Brevo SMTP</li>
                        <li>SMTP сервер: smtp-relay.brevo.com:587</li>
                        <li>From Email: ${process.env.BREVO_USER}</li>
                        <li>Frontend URL: ${process.env.FRONTEND_URL}</li>
                        <li>Время теста: ${new Date().toISOString()}</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>🧪 Это автоматическое тестовое письмо из системы Sport Predictions</p>
                    <p>🚀 Powered by Brevo SMTP</p>
                </div>
            </div>
        </body>
        </html>
      `
    });
    
    console.log('✅ Письмо отправлено успешно через Brevo!');
    console.log(`📨 Message ID: ${result.messageId}`);
    console.log(`📊 Response: ${result.response}`);
    console.log(`🌐 Ссылка подтверждения: ${verificationLink}`);
    
    console.log('\n🎉 ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
    console.log('🔥 Brevo SMTP работает идеально!');
    console.log('📧 Проверьте email ' + process.env.BREVO_USER + ' - должно прийти тестовое письмо');
    
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('\n❌ ОШИБКА BREVO SMTP:');
    console.error(`Код: ${error.code || 'неизвестен'}`);
    console.error(`Сообщение: ${error.message}`);
    
    if (error.response) {
      console.error(`HTTP статус: ${error.response}`);
    }
    
    // Анализ типичных ошибок
    console.error('\n🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
    if (error.message.includes('Invalid login')) {
      console.error('🔑 Неверный BREVO_USER или BREVO_SMTP_KEY');
      console.error('   Проверьте настройки в Brevo панели управления');
    } else if (error.message.includes('authentication')) {
      console.error('🚫 Проблема аутентификации с Brevo');
      console.error('   Убедитесь что SMTP ключ активен');
    } else if (error.message.includes('connection')) {
      console.error('🌐 Проблема с сетевым соединением');
      console.error('   Проверьте интернет и firewall настройки');
    }
    
    console.error('\n💡 ЧТО ДЕЛАТЬ:');
    console.error('1. Проверьте что зарегистрированы на https://www.brevo.com');
    console.error('2. Получите новый SMTP ключ в Settings → SMTP & API');
    console.error('3. Обновите .env.production с правильными данными');
    
    return { success: false, error: error.message };
  }
}

testBrevo();
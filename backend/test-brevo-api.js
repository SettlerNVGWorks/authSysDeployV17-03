// Тест Brevo API с вашим ключом
require('dotenv').config();
const axios = require('axios');

console.log('🧪 Тест Brevo API конфигурации...\n');

// Показываем текущие настройки
console.log('📋 Текущие настройки:');
console.log(`BREVO_API_KEY: ${process.env.BREVO_API_KEY ? 'Установлен (' + process.env.BREVO_API_KEY.substring(0, 20) + '...)' : 'НЕ УСТАНОВЛЕН'}`);
console.log(`BREVO_FROM_EMAIL: ${process.env.BREVO_FROM_EMAIL || 'НЕ УСТАНОВЛЕН'}`);
console.log(`BREVO_FROM_NAME: ${process.env.BREVO_FROM_NAME || 'НЕ УСТАНОВЛЕН'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'НЕ УСТАНОВЛЕН'}\n`);

// Проверяем наличие настроек
if (!process.env.BREVO_API_KEY || !process.env.BREVO_FROM_EMAIL) {
  console.error('❌ НАСТРОЙКИ НЕ НАЙДЕНЫ!');
  console.error('');
  console.error('Для настройки Brevo API:');
  console.error('1. Получите API ключ в https://app.brevo.com');
  console.error('2. Обновите .env:');
  console.error('   BREVO_API_KEY=ваш-api-ключ');
  console.error('   BREVO_FROM_EMAIL=ваш-email');
  process.exit(1);
}

async function testBrevoAPI() {
  try {
    console.log('🔄 Проверяем Brevo API...');
    
    // Проверяем аккаунт
    console.log('\n📊 Проверяем информацию об аккаунте...');
    const accountResponse = await axios.get('https://api.sendinblue.com/v3/account', {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      }
    });
    
    console.log('✅ Аккаунт найден!');
    console.log(`📧 Email: ${accountResponse.data.email}`);
    console.log(`👤 Имя: ${accountResponse.data.firstName} ${accountResponse.data.lastName}`);
    console.log(`📊 План: ${accountResponse.data.plan[0]?.type || 'free'}`);
    
    // Отправляем тестовое письмо
    console.log('\n📧 Отправляем тестовое письмо...');
    
    const verificationLink = `${process.env.FRONTEND_URL || 'http://185.174.136.113'}/verify-email?token=test-token-12345`;
    
    const emailData = {
      sender: {
        name: process.env.BREVO_FROM_NAME || 'Прогнозы на спорт №1',
        email: process.env.BREVO_FROM_EMAIL
      },
      to: [
        {
          email: process.env.BREVO_FROM_EMAIL, // Отправляем на себя для теста
          name: 'Тестовый пользователь'
        }
      ],
      subject: '🧪 Тест Brevo API - Прогнозы на спорт №1',
      htmlContent: `
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
                    <h1>✅ BREVO API РАБОТАЕТ!</h1>
                    <h2>Тестовое письмо</h2>
                </div>
                <div class="content">
                    <h2>🎉 Отлично! Brevo API настроен правильно!</h2>
                    <p>Это тестовое письмо подтверждает, что ваша система email работает.</p>
                    <p>Теперь регистрация пользователей будет работать корректно.</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationLink}" class="button">🔗 Тестовая ссылка подтверждения</a>
                    </div>
                    
                    <hr>
                    <p><strong>Технические детали:</strong></p>
                    <ul>
                        <li>Сервис: Brevo API</li>
                        <li>API ключ: ${process.env.BREVO_API_KEY.substring(0, 20)}...</li>
                        <li>From Email: ${process.env.BREVO_FROM_EMAIL}</li>
                        <li>Frontend URL: ${process.env.FRONTEND_URL}</li>
                        <li>Время теста: ${new Date().toISOString()}</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>🧪 Это автоматическое тестовое письмо из системы Sport Predictions</p>
                    <p>🚀 Powered by Brevo API</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
    
    const emailResponse = await axios.post('https://api.sendinblue.com/v3/smtp/email', emailData, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });
    
    console.log('✅ Письмо отправлено успешно через Brevo API!');
    console.log(`📨 Message ID: ${emailResponse.data.messageId}`);
    console.log(`🌐 Ссылка подтверждения: ${verificationLink}`);
    
    console.log('\n🎉 ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
    console.log('🔥 Brevo API работает идеально!');
    console.log('📧 Проверьте email ' + process.env.BREVO_FROM_EMAIL + ' - должно прийти тестовое письмо');
    
    return { success: true, messageId: emailResponse.data.messageId };
    
  } catch (error) {
    console.error('\n❌ ОШИБКА BREVO API:');
    console.error(`Статус: ${error.response?.status || 'неизвестен'}`);
    console.error(`Сообщение: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.error('Детали:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Анализ типичных ошибок
    console.error('\n🔍 ВОЗМОЖНЫЕ ПРИЧИНЫ:');
    if (error.response?.status === 401) {
      console.error('🔑 Неверный API ключ');
      console.error('   Проверьте API ключ в Brevo панели управления');
    } else if (error.response?.status === 403) {
      console.error('🚫 Доступ запрещен');
      console.error('   Убедитесь что API ключ активен и имеет нужные права');
    } else if (error.response?.status === 400) {
      console.error('📝 Ошибка в данных письма');
      console.error('   Проверьте email адреса и содержимое');
    }
    
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

testBrevoAPI();
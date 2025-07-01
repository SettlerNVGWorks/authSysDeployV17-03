// Полный тест отправки email с новым API ключом
require('dotenv').config({ path: '.env.production' });
const sgMail = require('@sendgrid/mail');

console.log('🧪 Тест полной отправки email...\n');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testFullEmail() {
  try {
    const verificationToken = 'test-token-12345';
    const frontendUrl = process.env.FRONTEND_URL || 'http://185.174.136.113';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const emailData = {
      to: process.env.SENDGRID_FROM_EMAIL, // Отправляем на себя для теста
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Прогнозы на спорт №1'
      },
      subject: '✅ Тест подтверждения email - Прогнозы на спорт №1',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { 
                    background: linear-gradient(135deg, #fbbf24, #d97706); 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0;
                }
                .content { 
                    padding: 30px; 
                    background: #ffffff;
                    border: 1px solid #fbbf24;
                    border-top: none;
                }
                .button { 
                    background: linear-gradient(135deg, #fbbf24, #d97706);
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
                    <h1>👑 ПРОГНОЗЫ НА СПОРТ №1</h1>
                    <h2>🧪 ТЕСТ подтверждения Email</h2>
                </div>
                <div class="content">
                    <h2>Тестовое письмо работает!</h2>
                    <p>Это тестовое письмо для проверки системы регистрации.</p>
                    <p>Ссылка подтверждения (тестовая):</p>
                    <div style="text-align: center;">
                        <a href="${verificationLink}" class="button">✅ Подтвердить Email (ТЕСТ)</a>
                    </div>
                    <p>Полная ссылка:</p>
                    <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationLink}</p>
                    <hr>
                    <p><strong>Настройки:</strong></p>
                    <ul>
                        <li>API Key: ${process.env.SENDGRID_API_KEY.substring(0, 15)}...</li>
                        <li>From Email: ${process.env.SENDGRID_FROM_EMAIL}</li>
                        <li>Frontend URL: ${process.env.FRONTEND_URL}</li>
                        <li>Время теста: ${new Date().toISOString()}</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>🧪 Это тестовое письмо для проверки настроек SendGrid</p>
                    <p>© 2025 Прогнозы на спорт №1. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
    
    console.log(`📧 Отправляем тестовое письмо на: ${emailData.to}`);
    console.log(`🔗 Ссылка подтверждения: ${verificationLink}\n`);
    
    const result = await sgMail.send(emailData);
    
    console.log('✅ Письмо отправлено успешно!');
    console.log(`📨 Message ID: ${result[0].headers['x-message-id']}`);
    console.log(`📊 Status Code: ${result[0].statusCode}`);
    console.log(`🌐 Frontend URL в письме: ${frontendUrl}`);
    
    return { success: true, messageId: result[0].headers['x-message-id'] };
    
  } catch (error) {
    console.error('❌ Ошибка отправки email:');
    console.error(`Код: ${error.code || 'неизвестен'}`);
    console.error(`Сообщение: ${error.message}`);
    
    if (error.response && error.response.body) {
      console.error('Детали:', JSON.stringify(error.response.body, null, 2));
    }
    
    return { success: false, error: error.message };
  }
}

testFullEmail();
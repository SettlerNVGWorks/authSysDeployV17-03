const axios = require('axios');
require('dotenv').config();

// Brevo API email service
console.log('📧 Настройка Brevo API сервиса...');

// Функция отправки verification email через Brevo API
const sendVerificationEmailBrevoAPI = async (email, verificationToken, userName = '') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://185.174.136.113';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const emailData = {
      sender: {
        name: process.env.BREVO_FROM_NAME || 'Прогнозы на спорт №1',
        email: process.env.BREVO_FROM_EMAIL || '910181001@smtp-brevo.com'
      },
      to: [
        {
          email: email,
          name: userName || 'Пользователь'
        }
      ],
      subject: '✅ Подтвердите ваш email - Прогнозы на спорт №1',
      htmlContent: `
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
                    <h2>Подтверждение Email</h2>
                </div>
                <div class="content">
                    <h2>Добро пожаловать${userName ? ', ' + userName : ''}!</h2>
                    <p>Спасибо за регистрацию на нашем сайте спортивных прогнозов!</p>
                    <p>Чтобы завершить регистрацию, пожалуйста, подтвердите ваш email адрес:</p>
                    <div style="text-align: center;">
                        <a href="${verificationLink}" class="button">✅ Подтвердить Email</a>
                    </div>
                    <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
                    <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationLink}</p>
                    <p style="color: #dc2626; font-size: 14px;"><strong>⏰ Эта ссылка действительна в течение 24 часов.</strong></p>
                </div>
                <div class="footer">
                    <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
                    <p>© 2025 Прогнозы на спорт №1. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
    
    console.log(`📧 Отправляем verification email через Brevo API на: ${email}`);
    
    const response = await axios.post('https://api.sendinblue.com/v3/smtp/email', emailData, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });
    
    console.log('✅ Brevo API email отправлен успешно!');
    console.log(`📨 Message ID: ${response.data.messageId}`);
    
    return {
      success: true,
      messageId: response.data.messageId
    };
    
  } catch (error) {
    console.error('❌ Ошибка Brevo API:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Функция отправки password reset email через Brevo API
const sendPasswordResetEmailBrevoAPI = async (email, resetToken, userName = '') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://185.174.136.113';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const emailData = {
      sender: {
        name: process.env.BREVO_FROM_NAME || 'Прогнозы на спорт №1',
        email: process.env.BREVO_FROM_EMAIL || '910181001@smtp-brevo.com'
      },
      to: [
        {
          email: email,
          name: userName || 'Пользователь'
        }
      ],
      subject: '🔐 Сброс пароля - Прогнозы на спорт №1',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
                .header { 
                    background: linear-gradient(135deg, #dc2626, #991b1b); 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0;
                }
                .content { 
                    padding: 30px; 
                    background: #ffffff;
                    border: 1px solid #dc2626;
                    border-top: none;
                }
                .button { 
                    background: linear-gradient(135deg, #dc2626, #991b1b);
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
                    <h1>🔐 Сброс пароля</h1>
                </div>
                <div class="content">
                    <h2>Здравствуйте${userName ? ', ' + userName : ''}!</h2>
                    <p>Мы получили запрос на сброс пароля для вашего аккаунта.</p>
                    <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
                    <div style="text-align: center;">
                        <a href="${resetLink}" class="button">🔑 Сбросить пароль</a>
                    </div>
                    <p style="color: #dc2626; font-size: 14px;"><strong>⏰ Эта ссылка действительна в течение 1 часа.</strong></p>
                    <p style="color: #6b7280; font-size: 14px;">
                        Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
                    </p>
                </div>
                <div class="footer">
                    <p>© 2025 Прогнозы на спорт №1. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };
    
    console.log(`📧 Отправляем password reset email через Brevo API на: ${email}`);
    
    const response = await axios.post('https://api.sendinblue.com/v3/smtp/email', emailData, {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    });
    
    console.log('✅ Brevo API password reset email отправлен успешно!');
    console.log(`📨 Message ID: ${response.data.messageId}`);
    
    return {
      success: true,
      messageId: response.data.messageId
    };
    
  } catch (error) {
    console.error('❌ Ошибка Brevo API при сбросе пароля:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

module.exports = {
  sendVerificationEmail: sendVerificationEmailBrevoAPI,
  sendPasswordResetEmail: sendPasswordResetEmailBrevoAPI
};
const nodemailer = require('nodemailer');
require('dotenv').config();

// Brevo (ex-Sendinblue) SMTP email service
console.log('📧 Настройка Brevo SMTP сервиса...');

// Создание Brevo транспортера
const createBrevoTransporter = () => {
  const transporter = nodemailer.createTransporter({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_USER, // Ваш email в Brevo
      pass: process.env.BREVO_SMTP_KEY // SMTP ключ из Brevo
    }
  });

  // Проверка соединения
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Brevo SMTP ошибка конфигурации:', error);
    } else {
      console.log('✅ Brevo SMTP готов к отправке писем');
    }
  });

  return transporter;
};

// Функция отправки verification email через Brevo
const sendVerificationEmailBrevo = async (email, verificationToken, userName = '') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://185.174.136.113';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const transporter = createBrevoTransporter();
    
    const mailOptions = {
      from: {
        name: 'Прогнозы на спорт №1',
        address: process.env.BREVO_USER
      },
      to: email,
      subject: '✅ Подтвердите ваш email - Прогнозы на спорт №1',
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
    
    console.log(`📧 Отправляем verification email через Brevo на: ${email}`);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Brevo email отправлен успешно!');
    console.log(`📨 Message ID: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('❌ Ошибка Brevo SMTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Функция отправки password reset email через Brevo
const sendPasswordResetEmailBrevo = async (email, resetToken, userName = '') => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://185.174.136.113';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const transporter = createBrevoTransporter();
    
    const mailOptions = {
      from: {
        name: 'Прогнозы на спорт №1',
        address: process.env.BREVO_USER
      },
      to: email,
      subject: '🔐 Сброс пароля - Прогнозы на спорт №1',
      html: `
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
    
    console.log(`📧 Отправляем password reset email через Brevo на: ${email}`);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Brevo password reset email отправлен успешно!');
    console.log(`📨 Message ID: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('❌ Ошибка Brevo SMTP при сбросе пароля:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendVerificationEmail: sendVerificationEmailBrevo,
  sendPasswordResetEmail: sendPasswordResetEmailBrevo,
  createBrevoTransporter
};
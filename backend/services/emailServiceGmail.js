const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.production' });

// Альтернативный email сервис через Gmail SMTP
const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'vpfilter111@gmail.com',
      pass: 'your-app-password-here' // Нужен App Password от Google
    }
  });
};

// Функция отправки email через Gmail
const sendEmailViaGmail = async (to, subject, html) => {
  try {
    const transporter = createGmailTransporter();
    
    const mailOptions = {
      from: '"Прогнозы на спорт №1" <vpfilter111@gmail.com>',
      to: to,
      subject: subject,
      html: html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email отправлен через Gmail:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Ошибка Gmail SMTP:', error);
    return { success: false, error: error.message };
  }
};

// Функция для создания email верификации
const createVerificationEmail = (email, token, userName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://185.174.136.113';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
  
  return `
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
  `;
};

module.exports = {
  sendEmailViaGmail,
  createVerificationEmail
};
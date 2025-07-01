// Универсальный email сервис с поддержкой нескольких провайдеров
require('dotenv').config();

// Импорт различных email сервисов
const brevoAPIService = require('./emailServiceBrevoAPI');
const brevoSMTPService = require('./emailServiceBrevo');
const sendGridService = require('./emailServiceSendGrid');
const gmailService = require('./emailServiceGmailSMTP');

// Определяем какой сервис использовать на основе переменных окружения
const getEmailService = () => {
  // Приоритет: Brevo API > Brevo SMTP > Gmail SMTP > SendGrid
  if (process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL) {
    console.log('📧 Используем Brevo API для отправки email');
    return brevoAPIService;
  } else if (process.env.BREVO_USER && process.env.BREVO_SMTP_KEY) {
    console.log('📧 Используем Brevo SMTP для отправки email');
    return brevoSMTPService;
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('📧 Используем Gmail SMTP для отправки email');
    return gmailService;
  } else if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    console.log('📧 Используем SendGrid для отправки email');
    return sendGridService;
  } else {
    console.error('❌ Не настроен ни один email сервис!');
    console.error('Настройте Brevo API, Brevo SMTP, Gmail SMTP или SendGrid в .env файле');
    throw new Error('Email service not configured');
  }
};

// Универсальные функции отправки
const sendVerificationEmail = async (email, verificationToken, userName = '') => {
  try {
    const emailService = getEmailService();
    return await emailService.sendVerificationEmail(email, verificationToken, userName);
  } catch (error) {
    console.error('❌ Ошибка выбора email сервиса:', error);
    return {
      success: false,
      error: 'Email service not available: ' + error.message
    };
  }
};

const sendPasswordResetEmail = async (email, resetToken, userName = '') => {
  try {
    const emailService = getEmailService();
    return await emailService.sendPasswordResetEmail(email, resetToken, userName);
  } catch (error) {
    console.error('❌ Ошибка выбора email сервиса:', error);
    return {
      success: false,
      error: 'Email service not available: ' + error.message
    };
  }
};

// Функция для тестирования email сервиса
const testEmailService = async () => {
  try {
    const emailService = getEmailService();
    console.log('🧪 Тестируем выбранный email сервис...');
    
    // Отправляем тестовое письмо на Brevo email
    const testEmail = process.env.BREVO_FROM_EMAIL || process.env.BREVO_USER || process.env.GMAIL_USER || process.env.SENDGRID_FROM_EMAIL;
    
    if (!testEmail) {
      throw new Error('Не найден email для тестирования');
    }
    
    const result = await emailService.sendVerificationEmail(
      testEmail, 
      'test-token-12345', 
      'Тестовый пользователь'
    );
    
    if (result.success) {
      console.log('✅ Email сервис работает корректно!');
      console.log(`📨 Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Email сервис не работает:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Ошибка тестирования email сервиса:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailService
};
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Create email
const msg = {
  to: 'test@example.com',
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Test Email from SendGrid',
  text: 'This is a test email from SendGrid',
  html: '<strong>This is a test email from SendGrid</strong>',
};

// Send email
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully');
    console.log('API Key:', process.env.SENDGRID_API_KEY);
    console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);
  })
  .catch((error) => {
    console.error('Error sending email:');
    console.error(error);
    
    if (error.response) {
      console.error('Error response body:');
      console.error(error.response.body);
    }
  });
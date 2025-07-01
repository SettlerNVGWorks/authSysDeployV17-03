const sgMail = require('@sendgrid/mail');
const { Client } = require('@sendgrid/client');
require('dotenv').config();

// Configure SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(apiKey);
const client = new Client();
client.setApiKey(apiKey);

// Check sender authentication
const checkSenderAuthentication = async () => {
  try {
    console.log('Checking sender authentication...');
    
    // Check verified senders
    const request = {
      method: 'GET',
      url: '/v3/verified_senders'
    };
    
    const [response, body] = await client.request(request);
    console.log('Verified Senders:', JSON.stringify(body, null, 2));
    
    // Check if our sender email is in the list
    const senderEmail = process.env.SENDGRID_FROM_EMAIL;
    console.log(`Checking if ${senderEmail} is verified...`);
    
    const verifiedEmails = body.results || [];
    const isVerified = verifiedEmails.some(sender => 
      sender.from_email === senderEmail || 
      (sender.domain && senderEmail.endsWith('@' + sender.domain))
    );
    
    if (isVerified) {
      console.log(`✅ ${senderEmail} is verified!`);
    } else {
      console.log(`❌ ${senderEmail} is NOT verified!`);
      console.log('You need to verify this email in your SendGrid account before you can send emails from it.');
    }
    
    return isVerified;
  } catch (error) {
    console.error('Error checking sender authentication:');
    console.error('Status Code:', error.code);
    
    if (error.response) {
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Body:', JSON.stringify(error.response.body, null, 2));
    } else {
      console.error('Full Error:', error);
    }
    return false;
  }
};

// Run the check
checkSenderAuthentication();
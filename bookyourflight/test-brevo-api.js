const brevo = require('@getbrevo/brevo');

// Configure API instance
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key - using the correct method
apiInstance.setApiKey(brevo.TransactionalEmailsApi.ApiKeyAuth, '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');

// Create email
const sendSmtpEmail = new brevo.SendSmtpEmail();
sendSmtpEmail.subject = 'Test Email from Brevo API';
sendSmtpEmail.htmlContent = `
  <html>
    <body>
      <h1>Test Email</h1>
      <p>This is a test email from Brevo API</p>
      <p>If you receive this, the API connection works!</p>
    </body>
  </html>
`;
sendSmtpEmail.sender = {
  name: 'BookYourFlight',
  email: 'eventflow.ynov@hotmail.com'
};
sendSmtpEmail.to = [
  {
    email: 'eventflow.ynov@hotmail.com',
    name: 'Test User'
  }
];

// Send email
apiInstance.sendTransacEmail(sendSmtpEmail).then(
  function(data) {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', data.messageId);
    process.exit(0);
  },
  function(error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', error.message || error);
    process.exit(1);
  }
);

import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from '@getbrevo/brevo';
import { prisma } from '@/lib/prisma';

// Créer l'instance API et configurer l'authentification
const apiInstance = new TransactionalEmailsApi();
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  type: 'RESERVATION_CONFIRMATION' | 'RESERVATION_CANCELLED' | 'PAYMENT_REMINDER';
  metadata?: Record<string, any>;
}

export async function sendEmail(options: EmailOptions) {
  console.log('===============================================');
  console.log('📧 [BREVO] sendEmail() CALLED');
  console.log('📧 [BREVO] To:', options.to);
  console.log('📧 [BREVO] Type:', options.type);
  console.log('📧 [BREVO] Subject:', options.subject);
  console.log('===============================================');

  try {
    console.log(`📧 Attempting to send email to ${options.to} (type: ${options.type})`);

    if (!process.env.BREVO_API_KEY) {
      console.warn('⚠️ BREVO_API_KEY not configured. Email not sent.');
      await logEmail(options, 'FAILED', 'BREVO_API_KEY not configured');
      return { success: false, message: 'Email service not configured' };
    }

    console.log('🔑 BREVO_API_KEY exists, creating SendSmtpEmail...');

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.htmlContent;
    sendSmtpEmail.sender = {
      name: 'BookYourFlight',
      email: process.env.BREVO_SENDER_EMAIL || 'eventflow.ynov@hotmail.com',
    };
    sendSmtpEmail.to = [{ email: options.to }];

    console.log('📤 Sending email via Brevo API...');
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    // Le SDK retourne { response, body } - le messageId est dans body
    const messageId = result.body?.messageId;
    console.log('✅ Brevo API response:', messageId);

    // Log succès
    await logEmail(
      options,
      'SENT',
      undefined,
      messageId
    );

    console.log(`✅ Email sent successfully to ${options.to}:`, messageId);
    return { success: true, messageId };
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    console.error(`❌ Failed to send email to ${options.to}:`, errorMessage);
    console.error('❌ Full error:', error);

    // Log erreur
    await logEmail(options, 'FAILED', errorMessage);

    return { success: false, error: errorMessage };
  }
}

async function logEmail(
  options: EmailOptions,
  status: 'PENDING' | 'SENT' | 'FAILED',
  error?: string,
  brevoMessageId?: string
) {
  try {
    await prisma.emailLog.create({
      data: {
        recipientEmail: options.to,
        emailType: options.type,
        subject: options.subject,
        status,
        brevoMessageId,
        error,
        sentAt: status === 'SENT' ? new Date() : undefined,
        metadata: options.metadata || {},
      },
    });
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

export const emailTemplates = {
  reservationConfirmation: (data: {
    passengerName: string;
    flightName: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    passengerCount: number;
    totalPrice: number;
    reservationId: string;
  }) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Confirmation de réservation - BookYourFlight</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          background-color: #000000;
          padding: 0;
          margin: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #000000;
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          padding: 40px 30px 30px;
          text-align: center;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 200px;
          height: auto;
        }
        .header-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 10px 0;
          letter-spacing: -0.5px;
        }
        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 0;
        }
        .content {
          background-color: #18181b;
          padding: 40px 30px;
        }
        .greeting {
          color: #ffffff;
          font-size: 18px;
          margin-bottom: 25px;
        }
        .greeting strong {
          color: #f97316;
        }
        .status-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 30px;
        }
        .flight-info {
          background-color: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
        }
        .route {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .route-city {
          color: #f97316;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .route-arrow {
          color: #71717a;
          font-size: 24px;
        }
        .flight-name {
          color: #a1a1aa;
          text-align: center;
          font-size: 16px;
          margin-bottom: 25px;
        }
        .details {
          border-top: 1px solid #3f3f46;
          padding-top: 20px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #3f3f46;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #71717a;
          font-size: 14px;
        }
        .detail-value {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          text-align: right;
        }
        .price-box {
          background: linear-gradient(135deg, #27272a 0%, #18181b 100%);
          border: 2px solid #f97316;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin: 30px 0;
        }
        .price-label {
          color: #71717a;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .price-amount {
          color: #f97316;
          font-size: 48px;
          font-weight: 800;
          line-height: 1;
        }
        .reservation-box {
          background-color: #09090b;
          border: 2px dashed #52525b;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .reservation-label {
          color: #71717a;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        .reservation-id {
          font-family: 'Courier New', Courier, monospace;
          color: #f97316;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .info-box {
          background-color: #27272a;
          border-left: 4px solid #f97316;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
        }
        .info-box p {
          color: #a1a1aa;
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }
        .info-box strong {
          color: #ffffff;
        }
        .footer {
          background-color: #09090b;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #27272a;
        }
        .footer-logo {
          color: #f97316;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 15px;
        }
        .footer-text {
          color: #71717a;
          font-size: 13px;
          line-height: 1.6;
          margin: 10px 0;
        }
        .footer-links {
          margin: 20px 0;
        }
        .footer-link {
          color: #f97316;
          text-decoration: none;
          font-size: 13px;
          margin: 0 12px;
        }
        .footer-divider {
          color: #3f3f46;
          margin: 0 5px;
        }
        @media only screen and (max-width: 600px) {
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .route-city { font-size: 28px; }
          .price-amount { font-size: 40px; }
          .flight-info { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="header-title">Vol Réservé !</h1>
          <p class="header-subtitle">Votre aventure commence</p>
        </div>

        <div class="content">
          <p class="greeting">Bonjour <strong>${data.passengerName}</strong>,</p>

          <div class="status-badge">✓ Paiement confirmé</div>

          <div class="flight-info">
            <div class="route">
              <span class="route-city">${data.origin}</span>
              <span class="route-arrow">→</span>
              <span class="route-city">${data.destination}</span>
            </div>
            <div class="flight-name">${data.flightName}</div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">✈️ Vol</span>
                <span class="detail-value">${data.flightNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Départ</span>
                <span class="detail-value">${new Date(data.departureTime).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">👥 Passagers</span>
                <span class="detail-value">${data.passengerCount}</span>
              </div>
            </div>
          </div>

          <div class="price-box">
            <div class="price-label">Total payé</div>
            <div class="price-amount">€${(data.totalPrice / 100).toFixed(2)}</div>
          </div>

          <div class="reservation-box">
            <div class="reservation-label">Numéro de réservation</div>
            <div class="reservation-id">${data.reservationId.slice(0, 8).toUpperCase()}</div>
          </div>

          <div class="info-box">
            <p>
              <strong>Informations importantes</strong><br><br>
              • Arrivez 2h avant le départ<br>
              • Pièce d'identité obligatoire<br>
              • Conservez ce numéro de réservation
            </p>
          </div>
        </div>

        <div class="footer">
          <div class="footer-logo">BOOKYOURFLIGHT</div>
          <p class="footer-text">
            Bon voyage !<br>
            Questions ? Contactez notre support.
          </p>
          <div class="footer-links">
            <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/reservations" class="footer-link">Mes réservations</a>
            <span class="footer-divider">•</span>
            <a href="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/resources" class="footer-link">Autres vols</a>
          </div>
          <p class="footer-text" style="margin-top: 20px; font-size: 11px;">
            Email automatique - Ne pas répondre
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  reservationCancelled: (data: {
    passengerName: string;
    flightName: string;
    reservationId: string;
    refundAmount?: number;
  }) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Annulation - BookYourFlight</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #18181b;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #000000;
        }
        .header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 40px 30px 30px;
          text-align: center;
        }
        .logo img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header-title {
          color: #ffffff;
          font-size: 32px;
          font-weight: 700;
          margin: 0;
        }
        .content {
          background-color: #18181b;
          padding: 40px 30px;
        }
        .greeting {
          color: #ffffff;
          font-size: 18px;
          margin-bottom: 25px;
        }
        .greeting strong {
          color: #ef4444;
        }
        .info-card {
          background-color: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          padding: 25px;
          margin: 25px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #3f3f46;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #71717a;
          font-size: 14px;
        }
        .info-value {
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
        }
        .refund-box {
          background-color: #27272a;
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .refund-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .refund-label {
          color: #a1a1aa;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .refund-amount {
          color: #10b981;
          font-size: 42px;
          font-weight: 800;
        }
        .refund-note {
          color: #71717a;
          font-size: 13px;
          margin-top: 15px;
        }
        .footer {
          background-color: #09090b;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #27272a;
        }
        .footer-text {
          color: #71717a;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="header-title">Réservation Annulée</h1>
        </div>

        <div class="content">
          <p class="greeting">Bonjour <strong>${data.passengerName}</strong>,</p>

          <div class="info-card">
            <div class="info-row">
              <span class="info-label">✈️ Vol</span>
              <span class="info-value">${data.flightName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📋 Réservation</span>
              <span class="info-value">${data.reservationId.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          ${data.refundAmount ? `
            <div class="refund-box">
              <div class="refund-icon">💳</div>
              <div class="refund-label">Remboursement</div>
              <div class="refund-amount">€${(data.refundAmount / 100).toFixed(2)}</div>
              <div class="refund-note">Crédité dans 5-7 jours ouvrables</div>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p class="footer-text">BOOKYOURFLIGHT • Support disponible 7j/7</p>
        </div>
      </div>
    </body>
    </html>
  `,

  paymentReminder: (data: {
    passengerName: string;
    flightName: string;
    reservationId: string;
    expiresAt: string;
  }) => `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Rappel Paiement - BookYourFlight</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #18181b;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #000000;
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .content {
          background-color: #18181b;
          padding: 40px 30px;
          color: #ffffff;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 style="color: white; font-size: 28px;">⏰ Paiement en attente</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong style="color: #f97316;">${data.passengerName}</strong>,</p>
          <p style="margin: 20px 0;">Vol: ${data.flightName}</p>
          <p style="margin: 20px 0;">Expire le: ${new Date(data.expiresAt).toLocaleString('fr-FR')}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_API_URL}/reservations/${data.reservationId}" class="cta-button">
              Finaliser le paiement →
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};

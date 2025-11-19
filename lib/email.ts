import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip sending if SMTP is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('SMTP not configured, skipping email:', options);
      return false;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  amount: string,
  debtSubject: string,
  paymentId: string
): Promise<boolean> {
  const subject = 'Confirmation de paiement - Aistos';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Paiement confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${name},</p>
            <p>Nous vous confirmons la réception de votre paiement.</p>
            <div class="details">
              <p><strong>Sujet de la dette:</strong> ${debtSubject}</p>
              <p><strong>Montant payé:</strong> ${amount} €</p>
              <p><strong>ID de paiement:</strong> ${paymentId}</p>
            </div>
            <p>Merci pour votre paiement.</p>
            <p>Cordialement,<br>L'équipe Aistos</p>
          </div>
          <div class="footer">
            <p>Cet email est un accusé de réception automatique. Merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send debt creation notification email
 */
export async function sendDebtCreationEmail(
  email: string,
  name: string,
  amount: string,
  debtSubject: string
): Promise<boolean> {
  const subject = 'Nouvelle dette enregistrée - Aistos';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nouvelle dette enregistrée</h1>
          </div>
          <div class="content">
            <p>Bonjour ${name},</p>
            <p>Une nouvelle dette a été enregistrée à votre nom.</p>
            <div class="details">
              <p><strong>Sujet:</strong> ${debtSubject}</p>
              <p><strong>Montant:</strong> ${amount} €</p>
            </div>
            <p>Vous pouvez consulter et payer cette dette en cliquant sur le lien ci-dessous:</p>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/debtor/${encodeURIComponent(email)}" class="button">
                Consulter ma dette
              </a>
            </p>
            <p>Cordialement,<br>L'équipe Aistos</p>
          </div>
          <div class="footer">
            <p>Cet email est une notification automatique. Merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}


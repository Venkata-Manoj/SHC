import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || '',
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] Dev mode — would send to ${to}:`, { subject, text });
    return { devMode: true, to, subject };
  }
  return t.sendMail({
    from: process.env.SMTP_FROM || `"SIMATS Hackathon" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

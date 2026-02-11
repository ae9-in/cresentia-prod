const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

const sendVerificationEmail = async (email, verificationUrl) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`Email transport not configured. Verification URL for ${email}: ${verificationUrl}`);
    return { delivered: false };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@learnera.local',
    to: email,
    subject: 'Verify your Learnera account',
    text: `Click this link to verify your account: ${verificationUrl}`
  });
  return { delivered: true };
};

module.exports = { sendVerificationEmail };

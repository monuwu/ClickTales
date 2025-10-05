import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 4000;

app.use(express.json()); // Built-in body parser

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'chahnaasumeet@gmail.com',
    pass: process.env.SMTP_PASS || 'roaz mrma lcev ywvq'
  }
});

// Real email sending function using SMTP
const sendOTPEmail = async (email, otpCode) => {
  const mailOptions = {
    from: '"ClickTales" <no-reply@clicktales.com>',
    to: email,
    subject: 'Your ClickTales OTP Code',
    text: `Dear User,\n\nYour OTP code is: ${otpCode}\n\nPlease use this code to complete your verification. This code is valid for a limited time.\n\n\nThank you for choosing ClickTales.\n\nBest regards,\nThe ClickTales Team`,
    html: `
      <p>Dear User,</p>
      <p>Your OTP code is: <strong>${otpCode}</strong></p>
      <p>Please use this code to complete your verification. This code is valid for a limited time.</p>
      <br/>
      <p>Thank you for choosing ClickTales.</p>
      <p>Best regards,<br/>The ClickTales Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent successfully to ${email}`);
};

// Basic email format validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

app.post('/send-otp', async (req, res) => {
  console.log('🔥 Received POST /send-otp');
  console.log('Headers:', req.headers);
  console.log('Raw body:', req.rawBody || req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Body content:', JSON.stringify(req.body, null, 2));
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    console.log('Missing email or otpCode');
    return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
  }

  console.log('Validating email:', email);
  if (!isValidEmail(email)) {
    console.log('Email validation failed for:', email);
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  try {
    await sendOTPEmail(email, otpCode);
    res.json({ success: true });
  } catch (err) {
    console.error('OTP send error:', err.message || err);
    res.status(500).json({ success: false, error: 'Failed to send OTP email' });
  }
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`OTP email server listening at http://localhost:${port}`);
  console.log('✅ Server ready to send OTP emails!');
});

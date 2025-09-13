import express, { type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json());

// Create transporter once with environment variables for security
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'chahnaasumeet@gmail.com', // Use env var or fallback
    pass: process.env.SMTP_PASS || 'roaz mrma lcev ywvq' // Use env var or fallback
  }
});

// Basic email format validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Simple rate limiting: max 5 requests per email per hour
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;

  const record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

app.post('/send-otp', async (req: Request, res: Response) => {
  console.log('Received POST /send-otp with body:', req.body);
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

  console.log('Checking rate limit for:', email);
  if (!checkRateLimit(email)) {
    console.log('Rate limit exceeded for:', email);
    return res.status(429).json({ success: false, error: 'Too many OTP requests. Please try again later.' });
  }

  console.log('Rate limit check passed, sending email...');
  try {
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

    console.log(`OTP email sent successfully to ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ success: false, error: 'Failed to send OTP email' });
  }
});

app.listen(port, () => {
  console.log(`OTP email server listening at http://localhost:${port}`);
});

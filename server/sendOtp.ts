import express, { type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import cors from 'cors';
import webauthnRouter from './webauthn';

const app = express();
const port = 4000;

app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json());

app.use('/webauthn', webauthnRouter);

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

import bcrypt from 'bcrypt'
import db, { getUserByEmail, createUser, storeOTP } from './db'

interface User {
  id: number
  email: string
  password_hash: string
  name?: string
  username?: string
  role: string
}

app.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, username } = req.body
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' })
  }

  const existingUser = getUserByEmail(email)
  if (existingUser) {
    return res.status(409).json({ success: false, error: 'User already exists' })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    createUser(email, passwordHash, name, username)
    return res.json({ success: true })
  } catch (err) {
    console.error('User registration error:', err)
    return res.status(500).json({ success: false, error: 'Failed to register user' })
  }
})

app.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Login attempt for email:', req.body.email)
    const { email, password } = req.body
    if (!email || !password) {
      console.log('Missing email or password')
      return res.status(400).json({ success: false, error: 'Email and password are required' })
    }

    const user = getUserByEmail(email) as User | undefined
    console.log('User found:', user ? 'yes' : 'no')
    if (!user) {
      console.log('User not found for email:', email)
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    console.log('Comparing password...')
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log('Password match:', passwordMatch)
    if (!passwordMatch) {
      console.log('Password mismatch for user:', email)
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    console.log('Login successful for user:', email)
    // For simplicity, no JWT or session management here
    return res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role } })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

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

  // Store OTP in DB
  try {
    storeOTP(email, otpCode)
  } catch (err) {
    console.error('Failed to store OTP:', err)
    return res.status(500).json({ success: false, error: 'Failed to store OTP' })
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

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON in request body' });
  }
  next(err);
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`OTP email server listening at http://localhost:${port}`);
});

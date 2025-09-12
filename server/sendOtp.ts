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

  console.log('Email validation passed, sending email...');
  try {
    const mailOptions = {
      from: '"ClickTales" <no-reply@clicktales.com>',
      to: email,
      subject: 'Your ClickTales OTP Code',
      text: `Dear User,\n\nYour ClickTales OTP code is: ${otpCode}\n\nPlease use this code to complete your verification. This code is valid for a limited time.\n\nThank you for choosing ClickTales.\n\nBest regards,\nThe ClickTales Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #0078D7;">ClickTales OTP Verification</h2>
          <p>Dear User,</p>
          <p>Your OTP code is: <strong style="font-size: 1.5em;">${otpCode}</strong></p>
          <p>Please use this code to complete your verification. This code is valid for a limited time.</p>
          <br/>
          <p>Thank you for choosing <strong>ClickTales</strong>.</p>
          <p>Best regards,<br/>The ClickTales Team</p>
        </div>
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

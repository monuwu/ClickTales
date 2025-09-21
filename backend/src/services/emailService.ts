import nodemailer from 'nodemailer';
import { AppError, ErrorCodes } from '../types';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@clicktales.com',
      fromName: process.env.FROM_NAME || 'ClickTales',
    };

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.port === 465, // true for 465, false for other ports
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.warn('⚠️  Email service configuration error:', error);
      // Don't throw error here to prevent server crash, just log warning
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('📧 Email send error:', error);
      throw new AppError('Failed to send email', ErrorCodes.INTERNAL_SERVER);
    }
  }

  async sendOtpEmail(email: string, otpCode: string, type: 'SIGNUP' | 'LOGIN' | 'RESET'): Promise<void> {
    const subject = this.getOtpSubject(type);
    const html = this.generateOtpEmailTemplate(otpCode, type);
    const text = `Your ClickTales verification code is: ${otpCode}. This code will expire in 10 minutes.`;

    // In development mode without proper email config, just log the OTP
    if (process.env.NODE_ENV === 'development' && (!this.config.user || this.config.user === 'your_email@gmail.com')) {
      console.log(`📧 [DEV MODE] Would send OTP email to ${email}`);
      console.log(`📧 [DEV MODE] Subject: ${subject}`);
      console.log(`📧 [DEV MODE] OTP Code: ${otpCode}`);
      console.log(`📧 [DEV MODE] Type: ${type}`);
      return;
    }

    await this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  private getOtpSubject(type: 'SIGNUP' | 'LOGIN' | 'RESET'): string {
    switch (type) {
      case 'SIGNUP':
        return 'Welcome to ClickTales - Verify Your Account';
      case 'LOGIN':
        return 'ClickTales Login Verification Code';
      case 'RESET':
        return 'ClickTales Password Reset Code';
      default:
        return 'ClickTales Verification Code';
    }
  }

  private generateOtpEmailTemplate(otpCode: string, type: 'SIGNUP' | 'LOGIN' | 'RESET'): string {
    const title = type === 'SIGNUP' ? 'Welcome to ClickTales!' : 'Verification Required';
    const message = this.getOtpMessage(type);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 30px; }
          .otp-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; margin: 10px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 12px; margin: 15px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📸 ${title}</h1>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p>${message}</p>
            
            <div class="otp-box">
              <p><strong>Your verification code is:</strong></p>
              <div class="otp-code">${otpCode}</div>
              <p><small>Enter this code to continue</small></p>
            </div>

            <div class="warning">
              ⏰ <strong>This code expires in 10 minutes</strong> and can only be used once.
            </div>

            <p>If you didn't request this code, please ignore this email or contact our support team.</p>
            
            <p>Best regards,<br>The ClickTales Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ClickTales. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOtpMessage(type: 'SIGNUP' | 'LOGIN' | 'RESET'): string {
    switch (type) {
      case 'SIGNUP':
        return 'Thank you for signing up with ClickTales! To complete your account setup, please verify your email address using the code below.';
      case 'LOGIN':
        return 'We received a login attempt for your ClickTales account. Please use the verification code below to proceed.';
      case 'RESET':
        return 'You requested a password reset for your ClickTales account. Use the code below to reset your password.';
      default:
        return 'Please use the verification code below to proceed with your ClickTales account action.';
    }
  }
}

export default EmailService;
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OtpServiceConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  fromName?: string;
}

export class OtpService {
  private transporter: nodemailer.Transporter;
  private config: OtpServiceConfig;

  constructor(config: OtpServiceConfig = {}) {
    this.config = {
      smtpHost: config.smtpHost || process.env.SMTP_HOST || 'localhost',
      smtpPort: config.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: config.smtpUser || process.env.SMTP_USER || '',
      smtpPass: config.smtpPass || process.env.SMTP_PASS || '',
      fromEmail: config.fromEmail || process.env.FROM_EMAIL || 'noreply@clicktales.com',
      fromName: config.fromName || process.env.FROM_NAME || 'ClickTales',
      ...config
    };

    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.config.smtpUser,
        pass: this.config.smtpPass,
      },
    });
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOtpCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Create and store OTP in database
   */
  async createOtp(userId: string, type: 'SIGNUP' | 'LOGIN' | 'ENABLE_2FA' | 'DISABLE_2FA' | 'PASSWORD_RESET'): Promise<string> {
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Clean up any existing unused OTPs for this user and type
    await prisma.otpVerification.deleteMany({
      where: {
        userId,
        type,
        used: false
      }
    });

    // Create new OTP
    await prisma.otpVerification.create({
      data: {
        userId,
        otpCode: code,
        type,
        expiresAt
      }
    });

    return code;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(userId: string, code: string, type: 'LOGIN' | 'ENABLE_2FA' | 'DISABLE_2FA' | 'PASSWORD_RESET'): Promise<{ valid: boolean; error?: string }> {
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        userId,
        otpCode: code,
        type,
        used: false
      }
    });

    if (!otpRecord) {
      return { valid: false, error: 'Invalid OTP code' };
    }

    if (new Date() > otpRecord.expiresAt) {
      // Mark as used to prevent reuse
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { used: true }
      });
      return { valid: false, error: 'OTP code has expired' };
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    return { valid: true };
  }

  /**
   * Send OTP via email
   */
  async sendOtpEmail(email: string, code: string, type: 'LOGIN' | 'ENABLE_2FA' | 'DISABLE_2FA' | 'PASSWORD_RESET'): Promise<void> {
    let subject: string;
    let htmlContent: string;

    switch (type) {
      case 'LOGIN':
        subject = 'Your ClickTales Login Code';
        htmlContent = this.getLoginEmailTemplate(code);
        break;
      case 'ENABLE_2FA':
        subject = 'Enable Two-Factor Authentication';
        htmlContent = this.getEnable2FAEmailTemplate(code);
        break;
      case 'DISABLE_2FA':
        subject = 'Disable Two-Factor Authentication';
        htmlContent = this.getDisable2FAEmailTemplate(code);
        break;
      case 'PASSWORD_RESET':
        subject = 'Password Reset Code';
        htmlContent = this.getPasswordResetEmailTemplate(code);
        break;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
        to: email,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Clean up expired OTPs (should be run periodically)
   */
  async cleanupExpiredOtps(): Promise<void> {
    await prisma.otpVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }

  /**
   * Email templates
   */
  private getLoginEmailTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">ClickTales</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Your Login Verification Code</p>
        </div>
        <div style="padding: 40px 30px; background: #f9f9f9;">
          <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            Hello! You've requested to log in to your ClickTales account. Use the verification code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: white; padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</div>
            </div>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; background: #eee;">
          <p>© 2025 ClickTales. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  private getEnable2FAEmailTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">ClickTales</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Enable Two-Factor Authentication</p>
        </div>
        <div style="padding: 40px 30px; background: #f9f9f9;">
          <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            You're enabling two-factor authentication for your ClickTales account. Enter this verification code:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: white; padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</div>
            </div>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This code will expire in 10 minutes.
          </p>
        </div>
        <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; background: #eee;">
          <p>© 2025 ClickTales. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  private getDisable2FAEmailTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">ClickTales</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Disable Two-Factor Authentication</p>
        </div>
        <div style="padding: 40px 30px; background: #f9f9f9;">
          <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            You're disabling two-factor authentication for your ClickTales account. Enter this verification code to confirm:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: white; padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</div>
            </div>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This code will expire in 10 minutes.
          </p>
        </div>
        <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; background: #eee;">
          <p>© 2025 ClickTales. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  private getPasswordResetEmailTemplate(code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">ClickTales</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Password Reset Code</p>
        </div>
        <div style="padding: 40px 30px; background: #f9f9f9;">
          <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
            You've requested to reset your ClickTales password. Use this verification code:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: white; padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</div>
            </div>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
        <div style="padding: 20px 30px; text-align: center; color: #666; font-size: 12px; background: #eee;">
          <p>© 2025 ClickTales. All rights reserved.</p>
        </div>
      </div>
    `;
  }
}
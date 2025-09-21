import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { JWTPayload, CreateUserDto, LoginDto, AuthResponse, AppError, ErrorCodes } from '../types';

const prisma = new PrismaClient();

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  private static validateJWTSecret(): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return this.JWT_SECRET;
  }

  static async register(userData: CreateUserDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User already exists with this email or username', ErrorCodes.CONFLICT);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
      }
    });

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      ...(user.avatar && { avatar: user.avatar })
    };

    return {
      user: userResponse,
      token,
      refreshToken,
    };
  }

  static async login(loginData: LoginDto): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: loginData.email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        password: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', ErrorCodes.UNAUTHORIZED);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', ErrorCodes.UNAUTHORIZED);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Generate tokens
    const token = this.generateToken(userWithoutPassword);
    const refreshToken = this.generateRefreshToken(userWithoutPassword);

    const userResponse = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      username: userWithoutPassword.username,
      name: userWithoutPassword.name,
      role: userWithoutPassword.role,
      ...(userWithoutPassword.avatar && { avatar: userWithoutPassword.avatar })
    };

    return {
      user: userResponse,
      token,
      refreshToken,
    };
  }

  static async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const payload = jwt.verify(token, this.validateJWTSecret()) as JWTPayload;
      
      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
        }
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', ErrorCodes.UNAUTHORIZED);
      }

      // Generate new tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      const userResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        ...(user.avatar && { avatar: user.avatar })
      };

      return {
        user: userResponse,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', ErrorCodes.UNAUTHORIZED);
    }
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      }
    });
  }

  private static generateToken(user: any): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: '24h',
    };

    return jwt.sign(payload, this.validateJWTSecret(), options);
  }

  private static generateRefreshToken(user: any): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: '7d',
    };

    return jwt.sign(payload, this.validateJWTSecret(), options);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.validateJWTSecret()) as JWTPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', ErrorCodes.UNAUTHORIZED);
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      throw new AppError('User not found', ErrorCodes.NOT_FOUND);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', ErrorCodes.UNAUTHORIZED);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  }

  // Additional helper methods for OTP functionality
  static async findUserByEmail(email: string): Promise<any> {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        password: true,
        role: true,
        avatar: true,
        twoFactorEnabled: true,
        isActive: true,
      }
    });
  }

  static async findUserById(id: string): Promise<any> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        twoFactorEnabled: true,
        isActive: true,
      }
    });
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async generateTokens(userId: string): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        name: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', ErrorCodes.NOT_FOUND);
    }

    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  static async enable2FA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });
  }

  static async disable2FA(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      }
    });
  }
}
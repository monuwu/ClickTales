import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateUserDto, LoginDto, ApiResponse, AppError, ErrorCodes, UpdateUserDto, SignupRequestDto } from '../types';
import { AuthService } from '../services/authService';
import { OtpService } from '../services/otpService';
import { EmailService } from '../services/emailService';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthController {
  static validateSignupRequest = [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('phoneNumber')
      .optional()
      .isMobilePhone('any')
      .withMessage('Valid phone number is required'),
  ];

  static validateRegister = [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('name')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .trim(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ];

  static validateVerifySignupOtp = [
    body('userId')
      .isUUID()
      .withMessage('Valid user ID is required'),
    body('otpCode')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP code must be exactly 6 digits')
      .matches(/^\d{6}$/)
      .withMessage('OTP code must contain only numbers'),
  ];

  static validateLogin = [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];

  static register = asyncHandler(async (req: AuthenticatedRequest<CreateUserDto>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.array().reduce((acc: Record<string, string[]>, error: any) => {
          const field = error.path || error.param;
          if (!acc[field]) acc[field] = [];
          acc[field].push(error.msg);
          return acc;
        }, {})
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    const userData: CreateUserDto = req.body;
    const result = await AuthService.register(userData);

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: result
    };

    return res.status(201).json(response);
  });

  static login = asyncHandler(async (req: AuthenticatedRequest<LoginDto>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.array().reduce((acc: Record<string, string[]>, error: any) => {
          const field = error.path || error.param;
          if (!acc[field]) acc[field] = [];
          acc[field].push(error.msg);
          return acc;
        }, {})
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    const loginData: LoginDto = req.body;
    const result = await AuthService.login(loginData);

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: result
    };

    return res.json(response);
  });

  static refreshToken = asyncHandler(async (req: AuthenticatedRequest<{ refreshToken: string }>, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AppError('Refresh token is required', ErrorCodes.VALIDATION_ERROR);
    }

    const result = await AuthService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: result
    };

    res.json(response);
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const user = await AuthService.getUserById(req.user.id);
    
    if (!user) {
      throw new AppError('User not found', ErrorCodes.NOT_FOUND);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    };

    res.json(response);
  });

  static updateProfile = asyncHandler(async (req: AuthenticatedRequest<UpdateUserDto>, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const updateData: UpdateUserDto = req.body;
    
    // Validate and sanitize update data
    const allowedUpdates: (keyof UpdateUserDto)[] = ['name', 'username', 'avatar'];
    const filteredUpdateData: Partial<UpdateUserDto> = {};
    
    for (const key of allowedUpdates) {
      if (key in updateData && updateData[key] !== undefined) {
        if (typeof updateData[key] === 'string') {
          filteredUpdateData[key] = (updateData[key] as string).trim();
        }
      }
    }

    // Check if there's anything to update
    if (Object.keys(filteredUpdateData).length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'No valid fields to update'
      };
      res.status(ErrorCodes.VALIDATION_ERROR).json(response);
      return;
    }

    // Check if username is being updated and if it's already taken
    if (filteredUpdateData.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: filteredUpdateData.username }
      });
      
      if (existingUser && existingUser.id !== req.user.id) {
        const response: ApiResponse = {
          success: false,
          message: 'Username is already taken'
        };
        res.status(ErrorCodes.CONFLICT).json(response);
        return;
      }
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: filteredUpdateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    };

    res.json(response);
  });

  static changePassword = asyncHandler(async (req: AuthenticatedRequest<{ currentPassword: string; newPassword: string }>, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', ErrorCodes.VALIDATION_ERROR);
    }

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.json(response);
  });

  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    res.json(response);
  });

  // Signup OTP Methods
  static requestSignupOtp = asyncHandler(async (req: AuthenticatedRequest<SignupRequestDto>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.array().reduce((acc: Record<string, string[]>, error: any) => {
          const field = error.path || error.param;
          if (!acc[field]) acc[field] = [];
          acc[field].push(error.msg);
          return acc;
        }, {})
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    const { email, username, password, phoneNumber } = req.body;

    try {
      // Check if email already exists
      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'Email already registered'
        };
        return res.status(ErrorCodes.CONFLICT).json(response);
      }

      // Check if username already exists
      const existingUsername = await AuthService.findUserByUsername(username);
      if (existingUsername) {
        const response: ApiResponse = {
          success: false,
          message: 'Username already taken'
        };
        return res.status(ErrorCodes.CONFLICT).json(response);
      }

      // Create user with isVerified=false
      const userData: CreateUserDto = {
        email,
        username,
        name: username, // Use username as default name, user can update later
        password,
        phoneNumber
      };

      const user = await AuthService.createUnverifiedUser(userData);

      // Generate and send OTP
      const otpService = new OtpService();
      const otpCode = await otpService.createOtp(user.id, 'SIGNUP');
      
      const emailService = new EmailService();
      await emailService.sendOtpEmail(email, otpCode, 'SIGNUP');

      const response: ApiResponse = {
        success: true,
        message: 'Verification code sent to your email. Please check your inbox and verify your account.',
        data: {
          userId: user.id,
          email: user.email
        }
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error('Signup OTP request error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to process signup request'
      };
      return res.status(ErrorCodes.INTERNAL_SERVER).json(response);
    }
  });

  // OTP Methods
  static requestOtp = asyncHandler(async (req: AuthenticatedRequest<{ email: string, type: 'LOGIN' | 'ENABLE_2FA' | 'DISABLE_2FA' | 'PASSWORD_RESET' }>, res: Response, next: NextFunction) => {
    const { email, type } = req.body;

    if (!email || !type) {
      const response: ApiResponse = {
        success: false,
        message: 'Email and type are required'
      };
      return res.status(400).json(response);
    }

    try {
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        return res.status(404).json(response);
      }

      const otpService = new OtpService();
      const otpCode = await otpService.createOtp(user.id, type);
      await otpService.sendOtpEmail(email, otpCode, type);

      const response: ApiResponse = {
        success: true,
        message: 'OTP sent to your email'
      };

      return res.json(response);
    } catch (error) {
      console.error('OTP request error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send OTP'
      };
      return res.status(500).json(response);
    }
  });

  static verifyOtp = asyncHandler(async (req: AuthenticatedRequest<{ email: string, code: string, type: 'LOGIN' | 'ENABLE_2FA' | 'DISABLE_2FA' | 'PASSWORD_RESET' }>, res: Response, next: NextFunction) => {
    const { email, code, type } = req.body;

    if (!email || !code || !type) {
      const response: ApiResponse = {
        success: false,
        message: 'Email, code, and type are required'
      };
      return res.status(400).json(response);
    }

    try {
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        return res.status(404).json(response);
      }

      const otpService = new OtpService();
      const verification = await otpService.verifyOtp(user.id, code, type);

      if (!verification.valid) {
        const response: ApiResponse = {
          success: false,
          message: verification.error || 'Invalid OTP'
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse = {
        success: true,
        message: 'OTP verified successfully'
      };

      return res.json(response);
    } catch (error) {
      console.error('OTP verification error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to verify OTP'
      };
      return res.status(500).json(response);
    }
  });

  static loginWithOtp = asyncHandler(async (req: AuthenticatedRequest<LoginDto & { otpCode?: string }>, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: errors.array().reduce((acc: Record<string, string[]>, error: any) => {
          const field = error.path || error.param;
          if (!acc[field]) acc[field] = [];
          acc[field].push(error.msg);
          return acc;
        }, {})
      };
      return res.status(400).json(response);
    }

    try {
      const { email, password, otpCode } = req.body;
      const user = await AuthService.findUserByEmail(email);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid credentials'
        };
        return res.status(401).json(response);
      }

      const isPasswordValid = await AuthService.validatePassword(password, user.password);
      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid credentials'
        };
        return res.status(401).json(response);
      }

      // If user has 2FA enabled, verify OTP
      if (user.twoFactorEnabled) {
        if (!otpCode) {
          const response: ApiResponse = {
            success: false,
            message: 'OTP code required',
            requiresOtp: true
          };
          return res.status(200).json(response);
        }

        const otpService = new OtpService();
        const verification = await otpService.verifyOtp(user.id, otpCode, 'LOGIN');

        if (!verification.valid) {
          const response: ApiResponse = {
            success: false,
            message: verification.error || 'Invalid OTP'
          };
          return res.status(400).json(response);
        }
      }

      // Generate tokens
      const { accessToken, refreshToken } = await AuthService.generateTokens(user.id);

      // Update last login
      await AuthService.updateLastLogin(user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled
          },
          accessToken,
          refreshToken
        }
      };

      return res.json(response);
    } catch (error) {
      console.error('Login with OTP error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Login failed'
      };
      return res.status(500).json(response);
    }
  });

  // 2FA Management
  static enable2FA = asyncHandler(async (req: AuthenticatedRequest<{ otpCode: string }>, res: Response, next: NextFunction) => {
    const { otpCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!otpCode) {
      const response: ApiResponse = {
        success: false,
        message: 'OTP code required'
      };
      return res.status(400).json(response);
    }

    try {
      const otpService = new OtpService();
      const verification = await otpService.verifyOtp(userId, otpCode, 'ENABLE_2FA');

      if (!verification.valid) {
        const response: ApiResponse = {
          success: false,
          message: verification.error || 'Invalid OTP'
        };
        return res.status(400).json(response);
      }

      await AuthService.enable2FA(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Two-factor authentication enabled successfully'
      };

      return res.json(response);
    } catch (error) {
      console.error('Enable 2FA error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to enable two-factor authentication'
      };
      return res.status(500).json(response);
    }
  });

  static disable2FA = asyncHandler(async (req: AuthenticatedRequest<{ otpCode: string }>, res: Response, next: NextFunction) => {
    const { otpCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!otpCode) {
      const response: ApiResponse = {
        success: false,
        message: 'OTP code required'
      };
      return res.status(400).json(response);
    }

    try {
      const otpService = new OtpService();
      const verification = await otpService.verifyOtp(userId, otpCode, 'DISABLE_2FA');

      if (!verification.valid) {
        const response: ApiResponse = {
          success: false,
          message: verification.error || 'Invalid OTP'
        };
        return res.status(400).json(response);
      }

      await AuthService.disable2FA(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Two-factor authentication disabled successfully'
      };

      return res.json(response);
    } catch (error) {
      console.error('Disable 2FA error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to disable two-factor authentication'
      };
      return res.status(500).json(response);
    }
  });

  static get2FAStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    try {
      const user = await AuthService.findUserById(userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          twoFactorEnabled: user.twoFactorEnabled
        }
      };

      return res.json(response);
    } catch (error) {
      console.error('Get 2FA status error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get 2FA status'
      };
      return res.status(500).json(response);
    }
  });

  static verifySignupOtp = asyncHandler(async (req: AuthenticatedRequest<{ userId: string; otpCode: string }>, res: Response, next: NextFunction) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        errors: { validation: errors.array().map(err => err.msg) }
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    try {
      const { userId, otpCode } = req.body;

      if (!userId || !otpCode) {
        const response: ApiResponse = {
          success: false,
          message: 'User ID and OTP code are required'
        };
        return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
      }

      // Verify the OTP and activate user account
      const result = await AuthService.verifySignupOtp(userId, otpCode);

      const response: ApiResponse = {
        success: true,
        message: 'Account verified successfully! You are now logged in.',
        data: result
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Verify signup OTP error:', error);
      
      if (error instanceof AppError) {
        const response: ApiResponse = {
          success: false,
          message: error.message
        };
        return res.status(error.statusCode).json(response);
      }

      const response: ApiResponse = {
        success: false,
        message: 'Failed to verify OTP code'
      };
      return res.status(ErrorCodes.INTERNAL_SERVER).json(response);
    }
  });
}
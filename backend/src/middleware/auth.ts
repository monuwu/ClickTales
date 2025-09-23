import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AppError, ErrorCodes } from '../types';
import { AuthService } from '../services/authService';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', ErrorCodes.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = AuthService.verifyToken(token);
    
    // Get user data
    const user = await AuthService.getUserById(payload.id);
    if (!user) {
      throw new AppError('User not found', ErrorCodes.UNAUTHORIZED);
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', ErrorCodes.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', ErrorCodes.FORBIDDEN));
    }

    next();
  };
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const payload = AuthService.verifyToken(token);
        const user = await AuthService.getUserById(payload.id);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
          };
        }
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
        console.warn('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export { AuthenticatedRequest };

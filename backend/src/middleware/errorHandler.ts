import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse, ErrorCodes } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Record<string, string[]> | undefined;

  // Handle known AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // Handle Prisma errors
  else if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        statusCode = ErrorCodes.CONFLICT;
        message = 'Unique constraint violation';
        break;
      case 'P2025':
        statusCode = ErrorCodes.NOT_FOUND;
        message = 'Record not found';
        break;
      default:
        statusCode = ErrorCodes.INTERNAL_SERVER;
        message = 'Database error';
    }
  }
  
  // Handle validation errors
  else if (error.constructor.name === 'ValidationError') {
    statusCode = ErrorCodes.VALIDATION_ERROR;
    message = 'Validation failed';
    // Extract validation errors if available
  }

  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = ErrorCodes.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = ErrorCodes.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : message,
    ...(errors && { errors })
  };

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'Not Found'
  };
  
  res.status(ErrorCodes.NOT_FOUND).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
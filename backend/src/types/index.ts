import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest<T = any> extends Request {
  body: T;
  user?: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
  };
}

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  requiresOtp?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User related types
export interface CreateUserDto {
  email: string;
  username: string;
  name: string;
  password: string;
  phoneNumber?: string | undefined;
}

export interface SignupRequestDto {
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateUserDto {
  name?: string;
  username?: string;
  avatar?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    role: string;
    avatar?: string;
  };
  token: string;
  refreshToken?: string;
}

// Photo related types
export interface PhotoUploadDto {
  file: Express.Multer.File;
  tags?: string[];
  location?: string;
  device?: string;
  isPublic?: boolean;
}

export interface UpdatePhotoDto {
  tags?: string[];
  isPublic?: boolean;
  isFeatured?: boolean;
}

export interface PhotoFilters {
  userId?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
}

// Album related types
export interface CreateAlbumDto {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateAlbumDto {
  title?: string;
  description?: string;
  isPublic?: boolean;
  coverPhotoId?: string;
}

export interface AddPhotosToAlbumDto {
  photoIds: string[];
}

// Collage related types
export interface CreateCollageDto {
  title: string;
  template: string;
  layout: any;
  width: number;
  height: number;
  photos: CollagePhotoDto[];
}

export interface CollagePhotoDto {
  photoId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

// Photobooth Session types
export interface CreateSessionDto {
  sessionName?: string;
  eventName?: string;
  location?: string;
  settings?: any;
}

export interface UpdateSessionDto {
  sessionName?: string;
  eventName?: string;
  location?: string;
  settings?: any;
  isActive?: boolean;
}

export interface SessionStats {
  photosTaken: number;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // in minutes
}

// File upload types
export interface CloudinaryResponse {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  createThumbnail?: boolean;
  thumbnailSize?: number;
}

// System Settings types
export interface CreateSystemSettingDto {
  key: string;
  value: string;
  description?: string;
  type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
}

export interface UpdateSystemSettingDto {
  value: string;
  description?: string;
  type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
}

export interface SystemSettingsResponse {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  createdAt: Date;
  updatedAt: Date;
}

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export enum ErrorCodes {
  VALIDATION_ERROR = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  RATE_LIMIT = 429,
  INTERNAL_SERVER = 500,
}
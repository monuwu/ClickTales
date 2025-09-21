import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, ApiResponse, PaginatedResponse, PhotoFilters, UpdatePhotoDto, AppError, ErrorCodes, PaginationOptions } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class PhotoController {
  static getPhotos = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', userId, isPublic, tags, startDate, endDate } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};
    
    // If user is not admin, they can only see their own photos or public photos
    if (req.user?.role !== 'ADMIN') {
      where.OR = [
        { userId: req.user?.id },
        { isPublic: true }
      ];
    }

    if (userId && req.user?.role === 'ADMIN') {
      where.userId = userId;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        hasSome: tagArray
      };
    }

    if (startDate || endDate) {
      where.capturedAt = {};
      if (startDate) {
        where.capturedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.capturedAt.lte = new Date(endDate as string);
      }
    }

    const [photos, totalItems] = await Promise.all([
      prisma.photo.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          albums: {
            include: {
              album: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }),
      prisma.photo.count({ where })
    ]);

    const totalPages = Math.ceil(totalItems / take);
    const currentPage = Number(page);

    const response: PaginatedResponse<any> = {
      success: true,
      message: 'Photos retrieved successfully',
      data: photos,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: take,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };

    res.json(response);
  });

  static getPhotoById = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Photo ID is required'
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        albums: {
          include: {
            album: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!photo) {
      throw new AppError('Photo not found', ErrorCodes.NOT_FOUND);
    }

    // Check permissions
    if (!photo.isPublic && photo.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      throw new AppError('Access denied', ErrorCodes.FORBIDDEN);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Photo retrieved successfully',
      data: { photo }
    };

    return res.json(response);
  });

  static updatePhoto = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', ErrorCodes.UNAUTHORIZED);
    }

    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Photo ID is required'
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    const updateData: UpdatePhotoDto = req.body;

    // Check if photo exists and belongs to user
    const existingPhoto = await prisma.photo.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingPhoto) {
      throw new AppError('Photo not found', ErrorCodes.NOT_FOUND);
    }

    if (existingPhoto.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Access denied', ErrorCodes.FORBIDDEN);
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Photo updated successfully',
      data: { photo: updatedPhoto }
    };

    return res.json(response);
  });

  static deletePhoto = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', ErrorCodes.UNAUTHORIZED);
    }

    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Photo ID is required'
      };
      return res.status(ErrorCodes.VALIDATION_ERROR).json(response);
    }

    // Check if photo exists and belongs to user
    const existingPhoto = await prisma.photo.findUnique({
      where: { id },
      select: { userId: true, cloudinaryPublicId: true }
    });

    if (!existingPhoto) {
      throw new AppError('Photo not found', ErrorCodes.NOT_FOUND);
    }

    if (existingPhoto.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Access denied', ErrorCodes.FORBIDDEN);
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id }
    });

    // TODO: Delete from cloud storage if cloudinaryPublicId exists

    const response: ApiResponse = {
      success: true,
      message: 'Photo deleted successfully'
    };

    return res.json(response);
  });

  static getUserPhotos = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', ErrorCodes.UNAUTHORIZED);
    }

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [photos, totalItems] = await Promise.all([
      prisma.photo.findMany({
        where: { userId: req.user.id },
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder
        },
        include: {
          albums: {
            include: {
              album: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }),
      prisma.photo.count({ where: { userId: req.user.id } })
    ]);

    const totalPages = Math.ceil(totalItems / take);
    const currentPage = Number(page);

    const response: PaginatedResponse<any> = {
      success: true,
      message: 'User photos retrieved successfully',
      data: photos,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: take,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };

    return res.json(response);
  });
}
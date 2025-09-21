import { Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { AuthenticatedRequest, ApiResponse, PaginationOptions } from '../types';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AlbumController {
  // Validation rules
  static validateCreateAlbum = [
    body('title')
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
  ];

  static validateUpdateAlbum = [
    param('id')
      .isString()
      .withMessage('Album ID is required'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
  ];

  static validateAddPhotos = [
    param('id')
      .isString()
      .withMessage('Album ID is required'),
    body('photoIds')
      .isArray({ min: 1 })
      .withMessage('At least one photo ID is required'),
    body('photoIds.*')
      .isString()
      .withMessage('Photo IDs must be strings'),
  ];

  // Get all albums for the authenticated user
  static getAlbums = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as any;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    try {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const whereClause: any = {
        userId
      };

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [albums, totalCount] = await Promise.all([
        prisma.album.findMany({
          where: whereClause,
          skip,
          take: parseInt(limit),
          orderBy: {
            [sortBy]: sortOrder
          },
          include: {
            photos: {
              include: {
                photo: {
                  select: {
                    id: true,
                    filename: true,
                    thumbnailUrl: true
                  }
                }
              },
              take: 1,
              orderBy: { order: 'asc' }
            },
            _count: {
              select: { photos: true }
            }
          }
        }),
        prisma.album.count({ where: whereClause })
      ]);

      const response: ApiResponse = {
        success: true,
        data: albums.map(album => ({
          ...album,
          photoCount: album._count.photos,
          coverPhoto: album.photos[0]?.photo || null,
          photos: undefined,
          _count: undefined
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      };

      return res.json(response);
    } catch (error) {
      console.error('Get albums error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch albums'
      };
      return res.status(500).json(response);
    }
  });

  // Get single album by ID
  static getAlbumById = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Album ID is required'
      };
      return res.status(400).json(response);
    }

    try {
      const album = await prisma.album.findFirst({
        where: { 
          id,
          userId // Ensure user can only access their own albums
        },
        include: {
          photos: {
            include: {
              photo: {
                select: {
                  id: true,
                  filename: true,
                  url: true,
                  thumbnailUrl: true,
                  size: true,
                  width: true,
                  height: true,
                  capturedAt: true,
                  filters: true,
                  tags: true,
                  isPublic: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          user: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });

      if (!album) {
        const response: ApiResponse = {
          success: false,
          message: 'Album not found'
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          ...album,
          photos: album.photos.map((ap: any) => ap.photo)
        }
      };

      return res.json(response);
    } catch (error) {
      console.error('Get album error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to fetch album'
      };
      return res.status(500).json(response);
    }
  });

  // Create new album
  static createAlbum = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const userId = req.user?.id;
    const { title, description, isPublic = false } = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    try {
      const album = await prisma.album.create({
        data: {
          title,
          description,
          isPublic,
          userId
        },
        include: {
          _count: {
            select: { photos: true }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Album created successfully',
        data: {
          ...album,
          photoCount: album._count.photos,
          _count: undefined
        }
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error('Create album error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create album'
      };
      return res.status(500).json(response);
    }
  });

  // Update album
  static updateAlbum = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Album ID is required'
      };
      return res.status(400).json(response);
    }

    try {
      // Check if album exists and belongs to user
      const existingAlbum = await prisma.album.findFirst({
        where: { id, userId }
      });

      if (!existingAlbum) {
        const response: ApiResponse = {
          success: false,
          message: 'Album not found'
        };
        return res.status(404).json(response);
      }

      const album = await prisma.album.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { photos: true }
          }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Album updated successfully',
        data: {
          ...album,
          photoCount: album._count.photos,
          _count: undefined
        }
      };

      return res.json(response);
    } catch (error) {
      console.error('Update album error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update album'
      };
      return res.status(500).json(response);
    }
  });

  // Delete album
  static deleteAlbum = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Album ID is required'
      };
      return res.status(400).json(response);
    }

    try {
      // Check if album exists and belongs to user
      const existingAlbum = await prisma.album.findUnique({
        where: { id }
      });

      if (!existingAlbum || existingAlbum.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Album not found'
        };
        return res.status(404).json(response);
      }

      // Delete album (cascade will handle AlbumPhoto relations)
      await prisma.album.delete({
        where: { id }
      });

      const response: ApiResponse = {
        success: true,
        message: 'Album deleted successfully'
      };

      return res.json(response);
    } catch (error) {
      console.error('Delete album error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete album'
      };
      return res.status(500).json(response);
    }
  });

  // Add photos to album
  static addPhotosToAlbum = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const { id } = req.params;
    const { photoIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Album ID is required'
      };
      return res.status(400).json(response);
    }

    try {
      // Check if album exists and belongs to user
      const album = await prisma.album.findUnique({
        where: { id }
      });

      if (!album || album.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Album not found'
        };
        return res.status(404).json(response);
      }

      // Verify all photos belong to the user
      const photos = await prisma.photo.findMany({
        where: {
          id: { in: photoIds },
          userId
        }
      });

      if (photos.length !== photoIds.length) {
        const response: ApiResponse = {
          success: false,
          message: 'Some photos not found or not accessible'
        };
        return res.status(400).json(response);
      }

      // Get current max order in album
      const maxOrder = await prisma.albumPhoto.findFirst({
        where: { albumId: id },
        orderBy: { order: 'desc' },
        select: { order: true }
      });

      let nextOrder = (maxOrder?.order || 0) + 1;

      // Create album-photo relationships
      const albumPhotos = await prisma.albumPhoto.createMany({
        data: photoIds.map((photoId: string) => ({
          albumId: id,
          photoId,
          order: nextOrder++
        })),
        skipDuplicates: true
      });

      const response: ApiResponse = {
        success: true,
        message: `${albumPhotos.count} photos added to album`,
        data: { addedCount: albumPhotos.count }
      };

      return res.json(response);
    } catch (error) {
      console.error('Add photos to album error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to add photos to album'
      };
      return res.status(500).json(response);
    }
  });

  // Remove photos from album
  static removePhotosFromAlbum = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { photoIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Album ID is required'
      };
      return res.status(400).json(response);
    }

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Photo IDs are required'
      };
      return res.status(400).json(response);
    }

    try {
      // Check if album exists and belongs to user
      const album = await prisma.album.findUnique({
        where: { id }
      });

      if (!album || album.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Album not found'
        };
        return res.status(404).json(response);
      }

      // Remove photos from album
      const deletedCount = await prisma.albumPhoto.deleteMany({
        where: {
          albumId: id,
          photoId: { in: photoIds }
        }
      });

      const response: ApiResponse = {
        success: true,
        message: `${deletedCount.count} photos removed from album`,
        data: { removedCount: deletedCount.count }
      };

      return res.json(response);
    } catch (error) {
      console.error('Remove photos from album error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to remove photos from album'
      };
      return res.status(500).json(response);
    }
  });

  // Reorder photos in album
  static reorderPhotos = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { photoOrders } = req.body; // Array of { photoId: string, order: number }
    const userId = req.user?.id;

    if (!userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: 'Album ID is required'
      };
      return res.status(400).json(response);
    }

    if (!photoOrders || !Array.isArray(photoOrders)) {
      const response: ApiResponse = {
        success: false,
        message: 'Photo orders array is required'
      };
      return res.status(400).json(response);
    }

    try {
      // Check if album exists and belongs to user
      const album = await prisma.album.findUnique({
        where: { id }
      });

      if (!album || album.userId !== userId) {
        const response: ApiResponse = {
          success: false,
          message: 'Album not found'
        };
        return res.status(404).json(response);
      }

      // Update orders in a transaction
      await prisma.$transaction(
        photoOrders.map(({ photoId, order }: { photoId: string, order: number }) =>
          prisma.albumPhoto.update({
            where: {
              albumId_photoId: {
                albumId: id,
                photoId
              }
            },
            data: { order }
          })
        )
      );

      const response: ApiResponse = {
        success: true,
        message: 'Photos reordered successfully'
      };

      return res.json(response);
    } catch (error) {
      console.error('Reorder photos error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to reorder photos'
      };
      return res.status(500).json(response);
    }
  });
}
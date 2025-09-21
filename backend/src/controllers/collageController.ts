import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateCollageDto, ApiResponse, AppError, CollagePhotoDto } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class CollageController {
  // Create a new collage
  static createCollage = asyncHandler(async (req: AuthenticatedRequest<CreateCollageDto>, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { title, template, layout, width, height, photos } = req.body;

    // Validate required fields
    if (!title || !template || !layout || !width || !height || !photos || photos.length === 0) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate that all photos exist and belong to the user
    const photoIds = photos.map((p: CollagePhotoDto) => p.photoId);
    const existingPhotos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        userId: req.user.id
      }
    });

    if (existingPhotos.length !== photoIds.length) {
      throw new AppError('One or more photos not found or not owned by user', 404);
    }

    // Create collage with photos in a transaction
    const collage = await prisma.$transaction(async (tx) => {
      // Create the collage
      const newCollage = await tx.collage.create({
        data: {
          title,
          template,
          layout: JSON.stringify(layout),
          width,
          height,
          userId: req.user!.id
        }
      });

      // Create collage photos
      const collagePhotos = await tx.collagePhoto.createMany({
        data: photos.map((photo: CollagePhotoDto) => ({
          collageId: newCollage.id,
          photoId: photo.photoId,
          x: photo.x,
          y: photo.y,
          width: photo.width,
          height: photo.height,
          rotation: photo.rotation || 0,
          zIndex: photo.zIndex || 0
        }))
      });

      return newCollage;
    });

    // Fetch the complete collage with photos
    const completeCollage = await prisma.collage.findUnique({
      where: { id: collage.id },
      include: {
        photos: {
          include: {
            photo: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
                thumbnailUrl: true,
                width: true,
                height: true
              }
            }
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Collage created successfully',
      data: { collage: completeCollage }
    };

    res.status(201).json(response);
  });

  // Get user's collages
  static getUserCollages = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [collages, total] = await Promise.all([
      prisma.collage.findMany({
        where: { userId: req.user.id },
        include: {
          photos: {
            include: {
              photo: {
                select: {
                  id: true,
                  filename: true,
                  originalName: true,
                  url: true,
                  thumbnailUrl: true,
                  width: true,
                  height: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.collage.count({
        where: { userId: req.user.id }
      })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Collages retrieved successfully',
      data: {
        collages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };

    res.json(response);
  });

  // Get a specific collage
  static getCollage = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Collage ID is required', 400);
    }

    const collage = await prisma.collage.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        photos: {
          include: {
            photo: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
                thumbnailUrl: true,
                width: true,
                height: true,
                mimeType: true
              }
            }
          },
          orderBy: { zIndex: 'asc' }
        }
      }
    });

    if (!collage) {
      throw new AppError('Collage not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Collage retrieved successfully',
      data: { collage }
    };

    res.json(response);
  });

  // Update collage
  static updateCollage = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { title, template, layout, width, height, photos } = req.body;

    if (!id) {
      throw new AppError('Collage ID is required', 400);
    }

    // Check if collage exists and belongs to user
    const existingCollage = await prisma.collage.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingCollage) {
      throw new AppError('Collage not found', 404);
    }

    // Update collage in a transaction
    const updatedCollage = await prisma.$transaction(async (tx) => {
      // Update collage metadata
      const collage = await tx.collage.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(template && { template }),
          ...(layout && { layout: JSON.stringify(layout) }),
          ...(width && { width }),
          ...(height && { height }),
          updatedAt: new Date()
        }
      });

      // If photos are provided, update photo positions
      if (photos && photos.length > 0) {
        // Validate that all photos exist and belong to the user
        const photoIds = photos.map((p: CollagePhotoDto) => p.photoId);
        const existingPhotos = await tx.photo.findMany({
          where: {
            id: { in: photoIds },
            userId: req.user!.id
          }
        });

        if (existingPhotos.length !== photoIds.length) {
          throw new AppError('One or more photos not found or not owned by user', 404);
        }

        // Delete existing collage photos
        await tx.collagePhoto.deleteMany({
          where: { collageId: id }
        });

        // Create new collage photos
        await tx.collagePhoto.createMany({
          data: photos.map((photo: CollagePhotoDto) => ({
            collageId: id,
            photoId: photo.photoId,
            x: photo.x,
            y: photo.y,
            width: photo.width,
            height: photo.height,
            rotation: photo.rotation || 0,
            zIndex: photo.zIndex || 0
          }))
        });
      }

      return collage;
    });

    // Fetch the complete updated collage
    const completeCollage = await prisma.collage.findUnique({
      where: { id },
      include: {
        photos: {
          include: {
            photo: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
                thumbnailUrl: true,
                width: true,
                height: true
              }
            }
          },
          orderBy: { zIndex: 'asc' }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Collage updated successfully',
      data: { collage: completeCollage }
    };

    res.json(response);
  });

  // Delete collage
  static deleteCollage = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Collage ID is required', 400);
    }

    // Check if collage exists and belongs to user
    const existingCollage = await prisma.collage.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!existingCollage) {
      throw new AppError('Collage not found', 404);
    }

    // Delete collage (cascade will handle collage photos)
    await prisma.collage.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Collage deleted successfully'
    };

    res.json(response);
  });

  // Get collage templates
  static getTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // This could be moved to a separate service or loaded from a config file
    const templates = [
      {
        id: 'grid-2x2',
        name: '2x2 Grid',
        description: 'Simple 2x2 photo grid',
        maxPhotos: 4,
        aspectRatio: '1:1',
        thumbnail: '/templates/grid-2x2.svg'
      },
      {
        id: 'grid-3x3',
        name: '3x3 Grid',
        description: 'Classic 3x3 photo grid',
        maxPhotos: 9,
        aspectRatio: '1:1',
        thumbnail: '/templates/grid-3x3.svg'
      },
      {
        id: 'strip-horizontal',
        name: 'Horizontal Strip',
        description: 'Horizontal photo strip layout',
        maxPhotos: 4,
        aspectRatio: '4:1',
        thumbnail: '/templates/strip-horizontal.svg'
      },
      {
        id: 'strip-vertical',
        name: 'Vertical Strip',
        description: 'Vertical photo strip layout',
        maxPhotos: 4,
        aspectRatio: '1:4',
        thumbnail: '/templates/strip-vertical.svg'
      },
      {
        id: 'magazine',
        name: 'Magazine Layout',
        description: 'Dynamic magazine-style layout',
        maxPhotos: 6,
        aspectRatio: '3:4',
        thumbnail: '/templates/magazine.svg'
      },
      {
        id: 'freeform',
        name: 'Freeform',
        description: 'Drag and drop photos anywhere',
        maxPhotos: 20,
        aspectRatio: 'custom',
        thumbnail: '/templates/freeform.svg'
      }
    ];

    const response: ApiResponse = {
      success: true,
      message: 'Templates retrieved successfully',
      data: { templates }
    };

    res.json(response);
  });
}
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { CloudinaryResponse, ImageProcessingOptions, AppError, ErrorCodes } from '../types';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Only configure Cloudinary if all required environment variables are present
if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn('Cloudinary configuration incomplete. Some environment variables are missing.');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', ErrorCodes.VALIDATION_ERROR) as any, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Single file upload
  }
});

export class FileUploadService {
  /**
   * Process and optimize an uploaded image
   */
  static async processImage(
    filePath: string, 
    options: ImageProcessingOptions = {}
  ): Promise<{ processedPath: string; thumbnailPath?: string; metadata: any }> {
    const {
      width,
      height,
      quality = 80,
      format = 'jpeg',
      createThumbnail = true,
      thumbnailSize = 300
    } = options;

    const dir = path.dirname(filePath);
    const name = path.parse(filePath).name;
    const processedPath = path.join(dir, `${name}-processed.${format}`);
    
    // Process main image
    let sharpInstance = sharp(filePath);

    // Resize if dimensions provided
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert format and set quality
    if (format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality });
    } else if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    }

    await sharpInstance.toFile(processedPath);

    // Get metadata
    const metadata = await sharp(processedPath).metadata();

    let thumbnailPath: string | undefined;
    
    // Create thumbnail if requested
    if (createThumbnail) {
      thumbnailPath = path.join(dir, `${name}-thumb.${format}`);
      await sharp(filePath)
        .resize(thumbnailSize, thumbnailSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);
    }

    return {
      processedPath,
      ...(thumbnailPath && { thumbnailPath }),
      metadata
    };
  }

  /**
   * Upload image to Cloudinary
   */
  static async uploadToCloudinary(
    filePath: string, 
    folder: string = 'clicktales'
  ): Promise<CloudinaryResponse> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return result as CloudinaryResponse;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new AppError('Failed to upload image to cloud storage', ErrorCodes.INTERNAL_SERVER);
    }
  }

  /**
   * Upload thumbnail to Cloudinary
   */
  static async uploadThumbnailToCloudinary(
    filePath: string, 
    publicId: string
  ): Promise<CloudinaryResponse> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: `${publicId}_thumb`,
        resource_type: 'image',
        transformation: [
          { width: 300, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return result as CloudinaryResponse;
    } catch (error) {
      console.error('Cloudinary thumbnail upload error:', error);
      throw new AppError('Failed to upload thumbnail to cloud storage', ErrorCodes.INTERNAL_SERVER);
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      // Also delete thumbnail if it exists
      await cloudinary.uploader.destroy(`${publicId}_thumb`);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Clean up local files
   */
  static async cleanupLocalFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Failed to delete local file: ${filePath}`, error);
      }
    }
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    return `${name}-${timestamp}-${random}${ext}`;
  }
}
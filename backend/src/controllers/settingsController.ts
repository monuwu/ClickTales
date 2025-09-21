import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, CreateSystemSettingDto, UpdateSystemSettingDto, ApiResponse, AppError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class SettingsController {
  // Get all system settings
  static getSystemSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can view system settings
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    const settings = await prisma.systemSettings.findMany({
      orderBy: { key: 'asc' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'System settings retrieved successfully',
      data: { settings }
    };

    res.json(response);
  });

  // Get a specific system setting by key
  static getSystemSetting = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can view system settings
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    const { key } = req.params;

    if (!key) {
      throw new AppError('Setting key is required', 400);
    }

    const setting = await prisma.systemSettings.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new AppError('Setting not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'System setting retrieved successfully',
      data: { setting }
    };

    res.json(response);
  });

  // Create a new system setting
  static createSystemSetting = asyncHandler(async (req: AuthenticatedRequest<CreateSystemSettingDto>, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can create system settings
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    const { key, value, description, type = 'STRING' } = req.body;

    if (!key || !value) {
      throw new AppError('Key and value are required', 400);
    }

    // Validate key format (alphanumeric, dots, underscores, hyphens)
    if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
      throw new AppError('Invalid key format. Use alphanumeric characters, dots, underscores, and hyphens only.', 400);
    }

    // Check if key already exists
    const existingSetting = await prisma.systemSettings.findUnique({
      where: { key }
    });

    if (existingSetting) {
      throw new AppError('Setting key already exists', 409);
    }

    // Validate value based on type
    if (!SettingsController.validateValue(value, type)) {
      throw new AppError(`Invalid value for type ${type}`, 400);
    }

    const setting = await prisma.systemSettings.create({
      data: {
        key,
        value,
        description: description || null,
        type: type as any
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'System setting created successfully',
      data: { setting }
    };

    res.status(201).json(response);
  });

  // Update a system setting
  static updateSystemSetting = asyncHandler(async (req: AuthenticatedRequest<UpdateSystemSettingDto>, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can update system settings
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    const { key } = req.params;
    const { value, description, type } = req.body;

    if (!key) {
      throw new AppError('Setting key is required', 400);
    }

    // Check if setting exists
    const existingSetting = await prisma.systemSettings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      throw new AppError('Setting not found', 404);
    }

    // Validate value based on type (use existing type if not provided)
    const settingType = type || existingSetting.type;
    if (value && !SettingsController.validateValue(value, settingType)) {
      throw new AppError(`Invalid value for type ${settingType}`, 400);
    }

    const setting = await prisma.systemSettings.update({
      where: { key },
      data: {
        ...(value && { value }),
        ...(description !== undefined && { description: description || null }),
        ...(type && { type: type as any }),
        updatedAt: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'System setting updated successfully',
      data: { setting }
    };

    res.json(response);
  });

  // Delete a system setting
  static deleteSystemSetting = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can delete system settings
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    const { key } = req.params;

    if (!key) {
      throw new AppError('Setting key is required', 400);
    }

    // Check if setting exists
    const existingSetting = await prisma.systemSettings.findUnique({
      where: { key }
    });

    if (!existingSetting) {
      throw new AppError('Setting not found', 404);
    }

    await prisma.systemSettings.delete({
      where: { key }
    });

    const response: ApiResponse = {
      success: true,
      message: 'System setting deleted successfully'
    };

    res.json(response);
  });

  // Get public settings (for frontend configuration)
  static getPublicSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // Public settings that can be accessed without authentication
    const publicKeys = [
      'app.name',
      'app.version', 
      'app.description',
      'features.enableRegistration',
      'features.enableGuestMode',
      'features.enableCollages',
      'features.enableAlbums',
      'camera.defaultResolution',
      'camera.defaultQuality',
      'photobooth.maxPhotosPerSession',
      'photobooth.sessionTimeout',
      'ui.theme',
      'ui.primaryColor',
      'ui.secondaryColor'
    ];

    const settings = await prisma.systemSettings.findMany({
      where: {
        key: { in: publicKeys }
      }
    });

    // Convert to key-value object for easier frontend consumption
    const settingsMap = settings.reduce((acc, setting) => {
      let parsedValue: any = setting.value;
      
      // Parse values based on type
      try {
        switch (setting.type) {
          case 'BOOLEAN':
            parsedValue = setting.value.toLowerCase() === 'true';
            break;
          case 'NUMBER':
            parsedValue = parseFloat(setting.value);
            break;
          case 'JSON':
            parsedValue = JSON.parse(setting.value);
            break;
          case 'STRING':
          default:
            parsedValue = setting.value;
            break;
        }
      } catch (error) {
        // If parsing fails, use original string value
        parsedValue = setting.value;
      }

      acc[setting.key] = parsedValue;
      return acc;
    }, {} as Record<string, any>);

    const response: ApiResponse = {
      success: true,
      message: 'Public settings retrieved successfully',
      data: { settings: settingsMap }
    };

    res.json(response);
  });

  // Initialize default system settings
  static initializeDefaultSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    // Only admins can initialize settings
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin role required.', 403);
    }

    const defaultSettings = [
      // Application settings
      { key: 'app.name', value: 'ClickTales', description: 'Application name', type: 'STRING' },
      { key: 'app.version', value: '1.0.0', description: 'Application version', type: 'STRING' },
      { key: 'app.description', value: 'Interactive Photo Booth Application', description: 'Application description', type: 'STRING' },
      
      // Feature toggles
      { key: 'features.enableRegistration', value: 'true', description: 'Allow new user registration', type: 'BOOLEAN' },
      { key: 'features.enableGuestMode', value: 'false', description: 'Allow guest access without login', type: 'BOOLEAN' },
      { key: 'features.enableCollages', value: 'true', description: 'Enable collage creation features', type: 'BOOLEAN' },
      { key: 'features.enableAlbums', value: 'true', description: 'Enable album organization features', type: 'BOOLEAN' },
      
      // Camera settings
      { key: 'camera.defaultResolution', value: '1920x1080', description: 'Default camera resolution', type: 'STRING' },
      { key: 'camera.defaultQuality', value: '0.9', description: 'Default image quality (0.1-1.0)', type: 'NUMBER' },
      { key: 'camera.enableFlash', value: 'true', description: 'Enable camera flash', type: 'BOOLEAN' },
      
      // Photobooth settings
      { key: 'photobooth.maxPhotosPerSession', value: '50', description: 'Maximum photos per session', type: 'NUMBER' },
      { key: 'photobooth.sessionTimeout', value: '3600', description: 'Session timeout in seconds', type: 'NUMBER' },
      { key: 'photobooth.countdownDuration', value: '3', description: 'Countdown duration in seconds', type: 'NUMBER' },
      
      // File upload settings
      { key: 'upload.maxFileSize', value: '10485760', description: 'Maximum file size in bytes (10MB)', type: 'NUMBER' },
      { key: 'upload.allowedTypes', value: '["image/jpeg","image/png","image/webp"]', description: 'Allowed file MIME types', type: 'JSON' },
      
      // UI settings
      { key: 'ui.theme', value: 'light', description: 'Default UI theme', type: 'STRING' },
      { key: 'ui.primaryColor', value: '#3b82f6', description: 'Primary theme color', type: 'STRING' },
      { key: 'ui.secondaryColor', value: '#64748b', description: 'Secondary theme color', type: 'STRING' }
    ];

    const createdSettings = [];
    const skippedSettings = [];

    for (const settingData of defaultSettings) {
      try {
        // Check if setting already exists
        const existingSetting = await prisma.systemSettings.findUnique({
          where: { key: settingData.key }
        });

        if (existingSetting) {
          skippedSettings.push(settingData.key);
          continue;
        }

        const setting = await prisma.systemSettings.create({
          data: {
            key: settingData.key,
            value: settingData.value,
            description: settingData.description,
            type: settingData.type as any
          }
        });

        createdSettings.push(setting);
      } catch (error) {
        console.error(`Failed to create setting ${settingData.key}:`, error);
      }
    }

    const response: ApiResponse = {
      success: true,
      message: `Initialized ${createdSettings.length} default settings`,
      data: {
        created: createdSettings,
        skipped: skippedSettings,
        summary: {
          created: createdSettings.length,
          skipped: skippedSettings.length,
          total: defaultSettings.length
        }
      }
    };

    res.json(response);
  });

  // Helper method to validate setting values based on type
  private static validateValue(value: string, type: string): boolean {
    try {
      switch (type) {
        case 'BOOLEAN':
          return ['true', 'false'].includes(value.toLowerCase());
        case 'NUMBER':
          return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
        case 'JSON':
          JSON.parse(value);
          return true;
        case 'STRING':
        default:
          return typeof value === 'string' && value.length > 0;
      }
    } catch (error) {
      return false;
    }
  }
}
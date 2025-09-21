import express from 'express';
import { SettingsController } from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public route for getting public settings (no authentication required)
router.get('/public', SettingsController.getPublicSettings);

// All other routes require authentication
router.use(authenticate);

// Admin-only routes for managing system settings
router.get('/', SettingsController.getSystemSettings);
router.get('/:key', SettingsController.getSystemSetting);
router.post('/', SettingsController.createSystemSetting);
router.put('/:key', SettingsController.updateSystemSetting);
router.delete('/:key', SettingsController.deleteSystemSetting);

// Initialize default settings (admin only)
router.post('/initialize', SettingsController.initializeDefaultSettings);

export default router;
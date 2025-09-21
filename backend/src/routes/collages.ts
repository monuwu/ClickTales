import express from 'express';
import { CollageController } from '../controllers/collageController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/collages/templates - Get available collage templates
router.get('/templates', CollageController.getTemplates);

// GET /api/collages - Get user's collages with pagination
router.get('/', CollageController.getUserCollages);

// POST /api/collages - Create a new collage
router.post('/', CollageController.createCollage);

// GET /api/collages/:id - Get a specific collage
router.get('/:id', CollageController.getCollage);

// PUT /api/collages/:id - Update a collage
router.put('/:id', CollageController.updateCollage);

// DELETE /api/collages/:id - Delete a collage
router.delete('/:id', CollageController.deleteCollage);

export default router;
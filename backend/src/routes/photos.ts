import { Router } from 'express';
import multer from 'multer';
import { PhotoController } from '../controllers/photoController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// Public routes (with optional authentication)
router.get('/', optionalAuth, PhotoController.getPhotos);
router.get('/:id', optionalAuth, PhotoController.getPhotoById);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/user/me', PhotoController.getUserPhotos);
router.put('/:id', PhotoController.updatePhoto);
router.delete('/:id', PhotoController.deletePhoto);

// Upload route will be implemented with file upload middleware
// router.post('/', upload.single('photo'), PhotoController.uploadPhoto);

export default router;
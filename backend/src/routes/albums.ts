import { Router } from 'express';
import { AlbumController } from '../controllers/albumController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All album routes require authentication
router.use(authenticate);

// Album CRUD routes
router.get('/', AlbumController.getAlbums);
router.get('/:id', AlbumController.getAlbumById);
router.post('/', AlbumController.validateCreateAlbum, AlbumController.createAlbum);
router.put('/:id', AlbumController.validateUpdateAlbum, AlbumController.updateAlbum);
router.delete('/:id', AlbumController.deleteAlbum);

// Photo management in albums
router.post('/:id/photos', AlbumController.validateAddPhotos, AlbumController.addPhotosToAlbum);
router.delete('/:id/photos', AlbumController.removePhotosFromAlbum);
router.put('/:id/photos/reorder', AlbumController.reorderPhotos);

export default router;
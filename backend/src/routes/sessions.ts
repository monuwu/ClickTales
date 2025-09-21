import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { authenticate } from '../middleware/auth';
import { body, param, query } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const startSessionValidation = [
  body('sessionName').optional().isString().isLength({ min: 1, max: 100 }).trim(),
  body('eventName').optional().isString().isLength({ min: 1, max: 100 }).trim(),
  body('location').optional().isString().isLength({ min: 1, max: 200 }).trim(),
  body('settings').optional().isObject(),
];

const sessionIdValidation = [
  param('sessionId').isString().isLength({ min: 1 }),
];

const updateSessionValidation = [
  param('sessionId').isString().isLength({ min: 1 }),
  body('sessionName').optional().isString().isLength({ min: 1, max: 100 }).trim(),
  body('eventName').optional().isString().isLength({ min: 1, max: 100 }).trim(),
  body('location').optional().isString().isLength({ min: 1, max: 200 }).trim(),
  body('settings').optional().isObject(),
];

const getSessionsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('status').optional().isIn(['ACTIVE', 'ENDED']),
];

// Routes

/**
 * @route POST /api/sessions
 * @desc Start a new photobooth session
 * @access Private
 */
router.post('/', startSessionValidation, SessionController.startSession);

/**
 * @route PUT /api/sessions/:sessionId/end
 * @desc End a photobooth session
 * @access Private
 */
router.put('/:sessionId/end', sessionIdValidation, SessionController.endSession);

/**
 * @route GET /api/sessions
 * @desc Get user's sessions with pagination and filtering
 * @access Private
 */
router.get('/', getSessionsValidation, SessionController.getSessions);

/**
 * @route GET /api/sessions/stats
 * @desc Get session statistics for the user
 * @access Private
 */
router.get('/stats', SessionController.getSessionStats);

// TODO: Implement these methods in SessionController
// /**
//  * @route GET /api/sessions/:sessionId
//  * @desc Get session details by ID
//  * @access Private
//  */
// router.get('/:sessionId', sessionIdValidation, SessionController.getSessionById);

// /**
//  * @route PUT /api/sessions/:sessionId
//  * @desc Update session details
//  * @access Private
//  */
// router.put('/:sessionId', updateSessionValidation, SessionController.updateSession);

// /**
//  * @route DELETE /api/sessions/:sessionId
//  * @desc Delete a session
//  * @access Private
//  */
// router.delete('/:sessionId', sessionIdValidation, SessionController.deleteSession);

export default router;
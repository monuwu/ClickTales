import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', AuthController.validateRegister, AuthController.register);
router.post('/login', AuthController.validateLogin, AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Signup OTP routes
router.post('/request-signup-otp', AuthController.validateSignupRequest, AuthController.requestSignupOtp);
router.post('/verify-signup-otp', AuthController.validateVerifySignupOtp, AuthController.verifySignupOtp);

// OTP routes
router.post('/request-otp', AuthController.requestOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/login-with-otp', AuthController.loginWithOtp);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.post('/change-password', AuthController.changePassword);
router.post('/logout', AuthController.logout);

// 2FA management routes
router.post('/enable-2fa', AuthController.enable2FA);
router.post('/disable-2fa', AuthController.disable2FA);
router.get('/2fa-status', AuthController.get2FAStatus);

export default router;
import { Router } from 'express';
import { login, register, refreshToken, logout, getProfile } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { loginSchema, registerSchema, refreshTokenSchema } from '../validators/auth';

const router = Router();

// Public routes
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getProfile);

export default router;

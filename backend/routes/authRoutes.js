import express from 'express';
import { register, verifyEmail, login, me } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Email/password authentication routes
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, me);

export default router;

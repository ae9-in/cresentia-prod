import express from 'express';
import { register, verifyEmail, login, me, googleCallback } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import passport from '../config/passport.js';

const router = express.Router();

// Traditional email/password routes
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, me);

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    console.log('🚀 Initiating Google OAuth flow');
    console.log(`   Redirect URI will be: http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`);
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('📥 Google callback route hit');
    console.log(`   Query params: ${JSON.stringify(req.query)}`);
    
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`
    }, (err, user, info) => {
      if (err) {
        console.error('❌ Passport authentication error:', err.message);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_error`);
      }
      
      if (!user) {
        console.error('❌ No user returned from passport');
        console.error('   Info:', info);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }
      
      console.log('✅ User authenticated successfully');
      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

export default router;

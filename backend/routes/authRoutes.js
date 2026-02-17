const express = require('express');
const { register, verifyEmail, login, me, googleCallback } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const passport = require('../config/passport');

const router = express.Router();

// Traditional email/password routes
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, me);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`
    })(req, res, next);
  },
  googleCallback
);

module.exports = router;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract email from profile
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists with Google ID, return user
            return done(null, user);
          }

          // Check if user exists with this email (from email/password registration)
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isVerified = true; // Google accounts are pre-verified
            await user.save();
            return done(null, user);
          }

          // Create new user
          const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          user = await User.create({
            name: profile.displayName || 'Google User',
            email: email.toLowerCase(),
            googleId: profile.id,
            role: 'student',
            isVerified: true,
            password: randomPassword // Random password (won't be used for Google login)
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google login will not work.');
  console.warn('   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file');
}

// Serialize user for the session (not used in stateless JWT, but required by Passport)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session (not used in stateless JWT, but required by Passport)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

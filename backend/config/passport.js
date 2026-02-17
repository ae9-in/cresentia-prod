import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Only configure Google Strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Configuring Google OAuth Strategy');
  
  // Determine callback URL based on environment
  const baseURL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT || 5000}`;
  
  const callbackURL = `${baseURL}/api/auth/google/callback`;
  console.log(`   Callback URL: ${callbackURL}`);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔐 Google OAuth callback triggered');
          console.log(`   Profile ID: ${profile.id}`);
          console.log(`   Display Name: ${profile.displayName}`);
          
          // Extract email from profile
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          
          if (!email) {
            console.error('❌ No email found in Google profile');
            return done(new Error('No email found in Google profile'), null);
          }

          console.log(`   Email: ${email}`);

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ User found with Google ID, logging in');
            return done(null, user);
          }

          // Check if user exists with this email (from email/password registration)
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            console.log('✅ User found with email, linking Google account');
            // Link Google account to existing user
            user.googleId = profile.id;
            user.isVerified = true; // Google accounts are pre-verified
            await user.save();
            return done(null, user);
          }

          // Create new user
          console.log('✅ Creating new user from Google profile');
          const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          user = await User.create({
            name: profile.displayName || 'Google User',
            email: email.toLowerCase(),
            googleId: profile.id,
            role: 'student',
            isVerified: true,
            password: randomPassword // Random password (won't be used for Google login)
          });

          console.log(`✅ New user created: ${user._id}`);
          return done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth error:', error.message);
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

export default passport;

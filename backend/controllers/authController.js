import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';
import asyncHandler from '../utils/asyncHandler.js';
// import { createVerificationToken } from '../utils/tokenUtils.js';
// import { sendVerificationEmail } from '../utils/emailUtils.js';

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  const verificationToken = undefined;
  const allowedPublicRoles = ['student', 'instructor'];
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role && allowedPublicRoles.includes(role) ? role : 'student',
    isVerified: true,
    verificationToken,
    verificationTokenExpires: undefined
  });

  const response = {
    message: 'Registration successful. You can log in now.',
    userId: user._id,
    isVerified: user.isVerified
  };

  res.status(201).json(response);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    }
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// Google OAuth callback handler
const googleCallback = asyncHandler(async (req, res) => {
  console.log('📍 Google callback controller reached');
  console.log(`   req.user exists: ${!!req.user}`);
  
  // User is authenticated by Passport and attached to req.user
  if (!req.user) {
    console.error('❌ No user found in req.user after authentication');
    return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }

  console.log(`   User ID: ${req.user._id}`);
  console.log(`   User Email: ${req.user.email}`);

  // Generate JWT token
  const token = generateToken(req.user._id);
  console.log('✅ JWT token generated');

  // Redirect to frontend with token
  const redirectUrl = `${process.env.CLIENT_URL}/auth/google/success?token=${token}`;
  console.log(`   Redirecting to: ${redirectUrl}`);
  res.redirect(redirectUrl);
});

export { register, verifyEmail, login, me, googleCallback };

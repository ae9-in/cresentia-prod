const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { createVerificationToken } = require('../utils/tokenUtils');
const { sendVerificationEmail } = require('../utils/emailUtils');

const register = async (req, res) => {
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
};

const verifyEmail = async (req, res) => {
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
};

const login = async (req, res) => {
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
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, verifyEmail, login, me };

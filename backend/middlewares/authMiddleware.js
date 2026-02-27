import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 * Session handling: No refresh tokens - user must login again after tab close
 */

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized. Please login again.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user with populated assigned courses
    req.user = await User.findById(decoded.userId)
      .select('-password')
      .populate({
        path: 'assignedCourses',
        select: 'title description category level videos quizQuestions modules isPublished createdBy'
      });
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized. User not found.');
    }

    // Check if user is active
    if (!req.user.isActive) {
      res.status(403);
      throw new Error('Account is deactivated. Contact administrator.');
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Session expired. Please login again.');
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Invalid token. Please login again.');
    }
    res.status(401);
    throw new Error('Not authorized. Please login again.');
  }
});

// Legacy function - kept for backward compatibility
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Access denied. Required role: ${roles.join(' or ')}`));
    }
    next();
  };
};

// Legacy function - kept for backward compatibility
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    return next(new Error('Access denied. Admin privileges required.'));
  }
  next();
};

export { protect, authorizeRoles, isAdmin };

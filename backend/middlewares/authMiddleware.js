import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized. Missing token');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // CRITICAL: Populate assignedCourses to get full course data including videos and assessments
    req.user = await User.findById(decoded.userId)
      .select('-password')
      .populate({
        path: 'assignedCourses',
        select: 'title description category level videos quizQuestions modules isPublished'
      });
    
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized. User not found');
    }
    next();
  } catch (error) {
    if (res.statusCode === 200) res.status(401);
    next(new Error('Not authorized. Invalid token'));
  }
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden. Insufficient role'));
    }
    next();
  };
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    return next(new Error('Forbidden. Admin access required'));
  }
  next();
};

export { protect, authorizeRoles, isAdmin };

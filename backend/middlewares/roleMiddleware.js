import asyncHandler from '../utils/asyncHandler.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

/**
 * Role-based Access Control Middleware
 * Implements strict 3-role system: admin, instructor, user
 */

// Check if user is admin (super admin - only one allowed)
export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied. Admin privileges required.');
  }
  next();
});

// Check if user is instructor
export const isInstructor = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'instructor') {
    res.status(403);
    throw new Error('Access denied. Instructor privileges required.');
  }
  next();
});

// Check if user is admin OR instructor
export const isAdminOrInstructor = asyncHandler(async (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'instructor')) {
    res.status(403);
    throw new Error('Access denied. Admin or Instructor privileges required.');
  }
  next();
});

// Check if user is a regular user (student)
export const isUser = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    res.status(403);
    throw new Error('Access denied. User privileges required.');
  }
  next();
});

// Check ownership for instructors (can only edit their own content)
export const checkCourseOwnership = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id || req.params.courseId;
  
  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  const course = await Course.findById(courseId);
  
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Admin can access any course
  if (req.user.role === 'admin') {
    req.course = course;
    return next();
  }

  // Instructor can only access their own courses
  if (req.user.role === 'instructor') {
    if (course.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied. You can only modify courses you created.');
    }
    req.course = course;
    return next();
  }

  // Users cannot modify courses
  res.status(403);
  throw new Error('Access denied. Insufficient permissions.');
});

// Prevent instructors from deleting (only admin can delete)
export const preventInstructorDelete = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'instructor') {
    res.status(403);
    throw new Error('Access denied. Instructors cannot delete content. Contact admin.');
  }
  next();
});

// Prevent creation of multiple admins
export const preventMultipleAdmins = asyncHandler(async (req, res, next) => {
  if (req.body.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      res.status(403);
      throw new Error('Access denied. Only one admin account is allowed in the system.');
    }
  }
  next();
});

// Ensure only admin can create instructors
export const onlyAdminCanCreateInstructor = asyncHandler(async (req, res, next) => {
  if (req.body.role === 'instructor') {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied. Only admin can create instructor accounts.');
    }
  }
  next();
});

// Check if user can assign courses (only admin)
export const canAssignCourses = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied. Only admin can assign courses to users.');
  }
  next();
});

// Check if user can manage users (only admin)
export const canManageUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied. Only admin can manage users.');
  }
  next();
});

// Verify instructor can only see their assigned students
export const filterStudentsByInstructor = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'instructor') {
    // Instructors can only see students assigned to their courses
    const instructorCourses = await Course.find({ createdBy: req.user._id }).select('studentsAssigned');
    const studentIds = [...new Set(instructorCourses.flatMap(course => course.studentsAssigned))];
    req.allowedStudentIds = studentIds;
  }
  next();
});

// Prevent regular users from accessing admin/instructor routes
export const blockUserAccess = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') {
    res.status(403);
    throw new Error('Access denied. This action is not allowed for regular users.');
  }
  next();
});

// Role-based route access
export const requireRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    next();
  });
};

// Comprehensive permission check for course operations
export const checkCoursePermission = (operation) => {
  return asyncHandler(async (req, res, next) => {
    const courseId = req.params.id || req.params.courseId;
    
    if (!courseId) {
      res.status(400);
      throw new Error('Course ID is required');
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const { role, _id } = req.user;

    switch (operation) {
      case 'create':
        // Admin and instructors can create
        if (role !== 'admin' && role !== 'instructor') {
          res.status(403);
          throw new Error('Only admin and instructors can create courses');
        }
        break;

      case 'read':
        // Admin can read all, instructors can read their own, users can read assigned
        if (role === 'admin') {
          // Admin can read all
        } else if (role === 'instructor') {
          if (course.createdBy.toString() !== _id.toString()) {
            res.status(403);
            throw new Error('You can only view courses you created');
          }
        } else if (role === 'user') {
          // Users can only read assigned courses (handled in controller)
        }
        break;

      case 'update':
        // Admin can update all, instructors can update their own only
        if (role === 'admin') {
          // Admin can update all
        } else if (role === 'instructor') {
          if (course.createdBy.toString() !== _id.toString()) {
            res.status(403);
            throw new Error('You can only update courses you created');
          }
        } else {
          res.status(403);
          throw new Error('Users cannot update courses');
        }
        break;

      case 'delete':
        // Only admin can delete
        if (role !== 'admin') {
          res.status(403);
          throw new Error('Only admin can delete courses');
        }
        break;

      default:
        res.status(400);
        throw new Error('Invalid operation');
    }

    req.course = course;
    next();
  });
};

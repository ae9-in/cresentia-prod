import express from 'express';
import {
    getAdminStats,
    listUsers,
    getAllQuizQuestions,
    deleteCourse,
    updateCourseAsAdmin,
    createCourseAsAdmin,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    assignCourse,
    removeCourseAccess,
    resetUserProgress,
    getUserProgress,
    toggleCoursePublish
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin'), getAdminStats);
router.get('/users', protect, authorizeRoles('admin'), listUsers);
router.get('/quiz-questions', protect, authorizeRoles('admin'), getAllQuizQuestions);

// Course management endpoints for admins
router.post('/courses', protect, authorizeRoles('admin'), createCourseAsAdmin);
router.put('/courses/:id', protect, authorizeRoles('admin'), updateCourseAsAdmin);
router.delete('/courses/:id', protect, authorizeRoles('admin'), deleteCourse);
router.patch('/courses/:courseId/toggle-publish', protect, authorizeRoles('admin'), toggleCoursePublish);

// User management endpoints
router.post('/users', protect, authorizeRoles('admin'), createUser);
router.put('/users/:userId', protect, authorizeRoles('admin'), updateUser);
router.delete('/users/:userId', protect, authorizeRoles('admin'), deleteUser);
router.patch('/users/:userId/toggle-status', protect, authorizeRoles('admin'), toggleUserStatus);

// Course assignment endpoints
router.post('/users/:userId/assign-course', protect, authorizeRoles('admin'), assignCourse);
router.post('/users/:userId/remove-course', protect, authorizeRoles('admin'), removeCourseAccess);

// Progress management
router.post('/users/:userId/reset-progress', protect, authorizeRoles('admin'), resetUserProgress);
router.get('/users/:userId/progress', protect, authorizeRoles('admin'), getUserProgress);

export default router;

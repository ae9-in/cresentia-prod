import express from 'express';
import {
    adminStats,
    listUsers,
    getAllQuizQuestions,
    deleteCourse,
    updateCourseAsAdmin,
    createCourseAsAdmin
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin'), adminStats);
router.get('/users', protect, authorizeRoles('admin'), listUsers);
router.get('/quiz-questions', protect, authorizeRoles('admin'), getAllQuizQuestions);

// Course management endpoints for admins
router.post('/courses', protect, authorizeRoles('admin'), createCourseAsAdmin);
router.put('/courses/:id', protect, authorizeRoles('admin'), updateCourseAsAdmin);
router.delete('/courses/:id', protect, authorizeRoles('admin'), deleteCourse);

export default router;

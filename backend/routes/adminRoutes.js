const express = require('express');
const {
    adminStats,
    listUsers,
    getAllQuizQuestions,
    deleteCourse,
    updateCourseAsAdmin,
    createCourseAsAdmin
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorizeRoles('admin'), adminStats);
router.get('/users', protect, authorizeRoles('admin'), listUsers);
router.get('/quiz-questions', protect, authorizeRoles('admin'), getAllQuizQuestions);

// Course management endpoints for admins
router.post('/courses', protect, authorizeRoles('admin'), createCourseAsAdmin);
router.put('/courses/:id', protect, authorizeRoles('admin'), updateCourseAsAdmin);
router.delete('/courses/:id', protect, authorizeRoles('admin'), deleteCourse);

module.exports = router;

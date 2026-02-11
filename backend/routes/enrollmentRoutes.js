const express = require('express');
const {
  enrollCourse,
  getMyEnrollments,
  updateVideoProgress,
  submitQuiz,
  downloadCertificate
} = require('../controllers/enrollmentController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, authorizeRoles('student', 'admin', 'instructor'), getMyEnrollments);
router.post('/:courseId', protect, authorizeRoles('student', 'admin', 'instructor'), enrollCourse);
router.patch('/:courseId/video-progress', protect, authorizeRoles('student', 'admin', 'instructor'), updateVideoProgress);
router.post('/:courseId/quiz', protect, authorizeRoles('student', 'admin', 'instructor'), submitQuiz);
router.get('/:courseId/certificate', protect, authorizeRoles('student', 'admin', 'instructor'), downloadCertificate);

module.exports = router;

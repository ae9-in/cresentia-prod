import express from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  updateVideoProgress,
  submitQuiz,
  downloadCertificate
} from '../controllers/enrollmentController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('student', 'admin', 'instructor'), getMyEnrollments);
router.post('/:courseId', protect, authorizeRoles('student', 'admin', 'instructor'), enrollCourse);
router.patch('/:courseId/video-progress', protect, authorizeRoles('student', 'admin', 'instructor'), updateVideoProgress);
router.post('/:courseId/quiz', protect, authorizeRoles('student', 'admin', 'instructor'), submitQuiz);
router.get('/:courseId/certificate', protect, authorizeRoles('student', 'admin', 'instructor'), downloadCertificate);

export default router;

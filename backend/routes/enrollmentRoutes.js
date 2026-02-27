import express from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  updateVideoProgress,
  updateModuleProgress,
  submitQuiz,
  downloadCertificate
} from '../controllers/enrollmentController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('user', 'student', 'admin'), getMyEnrollments);
router.post('/:courseId', protect, authorizeRoles('user', 'student', 'admin'), enrollCourse);
router.patch('/:courseId/video-progress', protect, authorizeRoles('user', 'student', 'admin'), updateVideoProgress);
router.patch('/:courseId/module-progress', protect, authorizeRoles('user', 'student', 'admin'), updateModuleProgress);
router.post('/:courseId/quiz', protect, authorizeRoles('user', 'student', 'admin'), submitQuiz);
router.get('/:courseId/certificate', protect, authorizeRoles('user', 'student', 'admin'), downloadCertificate);

export default router;

import express from 'express';
import {
  listCourses,
  getCourseById,
  searchCourses,
  createCourse,
  updateCourse,
  addReview,
  categories
} from '../controllers/courseController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, listCourses);
router.get('/search', protect, searchCourses);
router.get('/categories', categories);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorizeRoles('admin'), createCourse);
router.put('/:id', protect, authorizeRoles('admin'), updateCourse);
router.post('/:id/reviews', protect, authorizeRoles('user', 'student', 'admin'), addReview);

export default router;

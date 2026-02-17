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

router.get('/', listCourses);
router.get('/search', searchCourses);
router.get('/categories', categories);
router.get('/:id', getCourseById);
router.post('/', protect, authorizeRoles('admin', 'instructor'), createCourse);
router.put('/:id', protect, authorizeRoles('admin', 'instructor'), updateCourse);
router.post('/:id/reviews', protect, authorizeRoles('student', 'admin', 'instructor'), addReview);

export default router;

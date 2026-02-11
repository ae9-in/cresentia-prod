const express = require('express');
const {
  listCourses,
  getCourseById,
  searchCourses,
  createCourse,
  updateCourse,
  addReview,
  categories
} = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', listCourses);
router.get('/search', searchCourses);
router.get('/categories', categories);
router.get('/:id', getCourseById);
router.post('/', protect, authorizeRoles('admin', 'instructor'), createCourse);
router.put('/:id', protect, authorizeRoles('admin', 'instructor'), updateCourse);
router.post('/:id/reviews', protect, authorizeRoles('student', 'admin', 'instructor'), addReview);

module.exports = router;

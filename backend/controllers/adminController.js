import User from '../models/User.js';
import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

const adminStats = asyncHandler(async (req, res) => {
  const [users, courses] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments()
  ]);

  const byRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  res.json({ users, courses, byRole });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

const getAllQuizQuestions = asyncHandler(async (req, res) => {
  // Get all courses with their quiz questions including correct answers
  const courses = await Course.find().select('title category level quizQuestions');

  // Transform the data to show all questions for each course
  const result = courses.map(course => ({
    _id: course._id,
    title: course.title,
    category: course.category,
    level: course.level,
    quizQuestions: course.quizQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }))
  }));

  res.json(result);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Course deleted successfully' });
});

const updateCourseAsAdmin = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const updates = req.body;
  Object.assign(course, updates);

  if (Array.isArray(course.videos)) {
    course.durationMinutes = course.videos.reduce((sum, video) => sum + Number(video.durationMinutes || 30), 0);
  }

  await course.save();
  res.json(course);
});

const createCourseAsAdmin = asyncHandler(async (req, res) => {
  const { category, level, title, description, videos, quizQuestions } = req.body;

  if (!category || !title || !description) {
    res.status(400);
    throw new Error('category, title, and description are required');
  }

  const durationMinutes = Array.isArray(videos)
    ? videos.reduce((sum, video) => sum + Number(video.durationMinutes || 30), 0)
    : 0;

  const course = await Course.create({
    category,
    level,
    title,
    description,
    videos: videos || [],
    quizQuestions: quizQuestions || [],
    durationMinutes,
    createdBy: req.user._id
  });

  res.status(201).json(course);
});

export {
  adminStats,
  listUsers,
  getAllQuizQuestions,
  deleteCourse,
  updateCourseAsAdmin,
  createCourseAsAdmin
};

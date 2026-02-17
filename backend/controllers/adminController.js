const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');

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

module.exports = { adminStats, listUsers, getAllQuizQuestions };

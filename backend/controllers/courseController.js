const Course = require('../models/Course');

const buildRatings = (course) => {
  const total = course.reviews.reduce((sum, review) => sum + review.rating, 0);
  course.ratingAverage = course.reviews.length ? Number((total / course.reviews.length).toFixed(1)) : 0;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listCourses = async (req, res) => {
  const { category, level, q } = req.query;
  const query = {};

  if (category) query.category = category;
  if (level) query.level = level;
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  const courses = await Course.find(query)
    .populate('createdBy', 'name role')
    .select('-quizQuestions.correctAnswer');

  res.json(courses);
};

const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'name role')
    .populate('reviews.user', 'name');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const maskedCourse = course.toObject();
  maskedCourse.quizQuestions = course.quizQuestions.map((q) => ({
    question: q.question,
    options: q.options
  }));

  res.json(maskedCourse);
};

const searchCourses = async (req, res) => {
  const { q = '', category, level } = req.query;
  const safeQ = escapeRegex(q);
  const query = {};

  if (safeQ) {
    query.$or = [
      { title: { $regex: safeQ, $options: 'i' } },
      { description: { $regex: safeQ, $options: 'i' } }
    ];
  }
  if (category) query.category = category;
  if (level) query.level = level;

  const courses = await Course.find(query).select('title category level ratingAverage');
  const autocomplete = safeQ
    ? await Course.find({ title: { $regex: `^${safeQ}`, $options: 'i' } })
        .select('title')
        .limit(8)
    : [];

  res.json({
    courses,
    autocomplete: autocomplete.map((item) => item.title)
  });
};

const createCourse = async (req, res) => {
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
};

const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isAdmin = req.user.role === 'admin';
  const isOwner = String(course.createdBy) === String(req.user._id);
  if (!isAdmin && !isOwner) {
    res.status(403);
    throw new Error('You are not allowed to edit this course');
  }

  const updates = req.body;
  Object.assign(course, updates);
  if (Array.isArray(course.videos)) {
    course.durationMinutes = course.videos.reduce((sum, video) => sum + Number(video.durationMinutes || 30), 0);
  }

  await course.save();
  res.json(course);
};

const addReview = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const { rating, comment } = req.body;
  if (!rating || !comment) {
    res.status(400);
    throw new Error('rating and comment are required');
  }

  const existingReview = course.reviews.find((review) => String(review.user) === String(req.user._id));
  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    course.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment
    });
  }

  buildRatings(course);
  await course.save();
  res.status(201).json({ message: 'Review saved', ratingAverage: course.ratingAverage });
};

const categories = async (req, res) => {
  const items = await Course.distinct('category');
  res.json(items);
};

module.exports = {
  listCourses,
  getCourseById,
  searchCourses,
  createCourse,
  updateCourse,
  addReview,
  categories
};

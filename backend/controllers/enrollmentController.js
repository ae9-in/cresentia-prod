const PDFDocument = require('pdfkit');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');

const calculateProgress = (course, enrollment) => {
  const videoWeight = 70;
  const quizWeight = 30;
  const totalVideos = course.videos.length || 1;
  const videoProgress = (enrollment.completedVideos.length / totalVideos) * videoWeight;
  const quizProgress = enrollment.quizSubmittedAt ? quizWeight : 0;
  return Math.min(100, Math.round(videoProgress + quizProgress));
};

const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  let enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id
  });

  if (!enrollment) {
    enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id
    });
  }

  res.status(201).json(enrollment);
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate('course')
    .sort({ createdAt: -1 });

  res.json(enrollments);
});

const updateVideoProgress = asyncHandler(async (req, res) => {
  const { videoIndex } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id
  });

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found. Enroll first');
  }

  if (!enrollment.completedVideos.includes(videoIndex) && videoIndex >= 0) {
    enrollment.completedVideos.push(videoIndex);
  }

  enrollment.progressPercent = calculateProgress(course, enrollment);
  if (enrollment.progressPercent === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  res.json(enrollment);
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id
  });

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found. Enroll first');
  }

  let score = 0;
  course.quizQuestions.forEach((question, index) => {
    if (Number(answers?.[index]) === question.correctAnswer) {
      score += 1;
    }
  });

  const percentage = course.quizQuestions.length
    ? Math.round((score / course.quizQuestions.length) * 100)
    : 100;

  enrollment.quizScore = percentage;
  enrollment.quizSubmittedAt = new Date();
  enrollment.progressPercent = calculateProgress(course, enrollment);

  if (enrollment.progressPercent === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }

  await enrollment.save();

  res.json({
    message: 'Quiz submitted',
    score: percentage,
    progressPercent: enrollment.progressPercent
  });
});

const downloadCertificate = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: course._id
  });

  if (!enrollment || enrollment.progressPercent < 100) {
    res.status(400);
    throw new Error('Course not completed yet');
  }

  const filename = `certificate-${course.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  doc.fontSize(28).text('Learnera Certificate', { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(16).text('This certifies that', { align: 'center' });
  doc.moveDown();
  doc.fontSize(24).text(req.user.name, { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('has successfully completed the course', { align: 'center' });
  doc.moveDown();
  doc.fontSize(22).text(course.title, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(12).text(`Completed on: ${enrollment.completedAt.toDateString()}`, { align: 'center' });
  doc.text(`Quiz score: ${enrollment.quizScore}%`, { align: 'center' });
  doc.end();
});

module.exports = {
  enrollCourse,
  getMyEnrollments,
  updateVideoProgress,
  submitQuiz,
  downloadCertificate
};

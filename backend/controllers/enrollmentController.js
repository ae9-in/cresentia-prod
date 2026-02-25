import PDFDocument from 'pdfkit';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

const calculateProgress = (course, enrollment) => {
  // New module-based calculation
  if (course.modules && course.modules.length > 0) {
    const totalModules = course.modules.length;
    const completedModules = enrollment.completedModules?.length || 0;
    const moduleProgress = (completedModules / totalModules) * 70;
    const quizProgress = enrollment.quizSubmittedAt ? 30 : 0;
    return Math.min(100, Math.round(moduleProgress + quizProgress));
  }
  
  // Legacy video-based calculation
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

  // Check if user has access to this course (students only)
  if (req.user.role === 'student') {
    const hasAccess = req.user.assignedCourses.some(
      id => id.toString() === course._id.toString()
    );
    
    if (!hasAccess) {
      res.status(403);
      throw new Error('You do not have access to this course. Please contact an administrator.');
    }
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
  // Optimized: Use lean() and select only needed fields
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      select: 'title description category level videos modules estimatedDuration'
    })
    .sort({ updatedAt: -1 })
    .lean();

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

const updateModuleProgress = asyncHandler(async (req, res) => {
  const { moduleId, moduleIndex } = req.body;
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

  // Add module to completed list if not already there
  if (moduleId && !enrollment.completedModules.includes(moduleId)) {
    enrollment.completedModules.push(moduleId);
  }

  // Update current module index
  if (moduleIndex !== undefined) {
    enrollment.currentModuleIndex = moduleIndex + 1;
  }

  enrollment.progressPercent = calculateProgress(course, enrollment);
  if (enrollment.progressPercent === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  res.json(enrollment);
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, moduleId } = req.body;
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

  // Handle module-based assessment
  if (moduleId) {
    const module = course.modules.find(m => m._id.toString() === moduleId);
    if (!module || module.type !== 'assessment') {
      res.status(400);
      throw new Error('Invalid assessment module');
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedResults = [];

    module.questions.forEach((question, index) => {
      const points = question.points || 1;
      totalPoints += points;
      
      const isCorrect = Number(answers?.[index]) === question.correctAnswer;
      if (isCorrect) {
        earnedPoints += points;
      }

      detailedResults.push({
        questionIndex: index,
        correct: isCorrect,
        userAnswer: Number(answers?.[index]),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        points: isCorrect ? points : 0
      });
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Save assessment result
    enrollment.assessmentResults.push({
      moduleId: moduleId,
      score: earnedPoints,
      totalPoints: totalPoints,
      percentage: percentage,
      answers: answers,
      submittedAt: new Date()
    });

    // Mark module as completed if passed
    if (percentage >= (module.passingScore || 70)) {
      if (!enrollment.completedModules.includes(moduleId)) {
        enrollment.completedModules.push(moduleId);
      }
    }

    // Update performance metrics
    const allResults = enrollment.assessmentResults;
    enrollment.totalPointsEarned = allResults.reduce((sum, r) => sum + r.score, 0);
    enrollment.averageAssessmentScore = allResults.length > 0
      ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
      : 0;

    enrollment.progressPercent = calculateProgress(course, enrollment);
    if (enrollment.progressPercent === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return res.json({
      message: 'Assessment submitted',
      score: earnedPoints,
      totalPoints: totalPoints,
      percentage: percentage,
      passed: percentage >= (module.passingScore || 70),
      detailedResults: detailedResults,
      progressPercent: enrollment.progressPercent
    });
  }

  // Legacy quiz handling
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

  doc.fontSize(28).text('Crescentia Certificate', { align: 'center' });
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

export {
  enrollCourse,
  getMyEnrollments,
  updateVideoProgress,
  updateModuleProgress,
  submitQuiz,
  downloadCertificate
};

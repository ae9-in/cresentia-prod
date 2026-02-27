import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

const buildRatings = (course) => {
  const total = course.reviews.reduce((sum, review) => sum + review.rating, 0);
  course.ratingAverage = course.reviews.length ? Number((total / course.reviews.length).toFixed(1)) : 0;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listCourses = asyncHandler(async (req, res) => {
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

  // Admin sees all courses, instructors see only their own, users see assigned courses
  if (req.user && req.user.role === 'instructor') {
    query.createdBy = req.user._id;
  } else if (req.user && req.user.role === 'user') {
    query._id = { $in: req.user.assignedCourses };
    query.isPublished = true;
  }

  // Admins see all courses (published and unpublished)
  // No isPublished filter for admins

  // Optimized: Select only necessary fields, limit results
  const courses = await Course.find(query)
    .select('title description category level ratingAverage estimatedDuration durationMinutes createdBy isPublished')
    .populate('createdBy', 'name')
    .limit(50)
    .lean(); // Use lean() for better performance

  res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  console.log('\n========================================');
  console.log('🔍 GET /courses/:id called');
  console.log('========================================');
  console.log('📋 Course ID from params:', req.params.id);
  console.log('📋 ID type:', typeof req.params.id);
  console.log('📋 ID length:', req.params.id?.length);
  console.log('👤 User Email:', req.user?.email);
  console.log('👤 User Role:', req.user?.role);
  console.log('📚 User Assigned Courses:', req.user?.assignedCourses);
  console.log('📚 Assigned Courses Count:', req.user?.assignedCourses?.length);

  // Validate ObjectId format
  if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    console.log('❌ Invalid ObjectId format');
    res.status(400);
    throw new Error('Invalid course ID format');
  }

  console.log('✅ ObjectId format valid');

  // CRITICAL: Fetch full course with ALL data - do NOT use lean() to preserve all fields
  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('reviews.user', 'name');

  if (!course) {
    console.log('❌ Course not found in database');
    console.log('========================================\n');
    res.status(404);
    throw new Error('Course not found');
  }

  console.log('✅ Course found:', course.title);
  console.log('📖 Course ID from DB:', course._id);
  console.log('📖 Course Published:', course.isPublished);
  console.log('📖 Videos count:', course.videos?.length || 0);
  console.log('📖 Quiz questions count:', course.quizQuestions?.length || 0);
  console.log('📖 Modules count:', course.modules?.length || 0);

  // Check access based on role
  if (req.user && req.user.role === 'instructor') {
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view courses you created.' });
    }
  } else if (req.user && req.user.role === 'user') {
    const hasAccess = req.user.assignedCourses.some(
      assignedCourse => {
        const assignedId = typeof assignedCourse === 'object' ? assignedCourse._id : assignedCourse;
        return assignedId.toString() === course._id.toString();
      }
    );
    
    if (!hasAccess || !course.isPublished) {
      return res.status(403).json({ message: 'You do not have access to this course. Please contact an administrator.' });
    }
  }

  console.log('✅ Access granted, returning course data');
  console.log('========================================\n');

  // Convert to plain object for manipulation
  const courseObj = course.toObject();

  // Mask quiz answers for security (but keep all other fields)
  if (courseObj.quizQuestions && courseObj.quizQuestions.length > 0) {
    courseObj.quizQuestions = courseObj.quizQuestions.map((q) => ({
      question: q.question,
      options: q.options,
      // Don't send correctAnswer to frontend before quiz submission
    }));
  }

  // Mask module assessment answers (but keep all other module data)
  if (courseObj.modules && courseObj.modules.length > 0) {
    courseObj.modules = courseObj.modules.map((m) => {
      if (m.type === 'assessment' && m.questions) {
        return {
          ...m,
          questions: m.questions.map((q) => ({
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            questionType: q.questionType,
            points: q.points,
            // Don't send correctAnswer or explanation before submission
          }))
        };
      }
      return m;
    });
  }

  console.log('📤 Sending course data:');
  console.log('   - Title:', courseObj.title);
  console.log('   - Videos:', courseObj.videos?.length || 0);
  console.log('   - Quiz Questions:', courseObj.quizQuestions?.length || 0);
  console.log('   - Modules:', courseObj.modules?.length || 0);

  res.json(courseObj);
});

const searchCourses = asyncHandler(async (req, res) => {
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

  // Filter by created courses for instructors, assigned courses for users
  if (req.user && req.user.role === 'instructor') {
    query.createdBy = req.user._id;
  } else if (req.user && req.user.role === 'user') {
    query._id = { $in: req.user.assignedCourses };
    query.isPublished = true;
  }

  const courses = await Course.find(query).select('title category level ratingAverage');
  
  const autocompleteQuery = { title: { $regex: `^${safeQ}`, $options: 'i' } };
  if (req.user && req.user.role === 'instructor') {
    autocompleteQuery.createdBy = req.user._id;
  } else if (req.user && req.user.role === 'user') {
    autocompleteQuery._id = { $in: req.user.assignedCourses };
    autocompleteQuery.isPublished = true;
  }
  
  const autocomplete = safeQ
    ? await Course.find(autocompleteQuery)
      .select('title')
      .limit(8)
    : [];

  res.json({
    courses,
    autocomplete: autocomplete.map((item) => item.title)
  });
});

const validateCoursePlanning = (courseData) => {
  const errors = [];

  // Required fields for course planning standardization
  if (!courseData.learningOutcomes || courseData.learningOutcomes.length === 0) {
    errors.push('Learning outcomes are required (minimum 3)');
  } else if (courseData.learningOutcomes.length < 3) {
    errors.push('At least 3 learning outcomes are required');
  }

  if (!courseData.level || !['Beginner', 'Intermediate', 'Advanced'].includes(courseData.level)) {
    errors.push('Difficulty level is required (Beginner, Intermediate, or Advanced)');
  }

  if (!courseData.estimatedDuration || courseData.estimatedDuration <= 0) {
    errors.push('Estimated completion time (in hours) is required');
  }

  // Module breakdown validation
  const hasModules = courseData.modules && courseData.modules.length > 0;
  const hasVideos = courseData.videos && courseData.videos.length > 0;
  
  if (!hasModules && !hasVideos) {
    errors.push('Course must have at least one module or video');
  }

  if (hasModules && courseData.modules.length < 2) {
    errors.push('Course must have at least 2 modules for proper structure');
  }

  // Target audience validation
  if (!courseData.targetAudience || courseData.targetAudience.trim().length === 0) {
    errors.push('Target audience description is required');
  }

  return errors;
};

const createCourse = asyncHandler(async (req, res) => {
  const { category, level, title, description, videos, quizQuestions, modules, learningOutcomes, estimatedDuration, targetAudience, prerequisites, courseTemplate } = req.body;

  if (!category || !title || !description) {
    res.status(400);
    throw new Error('category, title, and description are required');
  }

  // Validate course planning standards
  const planningErrors = validateCoursePlanning(req.body);
  if (planningErrors.length > 0) {
    res.status(400);
    throw new Error(`Course planning validation failed:\n${planningErrors.join('\n')}`);
  }

  // Validate quiz questions before saving
  if (Array.isArray(quizQuestions) && quizQuestions.length > 0) {
    const invalidQuestions = [];

    quizQuestions.forEach((q, index) => {
      const errors = [];

      if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
        errors.push('question is required and must be a non-empty string');
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push('options must be an array of exactly 4 strings');
      } else {
        q.options.forEach((opt, optIndex) => {
          if (!opt || typeof opt !== 'string' || !opt.trim()) {
            errors.push(`option ${optIndex + 1} is required and must be a non-empty string`);
          }
        });
      }

      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push('correctAnswer must be a number between 0 and 3');
      }

      if (errors.length > 0) {
        invalidQuestions.push({
          index: index + 1,
          question: q.question || '(empty)',
          errors
        });
      }
    });

    if (invalidQuestions.length > 0) {
      console.error('Invalid quiz questions detected:', JSON.stringify(invalidQuestions, null, 2));
      res.status(400);
      throw new Error(
        `Invalid quiz questions found:\n${invalidQuestions
          .map((iq) => `Question ${iq.index}: ${iq.errors.join(', ')}`)
          .join('\n')}`
      );
    }
  }

  // Validate modules if provided
  if (modules && Array.isArray(modules)) {
    modules.forEach((module, index) => {
      if (!module.type || !['video', 'theory', 'assessment', 'case-study', 'scenario'].includes(module.type)) {
        res.status(400);
        throw new Error(`Module ${index + 1}: Invalid module type`);
      }
      if (!module.title || module.title.trim().length === 0) {
        res.status(400);
        throw new Error(`Module ${index + 1}: Title is required`);
      }
      if (module.order === undefined) {
        res.status(400);
        throw new Error(`Module ${index + 1}: Order is required`);
      }
    });
  }

  const durationMinutes = Array.isArray(videos)
    ? videos.reduce((sum, video) => sum + Number(video.durationMinutes || 30), 0)
    : 0;

  const course = await Course.create({
    category,
    level,
    title,
    description,
    learningOutcomes: learningOutcomes || [],
    prerequisites: prerequisites || [],
    targetAudience: targetAudience || '',
    estimatedDuration: estimatedDuration || 0,
    difficultyLevel: level,
    courseTemplate: courseTemplate || 'default',
    modules: modules || [],
    videos: videos || [],
    quizQuestions: quizQuestions || [],
    durationMinutes,
    createdBy: req.user._id
  });

  res.status(201).json(course);
});

const updateCourse = asyncHandler(async (req, res) => {
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

  // Validate quiz questions if they are being updated
  if (updates.quizQuestions && Array.isArray(updates.quizQuestions) && updates.quizQuestions.length > 0) {
    const invalidQuestions = [];

    updates.quizQuestions.forEach((q, index) => {
      const errors = [];

      if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
        errors.push('question is required and must be a non-empty string');
      }

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push('options must be an array of exactly 4 strings');
      } else {
        q.options.forEach((opt, optIndex) => {
          if (!opt || typeof opt !== 'string' || !opt.trim()) {
            errors.push(`option ${optIndex + 1} is required and must be a non-empty string`);
          }
        });
      }

      if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        errors.push('correctAnswer must be a number between 0 and 3');
      }

      if (errors.length > 0) {
        invalidQuestions.push({
          index: index + 1,
          question: q.question || '(empty)',
          errors
        });
      }
    });

    if (invalidQuestions.length > 0) {
      console.error('Invalid quiz questions detected:', JSON.stringify(invalidQuestions, null, 2));
      res.status(400);
      throw new Error(
        `Invalid quiz questions found:\n${invalidQuestions
          .map((iq) => `Question ${iq.index}: ${iq.errors.join(', ')}`)
          .join('\n')}`
      );
    }
  }

  Object.assign(course, updates);
  if (Array.isArray(course.videos)) {
    course.durationMinutes = course.videos.reduce((sum, video) => sum + Number(video.durationMinutes || 30), 0);
  }

  await course.save();
  res.json(course);
});

const addReview = asyncHandler(async (req, res) => {
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
});

const categories = asyncHandler(async (req, res) => {
  const items = await Course.distinct('category');
  res.json(items);
});

export {
  listCourses,
  getCourseById,
  searchCourses,
  createCourse,
  updateCourse,
  addReview,
  categories,
  validateCoursePlanning
};

import User from '../models/User.js';
import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

const listUsers = asyncHandler(async (req, res) => {
  // CRITICAL: Populate assignedCourses so admin can see what courses each user has
  const users = await User.find()
    .select('-password')
    .populate({
      path: 'assignedCourses',
      select: 'title description category level isPublished'
    })
    .sort({ createdAt: -1 });
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

// User Management
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'student',
    isVerified: true,
    isActive: true
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    assignedCourses: user.assignedCourses
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, role, password } = req.body;
  
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (role) user.role = role;
  if (password) user.password = password;

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    assignedCourses: user.assignedCourses
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  await User.findByIdAndDelete(req.params.userId);
  res.json({ message: 'User deleted successfully' });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deactivating yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot deactivate your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
});

const assignCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Update user's assignedCourses
  if (!user.assignedCourses.includes(courseId)) {
    user.assignedCourses.push(courseId);
    await user.save();
  }

  // Update course's assignedUsers
  if (!course.assignedUsers.includes(user._id)) {
    course.assignedUsers.push(user._id);
    await course.save();
  }

  // Auto-enroll the user in the course
  const Enrollment = (await import('../models/Enrollment.js')).default;
  let enrollment = await Enrollment.findOne({
    student: user._id,
    course: courseId
  });

  if (!enrollment) {
    enrollment = await Enrollment.create({
      student: user._id,
      course: courseId
    });
  }

  // CRITICAL: Return updated user WITH populated assignedCourses
  const updatedUser = await User.findById(user._id)
    .select('-password')
    .populate({
      path: 'assignedCourses',
      select: 'title description category level videos quizQuestions modules isPublished'
    });

  console.log('\n========================================');
  console.log('✅ Course Assigned Successfully');
  console.log('========================================');
  console.log('👤 User:', updatedUser.email);
  console.log('📚 Total Assigned Courses:', updatedUser.assignedCourses?.length);
  console.log('📚 Course IDs:', updatedUser.assignedCourses?.map(c => c._id.toString()));
  console.log('📖 Newly Assigned Course:', course.title);
  console.log('📖 Course has videos:', course.videos?.length || 0);
  console.log('📖 Course has quiz questions:', course.quizQuestions?.length || 0);
  console.log('========================================\n');

  res.json({
    user: updatedUser,
    message: 'Course assigned and enrolled successfully'
  });
});

const removeCourseAccess = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Remove from user's assignedCourses
  user.assignedCourses = user.assignedCourses.filter(
    id => id.toString() !== courseId
  );
  await user.save();

  // Remove from course's assignedUsers
  course.assignedUsers = course.assignedUsers.filter(
    id => id.toString() !== user._id.toString()
  );
  await course.save();

  // CRITICAL: Return updated user WITH populated assignedCourses
  const updatedUser = await User.findById(user._id)
    .select('-password')
    .populate({
      path: 'assignedCourses',
      select: 'title description category level videos quizQuestions modules isPublished'
    });

  res.json({
    user: updatedUser,
    message: 'Course access removed successfully'
  });
});

const resetUserProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const user = await User.findById(req.params.userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Import Enrollment model at the top if not already imported
  const Enrollment = (await import('../models/Enrollment.js')).default;

  if (courseId) {
    // Reset specific course
    await Enrollment.findOneAndDelete({
      student: user._id,
      course: courseId
    });
    res.json({ message: 'Course progress reset successfully' });
  } else {
    // Reset all progress
    await Enrollment.deleteMany({ student: user._id });
    res.json({ message: 'All progress reset successfully' });
  }
});

const getUserProgress = asyncHandler(async (req, res) => {
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  const enrollments = await Enrollment.find({ student: req.params.userId })
    .populate('course', 'title category level')
    .lean();

  res.json(enrollments);
});

const toggleCoursePublish = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.json({
    _id: course._id,
    title: course.title,
    isPublished: course.isPublished,
    message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`
  });
});

const getAdminStats = asyncHandler(async (req, res) => {
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  const [
    totalUsers,
    totalCourses,
    publishedCourses,
    activeUsers,
    totalEnrollments
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    User.countDocuments({ isActive: true }),
    Enrollment.countDocuments()
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  res.json({
    totalUsers,
    totalCourses,
    publishedCourses,
    unpublishedCourses: totalCourses - publishedCourses,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalEnrollments,
    usersByRole
  });
});

export {
  getAdminStats,
  listUsers,
  getAllQuizQuestions,
  deleteCourse,
  updateCourseAsAdmin,
  createCourseAsAdmin,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  assignCourse,
  removeCourseAccess,
  resetUserProgress,
  getUserProgress,
  toggleCoursePublish
};

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import connectDB from '../config/db.js';
import { courseCatalog } from './courseCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Enrollment.deleteMany({})
  ]);

  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin',
      isVerified: true,
      isActive: true
    },
    {
      name: 'Course Manager',
      email: 'instructor@gmail.com',
      password: 'instructor',
      role: 'instructor',
      isVerified: true,
      isActive: true
    },
    {
      name: 'Student User',
      email: 'user@gmail.com',
      password: 'user',
      role: 'user',
      isVerified: true,
      isActive: true,
      assignedCourses: []
    }
  ]);

  const admin = users.find((item) => item.role === 'admin');
  const instructor = users.find((item) => item.role === 'instructor');
  const learner = users.find((item) => item.role === 'user');

  instructor.createdBy = admin._id;
  await instructor.save();

  const courses = await Course.insertMany(
    courseCatalog.map((course, index) => ({
      ...course,
      durationMinutes: course.videos.reduce((sum, video) => sum + Number(video.durationMinutes || 0), 0),
      createdBy: index % 2 === 0 ? admin._id : instructor._id,
      assignedUsers: [learner._id],
      studentsAssigned: [learner._id]
    }))
  );

  learner.assignedCourses = courses.map((course) => course._id);
  await learner.save();

  await Enrollment.insertMany(
    courses.map((course) => ({
      student: learner._id,
      course: course._id,
      completedVideos: [],
      completedModules: [],
      progressPercent: 0,
      currentModuleIndex: 0
    }))
  );

  console.log('Seed complete');
  console.log('='.repeat(50));
  console.log('Admin: admin@gmail.com / admin');
  console.log('Instructor: instructor@gmail.com / instructor');
  console.log('User: user@gmail.com / user');
  console.log('='.repeat(50));
  console.log(`Courses created: ${courses.length}`);
  console.log(`Assigned to learner: ${learner.assignedCourses.length}`);

  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});

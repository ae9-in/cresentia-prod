import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import './loadEnv.js';

const MONGO_URI = process.env.MONGO_URI;

const assignCourses = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Find user with no courses
    const user = await User.findOne({ email: 'jishnunreddy10@gmail.com' });
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current assigned courses: ${user.assignedCourses.length}\n`);

    // Get first 3 courses
    const courses = await Course.find().limit(3);
    
    console.log('Assigning courses:');
    courses.forEach(course => {
      console.log(`  - ${course.title}`);
    });

    // Assign courses
    user.assignedCourses = courses.map(c => c._id);
    await user.save();

    // Create enrollments
    for (const course of courses) {
      const existingEnrollment = await Enrollment.findOne({
        student: user._id,
        course: course._id
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: user._id,
          course: course._id
        });
        console.log(`  ✅ Enrolled in: ${course.title}`);
      }
    }

    console.log(`\n✅ Successfully assigned ${courses.length} courses to ${user.email}`);
    console.log('User can now access the platform!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

assignCourses();

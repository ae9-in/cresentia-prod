import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import './loadEnv.js';

const MONGO_URI = process.env.MONGO_URI;

const checkAssignments = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    const users = await User.find({ role: 'student' }).select('name email assignedCourses');
    
    console.log(`Found ${users.length} student(s):\n`);

    for (const user of users) {
      console.log(`👤 ${user.name} (${user.email})`);
      console.log(`   Assigned Courses: ${user.assignedCourses?.length || 0}`);
      
      if (user.assignedCourses && user.assignedCourses.length > 0) {
        const courses = await Course.find({ _id: { $in: user.assignedCourses } }).select('title');
        courses.forEach(course => {
          console.log(`   - ${course.title}`);
        });
      } else {
        console.log('   ⚠️  NO COURSES ASSIGNED - Will see blank screen');
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAssignments();

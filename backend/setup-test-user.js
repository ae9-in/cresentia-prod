import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function setupTestUser() {
  try {
    console.log('\n========================================');
    console.log('🧪 SETTING UP TEST USER: jishnunreddy@gmail.com');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if user exists
    let testUser = await User.findOne({ email: 'jishnunreddy@gmail.com' });
    
    if (!testUser) {
      console.log('Creating test user...\n');
      testUser = await User.create({
        name: 'Jishnu Reddy',
        email: 'jishnunreddy@gmail.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        isActive: true
      });
      console.log('✅ User created');
    } else {
      console.log('✅ User already exists');
    }

    console.log('\n📊 USER INFO');
    console.log('============');
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Role:', testUser.role);
    console.log('Active:', testUser.isActive);

    // Get all courses
    const allCourses = await Course.find().limit(6);
    console.log('\n📚 AVAILABLE COURSES:', allCourses.length);

    if (allCourses.length === 0) {
      console.log('⚠️  No courses found. Please run: npm run seed');
      return;
    }

    // Assign all courses to user
    console.log('\n🎯 ASSIGNING COURSES');
    console.log('====================');

    for (const course of allCourses) {
      // Add to user's assignedCourses
      if (!testUser.assignedCourses.includes(course._id)) {
        testUser.assignedCourses.push(course._id);
        console.log(`✅ Assigned: ${course.title}`);
      } else {
        console.log(`ℹ️  Already assigned: ${course.title}`);
      }

      // Add to course's assignedUsers
      if (!course.assignedUsers.includes(testUser._id)) {
        course.assignedUsers.push(testUser._id);
        await course.save();
      }

      // Create enrollment
      let enrollment = await Enrollment.findOne({
        student: testUser._id,
        course: course._id
      });

      if (!enrollment) {
        enrollment = await Enrollment.create({
          student: testUser._id,
          course: course._id
        });
        console.log(`   📖 Enrollment created`);
      } else {
        console.log(`   📖 Enrollment already exists`);
      }
    }

    await testUser.save();

    // Verify final state
    console.log('\n📊 FINAL STATE');
    console.log('==============');

    const updatedUser = await User.findById(testUser._id).populate('assignedCourses', 'title');
    const enrollments = await Enrollment.find({ student: testUser._id })
      .populate('course', 'title');

    console.log('Assigned Courses:', updatedUser.assignedCourses.length);
    console.log('Enrollments:', enrollments.length);

    console.log('\n📚 Assigned Courses:');
    updatedUser.assignedCourses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title}`);
    });

    console.log('\n📖 Enrollments:');
    enrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. ${enrollment.course?.title} - ${enrollment.progressPercent}%`);
    });

    // Calculate dashboard stats
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.progressPercent === 100).length;
    const inProgress = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
    const avgProgress = total > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / total) 
      : 0;

    console.log('\n📊 DASHBOARD STATS (What User Will See)');
    console.log('========================================');
    console.log('Overall Progress:', avgProgress + '%');
    console.log('Courses Enrolled:', total);
    console.log('Completed:', completed);
    console.log('In Progress:', inProgress);
    console.log('Not Started:', total - completed - inProgress);

    console.log('\n========================================');
    console.log('✅ SETUP COMPLETE');
    console.log('========================================');
    console.log('\n💡 LOGIN CREDENTIALS:');
    console.log('   Email: jishnunreddy@gmail.com');
    console.log('   Password: password123');
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Start the backend: cd backend && npm start');
    console.log('   2. Start the frontend: cd frontend && npm run dev');
    console.log('   3. Login with the credentials above');
    console.log('   4. Go to Dashboard - you should see', total, 'courses!');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

setupTestUser();

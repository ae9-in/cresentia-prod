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

async function diagnoseJishnu() {
  try {
    console.log('\n========================================');
    console.log('🔍 DIAGNOSING: jishnunreddy@gmail.com');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email: 'jishnunreddy@gmail.com' })
      .populate('assignedCourses');
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('Run: node backend/setup-test-user.js');
      return;
    }

    console.log('📊 USER DATA');
    console.log('============');
    console.log('ID:', user._id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log('Verified:', user.isVerified);
    console.log('Assigned Courses:', user.assignedCourses?.length || 0);

    if (user.assignedCourses && user.assignedCourses.length > 0) {
      console.log('\n📚 ASSIGNED COURSES:');
      user.assignedCourses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title} (${course._id})`);
      });
    } else {
      console.log('\n⚠️  NO COURSES ASSIGNED!');
      console.log('This is why dashboard shows "No courses yet"');
    }

    // Check enrollments
    console.log('\n📖 ENROLLMENTS');
    console.log('==============');
    
    const enrollments = await Enrollment.find({ student: user._id })
      .populate('course', 'title category level');
    
    console.log('Total Enrollments:', enrollments.length);

    if (enrollments.length > 0) {
      console.log('\nEnrollment Details:');
      enrollments.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. ${enrollment.course?.title || 'Unknown'}`);
        console.log(`      Progress: ${enrollment.progressPercent}%`);
        console.log(`      Completed Videos: ${enrollment.completedVideos?.length || 0}`);
      });
    } else {
      console.log('⚠️  NO ENROLLMENTS FOUND!');
      console.log('This is why dashboard shows 0 courses');
    }

    // Check sync status
    console.log('\n🔍 SYNC STATUS');
    console.log('==============');
    
    const assignedCount = user.assignedCourses?.length || 0;
    const enrolledCount = enrollments.length;

    if (assignedCount === 0 && enrolledCount === 0) {
      console.log('❌ PROBLEM: No courses assigned AND no enrollments');
      console.log('\n🔧 SOLUTION: Run this command:');
      console.log('   node backend/setup-test-user.js');
    } else if (assignedCount > 0 && enrolledCount === 0) {
      console.log('❌ PROBLEM: Courses assigned but no enrollments created');
      console.log(`   Assigned: ${assignedCount}, Enrolled: ${enrolledCount}`);
      console.log('\n🔧 SOLUTION: Creating missing enrollments...');
      
      for (const course of user.assignedCourses) {
        await Enrollment.create({
          student: user._id,
          course: course._id
        });
        console.log(`   ✅ Created enrollment for: ${course.title}`);
      }
      
      console.log('\n✅ All enrollments created! Refresh your dashboard.');
    } else if (assignedCount === enrolledCount) {
      console.log('✅ PERFECT SYNC!');
      console.log(`   Assigned: ${assignedCount}, Enrolled: ${enrolledCount}`);
      console.log('\n⚠️  If dashboard still shows 0, check:');
      console.log('   1. Are you logged in as jishnunreddy@gmail.com?');
      console.log('   2. Check browser console for errors');
      console.log('   3. Check Network tab for API call to /api/enrollments');
      console.log('   4. Try logging out and logging back in');
    } else {
      console.log('⚠️  MISMATCH!');
      console.log(`   Assigned: ${assignedCount}, Enrolled: ${enrolledCount}`);
    }

    // Test API endpoint simulation
    console.log('\n🧪 SIMULATING API CALL');
    console.log('======================');
    console.log('GET /api/enrollments (as this user)');
    console.log('Expected Response:', enrollments.length, 'enrollments');
    
    if (enrollments.length > 0) {
      console.log('\nSample Response:');
      console.log(JSON.stringify({
        _id: enrollments[0]._id,
        student: enrollments[0].student,
        course: {
          _id: enrollments[0].course?._id,
          title: enrollments[0].course?.title
        },
        progressPercent: enrollments[0].progressPercent,
        completedVideos: enrollments[0].completedVideos
      }, null, 2));
    }

    console.log('\n========================================');
    console.log('✅ DIAGNOSIS COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

diagnoseJishnu();

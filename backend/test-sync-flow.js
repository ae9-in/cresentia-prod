import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function testSyncFlow() {
  try {
    console.log('\n========================================');
    console.log('🔍 TESTING SYNC FLOW');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a test user (jishuu or any user)
    const testUser = await User.findOne({ email: 'jishuu@example.com' })
      .populate('assignedCourses');
    
    if (!testUser) {
      console.log('❌ Test user "jishuu@example.com" not found');
      console.log('Creating test user...\n');
      
      const newUser = await User.create({
        name: 'Jishuu Test',
        email: 'jishuu@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        isActive: true
      });
      
      console.log('✅ Test user created:', newUser.email);
      return;
    }

    console.log('📊 USER DATA CHECK');
    console.log('==================');
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Role:', testUser.role);
    console.log('Assigned Courses:', testUser.assignedCourses?.length || 0);
    
    if (testUser.assignedCourses && testUser.assignedCourses.length > 0) {
      console.log('\n📚 Assigned Course Details:');
      testUser.assignedCourses.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.title} (${course._id})`);
      });
    }

    // Check enrollments
    console.log('\n📊 ENROLLMENT DATA CHECK');
    console.log('========================');
    
    const enrollments = await Enrollment.find({ student: testUser._id })
      .populate('course', 'title category level videos');
    
    console.log('Total Enrollments:', enrollments.length);
    
    if (enrollments.length > 0) {
      console.log('\n📖 Enrollment Details:');
      enrollments.forEach((enrollment, index) => {
        console.log(`\n  ${index + 1}. ${enrollment.course?.title || 'Unknown Course'}`);
        console.log(`     Course ID: ${enrollment.course?._id}`);
        console.log(`     Progress: ${enrollment.progressPercent}%`);
        console.log(`     Completed Videos: ${enrollment.completedVideos?.length || 0}`);
        console.log(`     Quiz Submitted: ${enrollment.quizSubmittedAt ? 'Yes' : 'No'}`);
        console.log(`     Quiz Score: ${enrollment.quizScore || 0}%`);
      });
    } else {
      console.log('⚠️  No enrollments found for this user');
    }

    // Check if assigned courses have corresponding enrollments
    console.log('\n🔍 SYNC VERIFICATION');
    console.log('====================');
    
    if (testUser.assignedCourses && testUser.assignedCourses.length > 0) {
      const assignedCourseIds = testUser.assignedCourses.map(c => c._id.toString());
      const enrolledCourseIds = enrollments.map(e => e.course?._id.toString());
      
      console.log('Assigned Course IDs:', assignedCourseIds);
      console.log('Enrolled Course IDs:', enrolledCourseIds);
      
      const missingEnrollments = assignedCourseIds.filter(id => !enrolledCourseIds.includes(id));
      
      if (missingEnrollments.length > 0) {
        console.log('\n⚠️  SYNC ISSUE DETECTED!');
        console.log('Missing enrollments for', missingEnrollments.length, 'assigned courses:');
        missingEnrollments.forEach(courseId => {
          const course = testUser.assignedCourses.find(c => c._id.toString() === courseId);
          console.log(`  - ${course?.title || courseId}`);
        });
        
        console.log('\n🔧 AUTO-FIXING: Creating missing enrollments...');
        
        for (const courseId of missingEnrollments) {
          const enrollment = await Enrollment.create({
            student: testUser._id,
            course: courseId
          });
          console.log(`  ✅ Created enrollment for course ${courseId}`);
        }
        
        console.log('\n✅ All missing enrollments created!');
      } else {
        console.log('\n✅ SYNC IS PERFECT!');
        console.log('All assigned courses have corresponding enrollments.');
      }
    } else {
      console.log('⚠️  User has no assigned courses');
    }

    // Calculate dashboard stats
    console.log('\n📊 DASHBOARD STATS CALCULATION');
    console.log('==============================');
    
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.progressPercent === 100).length;
    const inProgress = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
    const avgProgress = total > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / total) 
      : 0;
    
    console.log('Overall Progress:', avgProgress + '%');
    console.log('Courses Enrolled:', total);
    console.log('Completed:', completed);
    console.log('In Progress:', inProgress);
    console.log('Not Started:', total - completed - inProgress);

    console.log('\n========================================');
    console.log('✅ SYNC FLOW TEST COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

testSyncFlow();

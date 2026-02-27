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

async function testFullSync() {
  try {
    console.log('\n========================================');
    console.log('🧪 FULL SYNC TEST - Simulating Admin Assignment');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find test user
    let testUser = await User.findOne({ email: 'jishuu@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Jishuu Test',
        email: 'jishuu@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        isActive: true
      });
      console.log('✅ Test user created\n');
    }

    console.log('📊 BEFORE ASSIGNMENT');
    console.log('====================');
    console.log('User:', testUser.email);
    console.log('Assigned Courses:', testUser.assignedCourses?.length || 0);

    // Get all courses
    const allCourses = await Course.find().limit(6);
    console.log('\nAvailable Courses:', allCourses.length);
    
    if (allCourses.length === 0) {
      console.log('⚠️  No courses found in database. Please create some courses first.');
      return;
    }

    // Simulate admin assigning courses
    console.log('\n🎯 SIMULATING ADMIN ASSIGNMENT');
    console.log('==============================');
    
    for (const course of allCourses) {
      console.log(`\nAssigning: ${course.title}`);
      
      // Step 1: Add to user's assignedCourses
      if (!testUser.assignedCourses.includes(course._id)) {
        testUser.assignedCourses.push(course._id);
      }
      
      // Step 2: Add to course's assignedUsers
      if (!course.assignedUsers.includes(testUser._id)) {
        course.assignedUsers.push(testUser._id);
        await course.save();
      }
      
      // Step 3: Auto-create enrollment
      let enrollment = await Enrollment.findOne({
        student: testUser._id,
        course: course._id
      });
      
      if (!enrollment) {
        enrollment = await Enrollment.create({
          student: testUser._id,
          course: course._id
        });
        console.log('  ✅ Enrollment created');
      } else {
        console.log('  ℹ️  Enrollment already exists');
      }
    }
    
    await testUser.save();
    console.log('\n✅ All courses assigned and enrollments created!');

    // Verify sync
    console.log('\n📊 AFTER ASSIGNMENT');
    console.log('===================');
    
    const updatedUser = await User.findById(testUser._id).populate('assignedCourses');
    const enrollments = await Enrollment.find({ student: testUser._id })
      .populate('course', 'title category level');
    
    console.log('User:', updatedUser.email);
    console.log('Assigned Courses:', updatedUser.assignedCourses?.length || 0);
    console.log('Enrollments:', enrollments.length);
    
    console.log('\n📚 Assigned Courses:');
    updatedUser.assignedCourses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.title}`);
    });
    
    console.log('\n📖 Enrollments:');
    enrollments.forEach((enrollment, index) => {
      console.log(`  ${index + 1}. ${enrollment.course?.title || 'Unknown'} - ${enrollment.progressPercent}% complete`);
    });

    // Calculate dashboard stats
    console.log('\n📊 DASHBOARD STATS (What User Will See)');
    console.log('========================================');
    
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

    // Verify sync integrity
    console.log('\n🔍 SYNC INTEGRITY CHECK');
    console.log('=======================');
    
    const assignedIds = updatedUser.assignedCourses.map(c => c._id.toString());
    const enrolledIds = enrollments.map(e => e.course?._id.toString());
    
    const missingEnrollments = assignedIds.filter(id => !enrolledIds.includes(id));
    const extraEnrollments = enrolledIds.filter(id => !assignedIds.includes(id));
    
    if (missingEnrollments.length === 0 && extraEnrollments.length === 0) {
      console.log('✅ PERFECT SYNC!');
      console.log('All assigned courses have enrollments.');
      console.log('No orphaned enrollments found.');
    } else {
      if (missingEnrollments.length > 0) {
        console.log('⚠️  Missing enrollments:', missingEnrollments.length);
      }
      if (extraEnrollments.length > 0) {
        console.log('⚠️  Extra enrollments:', extraEnrollments.length);
      }
    }

    console.log('\n========================================');
    console.log('✅ FULL SYNC TEST COMPLETE');
    console.log('========================================');
    console.log('\n💡 Now test in the UI:');
    console.log('1. Login as jishuu@example.com / password123');
    console.log('2. Go to Dashboard');
    console.log('3. You should see', total, 'courses enrolled');
    console.log('4. Overall progress should be', avgProgress + '%');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

testFullSync();

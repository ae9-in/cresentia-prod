import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const verifySync = async () => {
  try {
    await connectDB();

    console.log('\n========================================');
    console.log('🔍 VERIFYING COURSE ASSIGNMENT SYNC');
    console.log('========================================\n');

    // Find the user (jishuu or user@gmail.com)
    const user = await User.findOne({ 
      $or: [
        { email: 'user@gmail.com' },
        { name: /jishuu/i }
      ]
    }).populate({
      path: 'assignedCourses',
      select: 'title category level'
    });

    if (!user) {
      console.log('❌ User not found');
      await mongoose.connection.close();
      return;
    }

    console.log('👤 USER INFORMATION');
    console.log('='.repeat(50));
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('User ID:', user._id);
    console.log('');

    console.log('📚 ASSIGNED COURSES (from User.assignedCourses)');
    console.log('='.repeat(50));
    console.log('Total Assigned:', user.assignedCourses?.length || 0);
    if (user.assignedCourses && user.assignedCourses.length > 0) {
      user.assignedCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} (${course.category})`);
      });
    } else {
      console.log('No courses assigned');
    }
    console.log('');

    // Check enrollments
    const enrollments = await Enrollment.find({ student: user._id })
      .populate('course', 'title category level');

    console.log('📝 ENROLLMENTS (from Enrollment collection)');
    console.log('='.repeat(50));
    console.log('Total Enrollments:', enrollments.length);
    if (enrollments.length > 0) {
      enrollments.forEach((enrollment, index) => {
        console.log(`${index + 1}. ${enrollment.course.title}`);
        console.log(`   Progress: ${enrollment.progressPercent}%`);
        console.log(`   Completed Modules: ${enrollment.completedModules?.length || 0}`);
        console.log(`   Quiz Submitted: ${enrollment.quizSubmittedAt ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('No enrollments found');
    }
    console.log('');

    // Check for sync issues
    console.log('🔍 SYNC VERIFICATION');
    console.log('='.repeat(50));
    
    const assignedCount = user.assignedCourses?.length || 0;
    const enrollmentCount = enrollments.length;
    
    if (assignedCount === enrollmentCount) {
      console.log('✅ SYNC OK: Assigned courses match enrollments');
    } else {
      console.log('❌ SYNC ISSUE DETECTED!');
      console.log(`   Assigned Courses: ${assignedCount}`);
      console.log(`   Enrollments: ${enrollmentCount}`);
      console.log(`   Difference: ${Math.abs(assignedCount - enrollmentCount)}`);
      
      // Find missing enrollments
      const assignedIds = user.assignedCourses.map(c => c._id.toString());
      const enrolledIds = enrollments.map(e => e.course._id.toString());
      
      const missingEnrollments = assignedIds.filter(id => !enrolledIds.includes(id));
      const extraEnrollments = enrolledIds.filter(id => !assignedIds.includes(id));
      
      if (missingEnrollments.length > 0) {
        console.log('\n⚠️  Courses assigned but not enrolled:');
        for (const courseId of missingEnrollments) {
          const course = await Course.findById(courseId).select('title');
          console.log(`   - ${course?.title || courseId}`);
        }
      }
      
      if (extraEnrollments.length > 0) {
        console.log('\n⚠️  Enrollments without assignment:');
        for (const courseId of extraEnrollments) {
          const course = await Course.findById(courseId).select('title');
          console.log(`   - ${course?.title || courseId}`);
        }
      }
    }
    console.log('');

    // Check course.assignedUsers
    console.log('🔗 REVERSE SYNC (Course → User)');
    console.log('='.repeat(50));
    let reverseIssues = 0;
    
    for (const assignedCourse of user.assignedCourses || []) {
      const course = await Course.findById(assignedCourse._id);
      if (course) {
        const hasUser = course.assignedUsers?.some(id => id.toString() === user._id.toString());
        if (!hasUser) {
          console.log(`❌ Course "${course.title}" doesn't have user in assignedUsers`);
          reverseIssues++;
        }
      }
    }
    
    if (reverseIssues === 0) {
      console.log('✅ All courses have correct reverse references');
    }
    console.log('');

    // Summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Assigned Courses: ${assignedCount}`);
    console.log(`Enrollments: ${enrollmentCount}`);
    console.log(`Sync Status: ${assignedCount === enrollmentCount ? '✅ OK' : '❌ ISSUE'}`);
    console.log(`Reverse Sync: ${reverseIssues === 0 ? '✅ OK' : `❌ ${reverseIssues} issues`}`);
    console.log('='.repeat(50));

    await mongoose.connection.close();
    console.log('\n✅ Verification complete\n');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

verifySync();

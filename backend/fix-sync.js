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

const fixSync = async () => {
  try {
    await connectDB();

    console.log('\n========================================');
    console.log('🔧 FIXING COURSE ASSIGNMENT SYNC');
    console.log('========================================\n');

    // Find the user
    const user = await User.findOne({ 
      $or: [
        { email: 'user@gmail.com' },
        { name: /jishuu/i }
      ]
    });

    if (!user) {
      console.log('❌ User not found');
      await mongoose.connection.close();
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`📚 Assigned courses: ${user.assignedCourses?.length || 0}\n`);

    let fixed = 0;

    // Fix 1: Create missing enrollments
    console.log('🔧 Fix 1: Creating missing enrollments...');
    for (const courseId of user.assignedCourses || []) {
      const existingEnrollment = await Enrollment.findOne({
        student: user._id,
        course: courseId
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          student: user._id,
          course: courseId,
          progressPercent: 0,
          completedModules: []
        });
        const course = await Course.findById(courseId).select('title');
        console.log(`   ✅ Created enrollment for: ${course?.title || courseId}`);
        fixed++;
      }
    }
    if (fixed === 0) {
      console.log('   ✅ No missing enrollments');
    }
    console.log('');

    // Fix 2: Remove orphaned enrollments
    console.log('🔧 Fix 2: Removing orphaned enrollments...');
    const enrollments = await Enrollment.find({ student: user._id });
    let removed = 0;
    
    for (const enrollment of enrollments) {
      const isAssigned = user.assignedCourses?.some(
        id => id.toString() === enrollment.course.toString()
      );
      
      if (!isAssigned) {
        await Enrollment.findByIdAndDelete(enrollment._id);
        const course = await Course.findById(enrollment.course).select('title');
        console.log(`   ✅ Removed orphaned enrollment: ${course?.title || enrollment.course}`);
        removed++;
      }
    }
    if (removed === 0) {
      console.log('   ✅ No orphaned enrollments');
    }
    console.log('');

    // Fix 3: Update course.assignedUsers
    console.log('🔧 Fix 3: Updating course reverse references...');
    let updated = 0;
    
    for (const courseId of user.assignedCourses || []) {
      const course = await Course.findById(courseId);
      if (course) {
        const hasUser = course.assignedUsers?.some(id => id.toString() === user._id.toString());
        if (!hasUser) {
          if (!course.assignedUsers) {
            course.assignedUsers = [];
          }
          course.assignedUsers.push(user._id);
          await course.save();
          console.log(`   ✅ Added user to course: ${course.title}`);
          updated++;
        }
      }
    }
    if (updated === 0) {
      console.log('   ✅ All reverse references correct');
    }
    console.log('');

    // Verify the fix
    console.log('🔍 VERIFICATION AFTER FIX');
    console.log('='.repeat(50));
    
    const finalEnrollments = await Enrollment.find({ student: user._id });
    const assignedCount = user.assignedCourses?.length || 0;
    const enrollmentCount = finalEnrollments.length;
    
    console.log(`Assigned Courses: ${assignedCount}`);
    console.log(`Enrollments: ${enrollmentCount}`);
    console.log(`Status: ${assignedCount === enrollmentCount ? '✅ SYNCED' : '❌ STILL OUT OF SYNC'}`);
    console.log('='.repeat(50));
    console.log('');

    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Enrollments created: ${fixed}`);
    console.log(`Enrollments removed: ${removed}`);
    console.log(`Course references updated: ${updated}`);
    console.log(`Total fixes applied: ${fixed + removed + updated}`);
    console.log('='.repeat(50));

    await mongoose.connection.close();
    console.log('\n✅ Sync fix complete\n');
  } catch (error) {
    console.error('❌ Fix failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

fixSync();

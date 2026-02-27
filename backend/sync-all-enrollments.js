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

async function syncAllEnrollments() {
  try {
    console.log('\n========================================');
    console.log('🔄 SYNCING ALL ENROLLMENTS');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users with their assigned courses
    const users = await User.find({ role: 'user' })
      .populate('assignedCourses');
    
    console.log(`📊 Found ${users.length} users\n`);

    let totalFixed = 0;
    let totalChecked = 0;

    for (const user of users) {
      console.log(`\n👤 Processing: ${user.name} (${user.email})`);
      console.log('   Assigned Courses:', user.assignedCourses?.length || 0);

      if (!user.assignedCourses || user.assignedCourses.length === 0) {
        console.log('   ⚠️  No courses assigned, skipping...');
        continue;
      }

      // Check existing enrollments
      const existingEnrollments = await Enrollment.find({ student: user._id });
      const enrolledCourseIds = existingEnrollments.map(e => e.course.toString());
      
      console.log('   Existing Enrollments:', existingEnrollments.length);

      // Find missing enrollments
      const assignedCourseIds = user.assignedCourses.map(c => c._id.toString());
      const missingEnrollments = assignedCourseIds.filter(id => !enrolledCourseIds.includes(id));

      if (missingEnrollments.length > 0) {
        console.log(`   🔧 Creating ${missingEnrollments.length} missing enrollments...`);
        
        for (const courseId of missingEnrollments) {
          const course = user.assignedCourses.find(c => c._id.toString() === courseId);
          
          await Enrollment.create({
            student: user._id,
            course: courseId
          });
          
          console.log(`      ✅ Created enrollment for: ${course?.title || courseId}`);
          totalFixed++;
        }
      } else {
        console.log('   ✅ All enrollments exist');
      }

      totalChecked++;
    }

    console.log('\n========================================');
    console.log('📊 SYNC SUMMARY');
    console.log('========================================');
    console.log('Users Checked:', totalChecked);
    console.log('Enrollments Created:', totalFixed);
    console.log('========================================\n');

    // Verify sync for all users
    console.log('🔍 VERIFICATION');
    console.log('========================================\n');

    for (const user of users) {
      if (!user.assignedCourses || user.assignedCourses.length === 0) continue;

      const enrollments = await Enrollment.find({ student: user._id });
      const assignedCount = user.assignedCourses.length;
      const enrolledCount = enrollments.length;

      const status = assignedCount === enrolledCount ? '✅' : '⚠️';
      console.log(`${status} ${user.email}: ${enrolledCount}/${assignedCount} enrollments`);
    }

    console.log('\n========================================');
    console.log('✅ SYNC COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

syncAllEnrollments();

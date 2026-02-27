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

async function checkAllUsers() {
  try {
    console.log('\n========================================');
    console.log('👥 CHECKING ALL USERS');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const allUsers = await User.find()
      .select('-password')
      .populate('assignedCourses', 'title');
    
    console.log(`📊 Total Users: ${allUsers.length}\n`);

    for (const user of allUsers) {
      console.log('========================================');
      console.log(`👤 ${user.name}`);
      console.log('========================================');
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Verified:', user.isVerified);
      console.log('Assigned Courses:', user.assignedCourses?.length || 0);

      if (user.assignedCourses && user.assignedCourses.length > 0) {
        console.log('\n📚 Assigned Courses:');
        user.assignedCourses.forEach((course, index) => {
          console.log(`   ${index + 1}. ${course.title}`);
        });
      }

      // Check enrollments
      const enrollments = await Enrollment.find({ student: user._id })
        .populate('course', 'title');
      
      console.log('\n📖 Enrollments:', enrollments.length);
      
      if (enrollments.length > 0) {
        enrollments.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ${enrollment.course?.title || 'Unknown'} - ${enrollment.progressPercent}%`);
        });
      }

      // Check sync status
      const assignedCount = user.assignedCourses?.length || 0;
      const enrolledCount = enrollments.length;
      
      if (assignedCount > 0) {
        if (assignedCount === enrolledCount) {
          console.log('\n✅ SYNC STATUS: Perfect sync');
        } else {
          console.log(`\n⚠️  SYNC STATUS: Mismatch (${enrolledCount}/${assignedCount})`);
        }
      }

      console.log('');
    }

    console.log('========================================');
    console.log('✅ CHECK COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

checkAllUsers();

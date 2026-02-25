import './loadEnv.js';
import connectDB from './config/db.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import mongoose from 'mongoose';

const clearDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🗑️  Clearing database...\n');
    
    // Delete all users
    const usersDeleted = await User.deleteMany({});
    console.log(`✅ Deleted ${usersDeleted.deletedCount} users`);
    
    // Delete all courses
    const coursesDeleted = await Course.deleteMany({});
    console.log(`✅ Deleted ${coursesDeleted.deletedCount} courses`);
    
    // Delete all enrollments
    const enrollmentsDeleted = await Enrollment.deleteMany({});
    console.log(`✅ Deleted ${enrollmentsDeleted.deletedCount} enrollments`);
    
    console.log('\n✅ Database cleared successfully!\n');
    console.log('Run "npm run seed" to create fresh data\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearDatabase();

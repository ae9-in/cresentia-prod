import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const createInstructor = async () => {
  try {
    await connectDB();
    
    console.log('Creating instructor...');
    
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('❌ Admin user not found. Please run seed first.');
      process.exit(1);
    }
    
    // Check if instructor already exists
    const existingInstructor = await User.findOne({ email: 'instructor@gmail.com' });
    
    if (existingInstructor) {
      console.log('✅ Instructor already exists:');
      console.log('   Email: instructor@gmail.com');
      console.log('   Password: instructor');
      console.log('   Role:', existingInstructor.role);
      await mongoose.connection.close();
      return;
    }
    
    // Create instructor
    const instructor = await User.create({
      name: 'John Instructor',
      email: 'instructor@gmail.com',
      password: 'instructor',
      role: 'instructor',
      isVerified: true,
      isActive: true,
      createdBy: admin._id
    });
    
    console.log('✅ Instructor created successfully!');
    console.log('='.repeat(50));
    console.log('Instructor Details:');
    console.log('   Name:', instructor.name);
    console.log('   Email:', instructor.email);
    console.log('   Password: instructor');
    console.log('   Role:', instructor.role);
    console.log('   Created By:', admin.name);
    console.log('='.repeat(50));
    console.log('\nYou can now login with:');
    console.log('   Email: instructor@gmail.com');
    console.log('   Password: instructor');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating instructor:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createInstructor();

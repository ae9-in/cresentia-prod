import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function testUserCreation() {
  try {
    console.log('\n========================================');
    console.log('🧪 TESTING USER CREATION FOR jishnunreddy@gmail.com');
    console.log('========================================\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if user exists
    let existingUser = await User.findOne({ email: 'jishnunreddy@gmail.com' });
    
    if (existingUser) {
      console.log('ℹ️  User already exists:');
      console.log('   Name:', existingUser.name);
      console.log('   Email:', existingUser.email);
      console.log('   Role:', existingUser.role);
      console.log('   Active:', existingUser.isActive);
      console.log('   Assigned Courses:', existingUser.assignedCourses?.length || 0);
      console.log('\n✅ User is ready to use!');
    } else {
      console.log('Creating new user...\n');
      
      const newUser = await User.create({
        name: 'Jishnu Reddy',
        email: 'jishnunreddy@gmail.com',
        password: 'password123',
        role: 'user',
        isVerified: true,
        isActive: true
      });
      
      console.log('✅ User created successfully!');
      console.log('   Name:', newUser.name);
      console.log('   Email:', newUser.email);
      console.log('   Role:', newUser.role);
      console.log('   Password: password123');
      console.log('\n💡 Login credentials:');
      console.log('   Email: jishnunreddy@gmail.com');
      console.log('   Password: password123');
    }

    console.log('\n========================================');
    console.log('✅ TEST COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB\n');
  }
}

testUserCreation();

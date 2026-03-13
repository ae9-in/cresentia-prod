import './loadEnv.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const createAdmin = async () => {
  try {
    await connectDB();
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin';
    
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin already exists, updating password and role...');
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.name = 'Admin';
      admin.isActive = true;
      await admin.save();
    } else {
      console.log('Creating new admin user...');
      admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
    }
    
    console.log('✅ Admin user saved successfully:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
    process.exit(1);
  }
};

createAdmin();

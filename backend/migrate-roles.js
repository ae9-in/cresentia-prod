import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const migrateRoles = async () => {
  try {
    await connectDB();

    console.log('🔄 Starting role migration...');
    console.log('='.repeat(50));

    // Find all users with invalid roles
    const invalidUsers = await User.find({ 
      role: { $nin: ['admin', 'instructor'] } 
    });

    console.log(`Found ${invalidUsers.length} users with invalid roles`);

    if (invalidUsers.length > 0) {
      console.log('\nUsers to migrate:');
      invalidUsers.forEach(user => {
        console.log(`  - ${user.email} (current role: ${user.role})`);
      });

      // Update all invalid roles to instructor
      const result = await User.updateMany(
        { role: { $nin: ['admin', 'instructor'] } },
        { $set: { role: 'instructor' } }
      );

      console.log('\n✅ Migration complete!');
      console.log(`Updated ${result.modifiedCount} users to instructor role`);
    } else {
      console.log('\n✅ No migration needed - all users have valid roles');
    }

    // Show final role distribution
    const adminCount = await User.countDocuments({ role: 'admin' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });

    console.log('\n📊 Final Role Distribution:');
    console.log('='.repeat(50));
    console.log(`Admin: ${adminCount}`);
    console.log(`Instructor: ${instructorCount}`);
    console.log('='.repeat(50));

    if (adminCount > 1) {
      console.log('\n⚠️  WARNING: Multiple admins detected!');
      console.log('Only one admin should exist in the system.');
      const admins = await User.find({ role: 'admin' }).select('email name');
      console.log('Current admins:');
      admins.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.name})`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

migrateRoles();

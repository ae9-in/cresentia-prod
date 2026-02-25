import './loadEnv.js';
import connectDB from './config/db.js';
import User from './models/User.js';

const checkUsers = async () => {
  try {
    await connectDB();
    
    console.log('\n🔍 Checking users in database...\n');
    
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('Run: npm run seed');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach(user => {
        console.log(`- Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Verified: ${user.isVerified}`);
        console.log('');
      });
    }
    
    // Test login for admin
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (admin) {
      console.log('✅ Admin user exists');
      const isMatch = await admin.matchPassword('admin');
      console.log(`Password match test: ${isMatch ? '✅ PASS' : '❌ FAIL'}`);
    } else {
      console.log('❌ Admin user NOT found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();

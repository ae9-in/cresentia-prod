import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║          DATABASE CONNECTION CHECK (READ-ONLY)         ║');
console.log('║          NO CHANGES WILL BE MADE                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const checkConnection = async () => {
  try {
    // ============================================
    // STEP 1: CHECK ENVIRONMENT VARIABLES
    // ============================================
    console.log('📋 STEP 1: Environment Variables');
    console.log('─────────────────────────────────────────────────────────');
    
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file');
      console.log('\n⚠️  Please check:');
      console.log('   1. backend/.env file exists');
      console.log('   2. MONGO_URI is set in .env');
      console.log('   3. Connection string is correct\n');
      process.exit(1);
    }
    
    // Mask password in connection string for display
    const maskedUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log('✅ MONGO_URI found');
    console.log(`   ${maskedUri}\n`);

    // ============================================
    // STEP 2: TEST CONNECTION
    // ============================================
    console.log('🔌 STEP 2: Testing MongoDB Connection');
    console.log('─────────────────────────────────────────────────────────');
    console.log('Attempting to connect...');
    
    const startTime = Date.now();
    await mongoose.connect(MONGO_URI);
    const endTime = Date.now();
    
    console.log(`✅ Connected successfully in ${endTime - startTime}ms`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port || 'default'}\n`);

    // ============================================
    // STEP 3: COUNT DOCUMENTS (READ-ONLY)
    // ============================================
    console.log('📊 STEP 3: Database Statistics (Read-Only)');
    console.log('─────────────────────────────────────────────────────────');
    
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Courses: ${courseCount}`);
    console.log(`Enrollments: ${enrollmentCount}\n`);

    // ============================================
    // STEP 4: CHECK USERS (READ-ONLY)
    // ============================================
    console.log('👥 STEP 4: User Accounts');
    console.log('─────────────────────────────────────────────────────────');
    
    if (userCount === 0) {
      console.log('⚠️  No users found in database');
      console.log('   Run: node inject-and-test-db.js to create test users\n');
    } else {
      const users = await User.find().select('name email role isActive assignedCourses').limit(10);
      
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
        console.log(`   Assigned Courses: ${user.assignedCourses?.length || 0}`);
        console.log('');
      });
    }

    // ============================================
    // STEP 5: CHECK COURSES (READ-ONLY)
    // ============================================
    console.log('📚 STEP 5: Courses');
    console.log('─────────────────────────────────────────────────────────');
    
    if (courseCount === 0) {
      console.log('⚠️  No courses found in database');
      console.log('   Run: node inject-and-test-db.js to create test courses\n');
    } else {
      const courses = await Course.find()
        .select('title category level isPublished videos quizQuestions')
        .limit(10);
      
      console.log(`Found ${courses.length} course(s):\n`);
      courses.forEach((course, i) => {
        console.log(`${i + 1}. ${course.title}`);
        console.log(`   ID: ${course._id}`);
        console.log(`   Category: ${course.category}`);
        console.log(`   Level: ${course.level}`);
        console.log(`   Published: ${course.isPublished ? '✅' : '❌'}`);
        console.log(`   Videos: ${course.videos?.length || 0}`);
        console.log(`   Quiz Questions: ${course.quizQuestions?.length || 0}`);
        
        // Check if course has content
        if (course.videos?.length === 0 && course.quizQuestions?.length === 0) {
          console.log('   ⚠️  WARNING: Course has no content!');
        }
        
        console.log('');
      });
    }

    // ============================================
    // STEP 6: CHECK ENROLLMENTS (READ-ONLY)
    // ============================================
    console.log('📝 STEP 6: Enrollments');
    console.log('─────────────────────────────────────────────────────────');
    
    if (enrollmentCount === 0) {
      console.log('⚠️  No enrollments found in database');
      console.log('   Run: node inject-and-test-db.js to create test enrollments\n');
    } else {
      const enrollments = await Enrollment.find()
        .populate('student', 'name email')
        .populate('course', 'title')
        .limit(10);
      
      console.log(`Found ${enrollments.length} enrollment(s):\n`);
      enrollments.forEach((enrollment, i) => {
        console.log(`${i + 1}. ${enrollment.student?.name || 'Unknown'} → ${enrollment.course?.title || 'Unknown'}`);
        console.log(`   Progress: ${enrollment.progressPercent}%`);
        console.log(`   Completed Videos: ${enrollment.completedVideos?.length || 0}`);
        console.log('');
      });
    }

    // ============================================
    // STEP 7: CHECK DATA RELATIONSHIPS (READ-ONLY)
    // ============================================
    console.log('🔗 STEP 7: Data Relationships');
    console.log('─────────────────────────────────────────────────────────');
    
    // Find a student with assigned courses
    const studentWithCourses = await User.findOne({ 
      role: 'student',
      assignedCourses: { $exists: true, $ne: [] }
    }).populate({
      path: 'assignedCourses',
      select: 'title videos quizQuestions isPublished'
    });

    if (!studentWithCourses) {
      console.log('⚠️  No students with assigned courses found');
      console.log('   Run: node inject-and-test-db.js to set up test data\n');
    } else {
      console.log(`✅ Found student with courses: ${studentWithCourses.email}`);
      console.log(`   Assigned Courses: ${studentWithCourses.assignedCourses.length}\n`);
      
      console.log('   Course Details:');
      studentWithCourses.assignedCourses.forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title}`);
        console.log(`      ID: ${course._id}`);
        console.log(`      Published: ${course.isPublished ? '✅' : '❌'}`);
        console.log(`      Videos: ${course.videos?.length || 0}`);
        console.log(`      Quiz Questions: ${course.quizQuestions?.length || 0}`);
        
        // Check if populated correctly
        if (typeof course === 'object' && course.title) {
          console.log(`      ✅ Course is properly populated`);
        } else {
          console.log(`      ❌ Course is NOT populated (only ID)`);
        }
        console.log('');
      });
    }

    // ============================================
    // STEP 8: HEALTH CHECK SUMMARY
    // ============================================
    console.log('🏥 STEP 8: Health Check Summary');
    console.log('─────────────────────────────────────────────────────────');
    
    const checks = [
      { 
        name: 'Database Connection', 
        status: mongoose.connection.readyState === 1,
        message: mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'
      },
      { 
        name: 'Users Exist', 
        status: userCount > 0,
        message: userCount > 0 ? `${userCount} users found` : 'No users found'
      },
      { 
        name: 'Courses Exist', 
        status: courseCount > 0,
        message: courseCount > 0 ? `${courseCount} courses found` : 'No courses found'
      },
      { 
        name: 'Courses Have Content', 
        status: courseCount > 0 && courses.every(c => c.videos?.length > 0 || c.quizQuestions?.length > 0),
        message: courseCount > 0 ? 'Courses have videos/quizzes' : 'No courses to check'
      },
      { 
        name: 'Enrollments Exist', 
        status: enrollmentCount > 0,
        message: enrollmentCount > 0 ? `${enrollmentCount} enrollments found` : 'No enrollments found'
      },
      { 
        name: 'Student Has Courses', 
        status: !!studentWithCourses,
        message: studentWithCourses ? `${studentWithCourses.assignedCourses.length} courses assigned` : 'No student with courses'
      },
      { 
        name: 'Courses Are Populated', 
        status: studentWithCourses?.assignedCourses?.[0]?.title !== undefined,
        message: studentWithCourses?.assignedCourses?.[0]?.title ? 'Courses properly populated' : 'Courses not populated'
      }
    ];

    console.log('');
    checks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.message}`);
    });
    console.log('');

    const allPassed = checks.every(c => c.status);
    const criticalPassed = checks[0].status; // Database connection

    // ============================================
    // STEP 9: RECOMMENDATIONS
    // ============================================
    console.log('💡 STEP 9: Recommendations');
    console.log('─────────────────────────────────────────────────────────');
    
    if (allPassed) {
      console.log('✅ All checks passed! Database is healthy.\n');
      console.log('📋 Next Steps:');
      console.log('   1. Start backend: cd backend && npm start');
      console.log('   2. Start frontend: cd frontend && npm run dev');
      console.log('   3. Login and test course access\n');
    } else if (criticalPassed) {
      console.log('⚠️  Database connected but some issues found:\n');
      
      if (userCount === 0) {
        console.log('   • No users found');
        console.log('     Fix: Run "node inject-and-test-db.js"\n');
      }
      
      if (courseCount === 0) {
        console.log('   • No courses found');
        console.log('     Fix: Run "node inject-and-test-db.js"\n');
      }
      
      if (courseCount > 0 && !checks[3].status) {
        console.log('   • Courses exist but have no content');
        console.log('     Fix: Add videos/quizzes via admin panel\n');
      }
      
      if (!studentWithCourses) {
        console.log('   • No students with assigned courses');
        console.log('     Fix: Run "node inject-and-test-db.js"\n');
      }
      
      if (studentWithCourses && !checks[6].status) {
        console.log('   • Courses not properly populated');
        console.log('     Fix: Check backend population logic\n');
      }
    } else {
      console.log('❌ Database connection failed!\n');
      console.log('   Troubleshooting:');
      console.log('   1. Check MONGO_URI in backend/.env');
      console.log('   2. Verify MongoDB cluster is running');
      console.log('   3. Check network/firewall settings');
      console.log('   4. Ensure IP is whitelisted in MongoDB Atlas\n');
    }

    // ============================================
    // FINAL STATUS
    // ============================================
    console.log('╔════════════════════════════════════════════════════════╗');
    if (allPassed) {
      console.log('║              ✅ DATABASE IS HEALTHY ✅                 ║');
    } else if (criticalPassed) {
      console.log('║         ⚠️  DATABASE NEEDS ATTENTION ⚠️               ║');
    } else {
      console.log('║         ❌ DATABASE CONNECTION FAILED ❌               ║');
    }
    console.log('╚════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ ERROR CHECKING DATABASE:');
    console.error('─────────────────────────────────────────────────────────');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    console.log('\n💡 Common Issues:');
    console.log('   • Wrong connection string');
    console.log('   • Network/firewall blocking connection');
    console.log('   • MongoDB cluster not running');
    console.log('   • IP not whitelisted in MongoDB Atlas');
    console.log('   • Invalid credentials\n');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ Database connection closed\n');
    }
  }
};

checkConnection();

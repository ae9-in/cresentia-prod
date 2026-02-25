import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   DATABASE INJECTION & CONNECTION TEST                ║');
console.log('║   This script will inject test data and verify        ║');
console.log('║   WITHOUT changing any existing code                  ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

const injectAndTest = async () => {
  try {
    // ============================================
    // STEP 1: TEST DATABASE CONNECTION
    // ============================================
    console.log('📡 STEP 1: Testing Database Connection');
    console.log('─────────────────────────────────────────────────────────');
    console.log('MongoDB URI:', MONGO_URI ? MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'NOT SET');
    
    if (!MONGO_URI) {
      console.error('❌ MONGO_URI not found in environment variables');
      console.log('\nCheck your .env file and ensure MONGO_URI is set');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // ============================================
    // STEP 2: CHECK EXISTING DATA
    // ============================================
    console.log('📊 STEP 2: Checking Existing Data');
    console.log('─────────────────────────────────────────────────────────');
    
    const existingUsers = await User.countDocuments();
    const existingCourses = await Course.countDocuments();
    const existingEnrollments = await Enrollment.countDocuments();
    
    console.log(`Users in database: ${existingUsers}`);
    console.log(`Courses in database: ${existingCourses}`);
    console.log(`Enrollments in database: ${existingEnrollments}\n`);

    // ============================================
    // STEP 3: INJECT TEST DATA
    // ============================================
    console.log('💉 STEP 3: Injecting Test Data');
    console.log('─────────────────────────────────────────────────────────');

    // Create admin user
    let adminUser = await User.findOne({ email: 'admin@crescentia.com' });
    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@crescentia.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
      console.log('✅ Admin user created:', adminUser.email);
    } else {
      console.log('✅ Admin user already exists:', adminUser.email);
    }

    // Create student user
    let studentUser = await User.findOne({ email: 'student@crescentia.com' });
    if (!studentUser) {
      console.log('Creating student user...');
      studentUser = await User.create({
        name: 'Test Student',
        email: 'student@crescentia.com',
        password: 'student123',
        role: 'student',
        isVerified: true,
        isActive: true,
        assignedCourses: []
      });
      console.log('✅ Student user created:', studentUser.email);
    } else {
      console.log('✅ Student user already exists:', studentUser.email);
    }

    // Create test courses
    const testCourses = [
      {
        title: 'Cloud Deployment Basics',
        description: 'Learn the fundamentals of cloud deployment with hands-on examples and real-world scenarios.',
        category: 'IT',
        level: 'Beginner',
        isPublished: true,
        videos: [
          {
            title: 'Introduction to Cloud Computing',
            url: 'https://www.youtube.com/watch?v=M988_fsOSWo',
            durationMinutes: 15
          },
          {
            title: 'Setting Up Your First Cloud Server',
            url: 'https://www.youtube.com/watch?v=SLB_c_ayRMo',
            durationMinutes: 20
          },
          {
            title: 'Deploying Applications to the Cloud',
            url: 'https://www.youtube.com/watch?v=RVnVzRbXblk',
            durationMinutes: 25
          }
        ],
        quizQuestions: [
          {
            question: 'What is cloud computing?',
            options: [
              'Computing using physical servers only',
              'On-demand delivery of IT resources over the Internet',
              'A type of weather prediction',
              'Local network computing'
            ],
            correctAnswer: 1
          },
          {
            question: 'Which is a benefit of cloud deployment?',
            options: [
              'Higher upfront costs',
              'Limited scalability',
              'Pay-as-you-go pricing',
              'Requires physical hardware'
            ],
            correctAnswer: 2
          },
          {
            question: 'What does IaaS stand for?',
            options: [
              'Internet as a Service',
              'Infrastructure as a Service',
              'Information as a Service',
              'Integration as a Service'
            ],
            correctAnswer: 1
          }
        ],
        createdBy: adminUser._id,
        durationMinutes: 60
      },
      {
        title: 'Introduction to Data Analytics',
        description: 'Master the basics of data analytics and learn how to extract insights from data.',
        category: 'Business & Analytics',
        level: 'Beginner',
        isPublished: true,
        videos: [
          {
            title: 'What is Data Analytics?',
            url: 'https://www.youtube.com/watch?v=yZvFH7B6gKI',
            durationMinutes: 12
          },
          {
            title: 'Data Collection Methods',
            url: 'https://www.youtube.com/watch?v=ctqN4qV-RHE',
            durationMinutes: 18
          },
          {
            title: 'Analyzing Data with Excel',
            url: 'https://www.youtube.com/watch?v=Hmz87Ug7Fgg',
            durationMinutes: 22
          }
        ],
        quizQuestions: [
          {
            question: 'What is the first step in data analytics?',
            options: [
              'Data visualization',
              'Data collection',
              'Data reporting',
              'Data deletion'
            ],
            correctAnswer: 1
          },
          {
            question: 'Which tool is commonly used for data analytics?',
            options: [
              'Microsoft Word',
              'Adobe Photoshop',
              'Microsoft Excel',
              'Windows Media Player'
            ],
            correctAnswer: 2
          }
        ],
        createdBy: adminUser._id,
        durationMinutes: 52
      },
      {
        title: 'Effective Communication Skills',
        description: 'Develop essential communication skills for professional success.',
        category: 'Sales & Soft Skills',
        level: 'Intermediate',
        isPublished: true,
        videos: [
          {
            title: 'Principles of Effective Communication',
            url: 'https://www.youtube.com/watch?v=HAnw168huqA',
            durationMinutes: 14
          },
          {
            title: 'Active Listening Techniques',
            url: 'https://www.youtube.com/watch?v=rzsVh8YwZEQ',
            durationMinutes: 16
          }
        ],
        quizQuestions: [
          {
            question: 'What is active listening?',
            options: [
              'Listening while exercising',
              'Fully concentrating and understanding the speaker',
              'Listening to music',
              'Multitasking while listening'
            ],
            correctAnswer: 1
          }
        ],
        createdBy: adminUser._id,
        durationMinutes: 30
      }
    ];

    const createdCourses = [];
    for (const courseData of testCourses) {
      let course = await Course.findOne({ title: courseData.title });
      if (!course) {
        console.log(`Creating course: ${courseData.title}...`);
        course = await Course.create(courseData);
        console.log(`✅ Course created: ${course.title} (${course._id})`);
      } else {
        console.log(`✅ Course already exists: ${course.title} (${course._id})`);
      }
      createdCourses.push(course);
    }

    console.log('');

    // ============================================
    // STEP 4: ASSIGN COURSES TO STUDENT
    // ============================================
    console.log('🎓 STEP 4: Assigning Courses to Student');
    console.log('─────────────────────────────────────────────────────────');

    // Assign all courses to student
    const courseIds = createdCourses.map(c => c._id);
    studentUser.assignedCourses = courseIds;
    await studentUser.save();
    
    console.log(`✅ Assigned ${courseIds.length} courses to ${studentUser.email}`);
    console.log('Assigned course IDs:');
    courseIds.forEach((id, i) => {
      console.log(`  ${i + 1}. ${id} - ${createdCourses[i].title}`);
    });
    console.log('');

    // Update courses with assignedUsers
    for (const course of createdCourses) {
      if (!course.assignedUsers.includes(studentUser._id)) {
        course.assignedUsers.push(studentUser._id);
        await course.save();
      }
    }

    // ============================================
    // STEP 5: CREATE ENROLLMENTS
    // ============================================
    console.log('📝 STEP 5: Creating Enrollments');
    console.log('─────────────────────────────────────────────────────────');

    for (const course of createdCourses) {
      let enrollment = await Enrollment.findOne({
        student: studentUser._id,
        course: course._id
      });

      if (!enrollment) {
        enrollment = await Enrollment.create({
          student: studentUser._id,
          course: course._id,
          completedVideos: [],
          completedModules: [],
          progressPercent: 0
        });
        console.log(`✅ Enrollment created for: ${course.title}`);
      } else {
        console.log(`✅ Enrollment already exists for: ${course.title}`);
      }
    }
    console.log('');

    // ============================================
    // STEP 6: VERIFY DATA INTEGRITY
    // ============================================
    console.log('🔍 STEP 6: Verifying Data Integrity');
    console.log('─────────────────────────────────────────────────────────');

    // Reload student with populated courses
    const studentWithCourses = await User.findById(studentUser._id)
      .populate({
        path: 'assignedCourses',
        select: 'title description category level videos quizQuestions isPublished'
      });

    console.log('Student Data:');
    console.log(`  Name: ${studentWithCourses.name}`);
    console.log(`  Email: ${studentWithCourses.email}`);
    console.log(`  Role: ${studentWithCourses.role}`);
    console.log(`  Assigned Courses: ${studentWithCourses.assignedCourses.length}`);
    console.log('');

    console.log('Assigned Courses Details:');
    studentWithCourses.assignedCourses.forEach((course, i) => {
      console.log(`\n  ${i + 1}. ${course.title}`);
      console.log(`     ID: ${course._id}`);
      console.log(`     Category: ${course.category}`);
      console.log(`     Level: ${course.level}`);
      console.log(`     Published: ${course.isPublished ? '✅ YES' : '❌ NO'}`);
      console.log(`     Videos: ${course.videos?.length || 0}`);
      console.log(`     Quiz Questions: ${course.quizQuestions?.length || 0}`);
      
      if (course.videos?.length > 0) {
        console.log(`     First Video: ${course.videos[0].title}`);
      }
    });
    console.log('');

    // ============================================
    // STEP 7: TEST API ENDPOINTS (SIMULATION)
    // ============================================
    console.log('🧪 STEP 7: Testing Data Access Patterns');
    console.log('─────────────────────────────────────────────────────────');

    // Test 1: Fetch course by ID
    console.log('Test 1: Fetch course by ID');
    const testCourse = createdCourses[0];
    const fetchedCourse = await Course.findById(testCourse._id)
      .populate('createdBy', 'name')
      .populate('reviews.user', 'name');
    
    console.log(`  ✅ Course fetched: ${fetchedCourse.title}`);
    console.log(`  ✅ Videos: ${fetchedCourse.videos?.length || 0}`);
    console.log(`  ✅ Quiz Questions: ${fetchedCourse.quizQuestions?.length || 0}`);
    console.log('');

    // Test 2: Check access control
    console.log('Test 2: Check access control');
    const hasAccess = studentWithCourses.assignedCourses.some(c => 
      c._id.toString() === testCourse._id.toString()
    );
    console.log(`  ✅ Student has access to "${testCourse.title}": ${hasAccess ? 'YES' : 'NO'}`);
    console.log('');

    // Test 3: Fetch enrollments
    console.log('Test 3: Fetch enrollments');
    const enrollments = await Enrollment.find({ student: studentUser._id })
      .populate('course', 'title category level videos');
    
    console.log(`  ✅ Enrollments found: ${enrollments.length}`);
    enrollments.forEach((e, i) => {
      console.log(`     ${i + 1}. ${e.course?.title} - Progress: ${e.progressPercent}%`);
    });
    console.log('');

    // ============================================
    // STEP 8: GENERATE LOGIN CREDENTIALS
    // ============================================
    console.log('🔑 STEP 8: Login Credentials');
    console.log('─────────────────────────────────────────────────────────');
    console.log('Admin Login:');
    console.log(`  Email: admin@crescentia.com`);
    console.log(`  Password: admin123`);
    console.log('');
    console.log('Student Login:');
    console.log(`  Email: student@crescentia.com`);
    console.log(`  Password: student123`);
    console.log('');

    // ============================================
    // STEP 9: SUMMARY
    // ============================================
    console.log('📊 STEP 9: Summary');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`✅ Total Users: ${await User.countDocuments()}`);
    console.log(`✅ Total Courses: ${await Course.countDocuments()}`);
    console.log(`✅ Total Enrollments: ${await Enrollment.countDocuments()}`);
    console.log(`✅ Student Assigned Courses: ${studentWithCourses.assignedCourses.length}`);
    console.log('');

    // ============================================
    // STEP 10: VERIFICATION CHECKLIST
    // ============================================
    console.log('✅ STEP 10: Verification Checklist');
    console.log('─────────────────────────────────────────────────────────');
    
    const checks = [
      { name: 'Database connection', status: true },
      { name: 'Admin user created', status: !!adminUser },
      { name: 'Student user created', status: !!studentUser },
      { name: 'Courses created', status: createdCourses.length > 0 },
      { name: 'Courses have videos', status: createdCourses.every(c => c.videos?.length > 0) },
      { name: 'Courses have quiz questions', status: createdCourses.every(c => c.quizQuestions?.length > 0) },
      { name: 'Courses are published', status: createdCourses.every(c => c.isPublished) },
      { name: 'Courses assigned to student', status: studentWithCourses.assignedCourses.length > 0 },
      { name: 'Enrollments created', status: enrollments.length > 0 },
      { name: 'Data properly populated', status: studentWithCourses.assignedCourses[0]?.videos?.length > 0 }
    ];

    checks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);
    });
    console.log('');

    const allPassed = checks.every(c => c.status);
    
    if (allPassed) {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║                  🎉 ALL CHECKS PASSED! 🎉              ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('✅ Database is properly set up and connected');
      console.log('✅ Test data has been injected successfully');
      console.log('✅ All courses have videos and quiz questions');
      console.log('✅ Student has access to all courses');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Start your backend: cd backend && npm start');
      console.log('2. Start your frontend: cd frontend && npm run dev');
      console.log('3. Login with student credentials above');
      console.log('4. Navigate to Dashboard');
      console.log('5. Click "Start Course" on any course');
      console.log('');
      console.log('If course still doesn\'t load, run debug mode:');
      console.log('  Windows: enable-debug-mode.bat');
      console.log('  Linux/Mac: ./enable-debug-mode.sh');
      console.log('');
    } else {
      console.log('⚠️  Some checks failed. Review the output above.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
  }
};

injectAndTest();

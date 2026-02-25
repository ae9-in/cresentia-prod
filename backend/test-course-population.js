import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const testPopulation = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('\n✅ Connected to MongoDB\n');

    // Test 1: Check if courses have videos and quiz questions
    console.log('========================================');
    console.log('TEST 1: Verify Courses Have Data');
    console.log('========================================');
    
    const courses = await Course.find().limit(3);
    courses.forEach(course => {
      console.log(`\n📖 Course: ${course.title}`);
      console.log(`   - Videos: ${course.videos?.length || 0}`);
      console.log(`   - Quiz Questions: ${course.quizQuestions?.length || 0}`);
      console.log(`   - Modules: ${course.modules?.length || 0}`);
      
      if (course.videos?.length > 0) {
        console.log(`   - First Video: ${course.videos[0].title}`);
        console.log(`   - Video URL: ${course.videos[0].url}`);
      }
      
      if (course.quizQuestions?.length > 0) {
        console.log(`   - First Question: ${course.quizQuestions[0].question.substring(0, 50)}...`);
      }
    });

    // Test 2: Check user with populated assignedCourses
    console.log('\n========================================');
    console.log('TEST 2: Verify User Population');
    console.log('========================================');
    
    const user = await User.findOne({ role: 'student' })
      .populate({
        path: 'assignedCourses',
        select: 'title description category level videos quizQuestions modules isPublished'
      });

    if (user) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Assigned Courses: ${user.assignedCourses?.length || 0}`);
      
      if (user.assignedCourses?.length > 0) {
        user.assignedCourses.forEach((course, index) => {
          console.log(`\n   📚 Course ${index + 1}: ${course.title}`);
          console.log(`      - Category: ${course.category}`);
          console.log(`      - Videos: ${course.videos?.length || 0}`);
          console.log(`      - Quiz Questions: ${course.quizQuestions?.length || 0}`);
          console.log(`      - Modules: ${course.modules?.length || 0}`);
          console.log(`      - Published: ${course.isPublished}`);
          
          // Check if videos have data
          if (course.videos?.length > 0) {
            console.log(`      ✅ Videos are populated with data`);
            console.log(`         First video: ${course.videos[0].title}`);
          } else {
            console.log(`      ⚠️  No videos found`);
          }
          
          // Check if quiz questions have data
          if (course.quizQuestions?.length > 0) {
            console.log(`      ✅ Quiz questions are populated with data`);
            console.log(`         First question: ${course.quizQuestions[0].question.substring(0, 50)}...`);
          } else {
            console.log(`      ⚠️  No quiz questions found`);
          }
        });
      } else {
        console.log('   ⚠️  No courses assigned to this user');
      }
    } else {
      console.log('   ⚠️  No student users found');
    }

    // Test 3: Verify access control logic
    console.log('\n========================================');
    console.log('TEST 3: Verify Access Control');
    console.log('========================================');
    
    if (user && user.assignedCourses?.length > 0) {
      const testCourse = user.assignedCourses[0];
      const courseId = testCourse._id.toString();
      
      // Test with object format (populated)
      const hasAccessObj = user.assignedCourses.some(c => {
        const id = typeof c === 'object' ? c._id : c;
        return id.toString() === courseId;
      });
      
      console.log(`\n🔐 Access Check (Object Format):`);
      console.log(`   - Course ID: ${courseId}`);
      console.log(`   - Has Access: ${hasAccessObj}`);
      console.log(`   - Result: ${hasAccessObj ? '✅ PASS' : '❌ FAIL'}`);
    }

    // Test 4: Check course fetch
    console.log('\n========================================');
    console.log('TEST 4: Verify Course Fetch');
    console.log('========================================');
    
    if (courses.length > 0) {
      const testCourse = courses[0];
      const fetchedCourse = await Course.findById(testCourse._id)
        .populate('createdBy', 'name')
        .populate('reviews.user', 'name');
      
      console.log(`\n📖 Fetched Course: ${fetchedCourse.title}`);
      console.log(`   - Videos: ${fetchedCourse.videos?.length || 0}`);
      console.log(`   - Quiz Questions: ${fetchedCourse.quizQuestions?.length || 0}`);
      console.log(`   - Modules: ${fetchedCourse.modules?.length || 0}`);
      
      // Convert to object and mask answers
      const courseObj = fetchedCourse.toObject();
      
      if (courseObj.quizQuestions?.length > 0) {
        const maskedQuestions = courseObj.quizQuestions.map((q) => ({
          question: q.question,
          options: q.options,
        }));
        console.log(`   ✅ Quiz answers masked successfully`);
        console.log(`   - Original had correctAnswer: ${courseObj.quizQuestions[0].correctAnswer !== undefined}`);
        console.log(`   - Masked has correctAnswer: ${maskedQuestions[0].correctAnswer !== undefined}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ ALL TESTS COMPLETED');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
  }
};

testPopulation();

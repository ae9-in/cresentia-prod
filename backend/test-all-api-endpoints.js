import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

const API_URL = process.env.CLIENT_URL?.replace('5173', '5000') || 'http://localhost:5000';
const BASE_URL = `${API_URL}/api`;

let adminToken = '';
let userToken = '';
let testUserId = '';
let testCourseId = '';

console.log('\n========================================');
console.log('🧪 TESTING ALL API ENDPOINTS');
console.log('========================================');
console.log('API URL:', BASE_URL);
console.log('========================================\n');

// Helper function to test endpoint
async function testEndpoint(name, method, url, data = null, token = null, expectSuccess = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   ${method.toUpperCase()} ${url}`);

    const response = await axios(config);
    
    if (expectSuccess) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`   📊 Returned ${response.data.length} items`);
        } else if (response.data.message) {
          console.log(`   💬 ${response.data.message}`);
        }
      }
      return { success: true, data: response.data };
    }
  } catch (error) {
    if (!expectSuccess) {
      console.log(`   ✅ EXPECTED ERROR (${error.response?.status || 'Network Error'})`);
      return { success: false, error: error.response?.data };
    }
    console.log(`   ❌ FAILED (${error.response?.status || 'Network Error'})`);
    if (error.response?.data?.message) {
      console.log(`   💬 ${error.response.data.message}`);
    }
    return { success: false, error: error.response?.data };
  }
}

async function runTests() {
  console.log('\n📋 TEST SUITE 1: AUTHENTICATION');
  console.log('================================\n');

  // Test 1: Admin Login
  const adminLogin = await testEndpoint(
    'Admin Login',
    'post',
    '/auth/login',
    { email: 'admin@gmail.com', password: 'admin123' }
  );
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.token;
    console.log('   🔑 Admin token obtained');
  }

  // Test 2: User Login
  const userLogin = await testEndpoint(
    'User Login',
    'post',
    '/auth/login',
    { email: 'jishnunreddy@gmail.com', password: 'password123' }
  );
  
  if (userLogin.success) {
    userToken = userLogin.data.token;
    testUserId = userLogin.data.user._id;
    console.log('   🔑 User token obtained');
    console.log('   👤 User ID:', testUserId);
  }

  // Test 3: Get Current User (Admin)
  await testEndpoint(
    'Get Current User (Admin)',
    'get',
    '/auth/me',
    null,
    adminToken
  );

  // Test 4: Get Current User (User)
  await testEndpoint(
    'Get Current User (User)',
    'get',
    '/auth/me',
    null,
    userToken
  );

  console.log('\n📋 TEST SUITE 2: COURSE MANAGEMENT');
  console.log('===================================\n');

  // Test 5: Get All Courses (Public)
  const coursesResponse = await testEndpoint(
    'Get All Courses',
    'get',
    '/courses'
  );
  
  if (coursesResponse.success && coursesResponse.data.length > 0) {
    testCourseId = coursesResponse.data[0]._id;
    console.log('   📚 Test Course ID:', testCourseId);
  }

  // Test 6: Get Single Course
  if (testCourseId) {
    await testEndpoint(
      'Get Single Course',
      'get',
      `/courses/${testCourseId}`
    );
  }

  // Test 7: Create Course (Admin)
  const newCourse = await testEndpoint(
    'Create Course (Admin)',
    'post',
    '/courses',
    {
      title: 'Test Course API',
      description: 'Testing API endpoint',
      category: 'IT',
      level: 'Beginner',
      videos: [
        { title: 'Intro', url: 'https://test.com/video.mp4', durationMinutes: 10 }
      ],
      quizQuestions: []
    },
    adminToken
  );

  let createdCourseId = null;
  if (newCourse.success) {
    createdCourseId = newCourse.data._id;
  }

  console.log('\n📋 TEST SUITE 3: ENROLLMENT MANAGEMENT');
  console.log('=======================================\n');

  // Test 8: Get User Enrollments
  await testEndpoint(
    'Get User Enrollments',
    'get',
    '/enrollments',
    null,
    userToken
  );

  // Test 9: Enroll in Course
  if (testCourseId) {
    await testEndpoint(
      'Enroll in Course',
      'post',
      `/enrollments/${testCourseId}`,
      null,
      userToken
    );
  }

  // Test 10: Update Video Progress
  if (testCourseId) {
    await testEndpoint(
      'Update Video Progress',
      'patch',
      `/enrollments/${testCourseId}/video-progress`,
      { videoIndex: 0 },
      userToken
    );
  }

  console.log('\n📋 TEST SUITE 4: ADMIN USER MANAGEMENT');
  console.log('=======================================\n');

  // Test 11: Get All Users (Admin)
  await testEndpoint(
    'Get All Users (Admin)',
    'get',
    '/admin/users',
    null,
    adminToken
  );

  // Test 12: Get Admin Stats
  await testEndpoint(
    'Get Admin Stats',
    'get',
    '/admin/stats',
    null,
    adminToken
  );

  // Test 13: Create User (Admin)
  const newUser = await testEndpoint(
    'Create User (Admin)',
    'post',
    '/admin/users',
    {
      name: 'API Test User',
      email: 'apitest@example.com',
      password: 'test123',
      role: 'user'
    },
    adminToken
  );

  let createdUserId = null;
  if (newUser.success) {
    createdUserId = newUser.data._id;
  }

  console.log('\n📋 TEST SUITE 5: COURSE ASSIGNMENT');
  console.log('===================================\n');

  // Test 14: Assign Course to User
  if (testUserId && testCourseId) {
    await testEndpoint(
      'Assign Course to User',
      'post',
      `/admin/users/${testUserId}/assign-course`,
      { courseId: testCourseId },
      adminToken
    );
  }

  // Test 15: Remove Course from User
  if (createdUserId && testCourseId) {
    // First assign
    await testEndpoint(
      'Assign Course (for removal test)',
      'post',
      `/admin/users/${createdUserId}/assign-course`,
      { courseId: testCourseId },
      adminToken
    );

    // Then remove
    await testEndpoint(
      'Remove Course from User',
      'post',
      `/admin/users/${createdUserId}/remove-course`,
      { courseId: testCourseId },
      adminToken
    );
  }

  console.log('\n📋 TEST SUITE 6: USER STATUS MANAGEMENT');
  console.log('========================================\n');

  // Test 16: Toggle User Status
  if (createdUserId) {
    await testEndpoint(
      'Toggle User Status (Deactivate)',
      'patch',
      `/admin/users/${createdUserId}/toggle-status`,
      null,
      adminToken
    );

    await testEndpoint(
      'Toggle User Status (Activate)',
      'patch',
      `/admin/users/${createdUserId}/toggle-status`,
      null,
      adminToken
    );
  }

  // Test 17: Update User
  if (createdUserId) {
    await testEndpoint(
      'Update User',
      'put',
      `/admin/users/${createdUserId}`,
      {
        name: 'API Test User Updated',
        email: 'apitest@example.com',
        role: 'user'
      },
      adminToken
    );
  }

  console.log('\n📋 TEST SUITE 7: COURSE PUBLISHING');
  console.log('===================================\n');

  // Test 18: Toggle Course Publish Status
  if (createdCourseId) {
    await testEndpoint(
      'Toggle Course Publish (Publish)',
      'patch',
      `/admin/courses/${createdCourseId}/toggle-publish`,
      null,
      adminToken
    );

    await testEndpoint(
      'Toggle Course Publish (Unpublish)',
      'patch',
      `/admin/courses/${createdCourseId}/toggle-publish`,
      null,
      adminToken
    );
  }

  console.log('\n📋 TEST SUITE 8: CLEANUP');
  console.log('=========================\n');

  // Test 19: Delete Test User
  if (createdUserId) {
    await testEndpoint(
      'Delete Test User',
      'delete',
      `/admin/users/${createdUserId}`,
      null,
      adminToken
    );
  }

  // Test 20: Delete Test Course
  if (createdCourseId) {
    await testEndpoint(
      'Delete Test Course',
      'delete',
      `/admin/courses/${createdCourseId}`,
      null,
      adminToken
    );
  }

  console.log('\n📋 TEST SUITE 9: ERROR HANDLING');
  console.log('=================================\n');

  // Test 21: Unauthorized Access
  await testEndpoint(
    'Unauthorized Access to Admin Route',
    'get',
    '/admin/users',
    null,
    null,
    false
  );

  // Test 22: Invalid Login
  await testEndpoint(
    'Invalid Login Credentials',
    'post',
    '/auth/login',
    { email: 'invalid@example.com', password: 'wrongpassword' },
    null,
    false
  );

  // Test 23: Access Non-existent Course
  await testEndpoint(
    'Access Non-existent Course',
    'get',
    '/courses/000000000000000000000000',
    null,
    null,
    false
  );

  console.log('\n========================================');
  console.log('✅ ALL API TESTS COMPLETE');
  console.log('========================================\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});

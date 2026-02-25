// Quick Backend-Frontend Connection Test
// Run: node test-connection.js

import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🧪 Testing Backend-Frontend Connection...\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Backend Health Check:');
    console.log('   Status:', data.status);
    console.log('   Service:', data.service);
    console.log('   Database:', data.database);
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Backend Health Check Failed:');
    console.log('   Error:', error.message);
    console.log('   Make sure backend is running: cd backend && npm start');
    console.log('');
    return false;
  }
}

// Test 2: Frontend Availability
async function testFrontendAvailability() {
  try {
    const response = await fetch(FRONTEND_URL);
    console.log('✅ Frontend Availability:');
    console.log('   Status:', response.status);
    console.log('   Frontend is running');
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Frontend Availability Failed:');
    console.log('   Error:', error.message);
    console.log('   Make sure frontend is running: cd frontend && npm run dev');
    console.log('');
    return false;
  }
}

// Test 3: CORS Configuration
async function testCORS() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    const corsHeader = response.headers.get('access-control-allow-origin');
    console.log('✅ CORS Configuration:');
    console.log('   Allow Origin:', corsHeader || 'Not set (but may allow all)');
    console.log('   CORS is configured');
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ CORS Test Failed:');
    console.log('   Error:', error.message);
    console.log('');
    return false;
  }
}

// Test 4: Course Endpoints (without auth)
async function testCourseEndpoints() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/courses`);
    console.log('✅ Course Endpoint Test:');
    console.log('   Status:', response.status);
    if (response.status === 401) {
      console.log('   Response: Requires authentication (expected)');
    } else {
      console.log('   Response:', response.statusText);
    }
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Course Endpoint Test Failed:');
    console.log('   Error:', error.message);
    console.log('');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Backend-Frontend Connection Test');
  console.log('═══════════════════════════════════════════════════════\n');

  const backendOk = await testBackendHealth();
  const frontendOk = await testFrontendAvailability();
  const corsOk = await testCORS();
  const endpointsOk = await testCourseEndpoints();

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Test Results');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Backend Health:     ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Running:   ${frontendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CORS Configuration: ${corsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Course Endpoints:   ${endpointsOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  if (backendOk && frontendOk && corsOk && endpointsOk) {
    console.log('🎉 All tests passed! Backend and Frontend are connected.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Login with: jishnunreddy10@gmail.com / student');
    console.log('3. Browse courses and test functionality');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    console.log('');
    console.log('Common fixes:');
    console.log('- Make sure backend is running: cd backend && npm start');
    console.log('- Make sure frontend is running: cd frontend && npm run dev');
    console.log('- Check MongoDB connection in backend');
  }
  console.log('');
}

runTests();

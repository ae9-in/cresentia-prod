# ✅ COURSE LOADING & ROUTING FIX

## 🎯 Problem

Course appears in dashboard (e.g., "Cloud Deployment Basics"), but clicking "Start Course" does not load the course content.

## 🔍 Current Status

### ✅ What's Already Working

1. **Routing is Correct**
   - Route exists: `/courses/:id` → `CourseDetailPage`
   - Route order is correct (specific routes before dynamic)
   - Protected route wrapper is in place

2. **Navigation is Correct**
   - DashboardPage uses `<Link to={`/courses/${item.course?._id}`}>`
   - URL changes correctly when clicked

3. **Backend Route Exists**
   - `GET /api/courses/:id` is defined
   - Route is protected with auth middleware
   - Controller function `getCourseById` exists

4. **Loading States Handled**
   - Shows loading spinner while fetching
   - Shows error message if course not found
   - Proper error handling in try/catch

5. **Data Population Fixed**
   - Auth middleware populates assignedCourses
   - Login returns populated courses
   - Course fetch returns full data with videos/assessments

### 🔍 Potential Issues

1. **TEST_MODE is Enabled**
   - Currently bypassing access checks
   - Should be disabled for production

2. **Access Control Timing**
   - Access check happens before course loads
   - May cause issues if user data is stale

3. **Error Messages Not Displayed**
   - Error state sets message but may not show it

## 🛠 Step-by-Step Troubleshooting

### Step 1: Check Browser Console

Open DevTools (F12) and check for:

```javascript
// Look for these logs:
🎯 CourseDetailPage Component Mounted
📋 Course ID from URL: [id]
🔄 Fetching Course Data
✅ Course Data Received
📖 Course Title: [title]
```

**If you see**:
- ❌ Error Fetching Course → Backend issue
- ❌ 403 Forbidden → Access control issue
- ❌ 404 Not Found → Course doesn't exist
- ❌ Network Error → Backend not running

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Click "Start Course"
3. Look for request to `/api/courses/[id]`

**Check**:
- Status Code: Should be 200
- Response: Should have course data with videos
- Request Headers: Should have Authorization token

**Common Issues**:
- 401 Unauthorized → Token missing or invalid
- 403 Forbidden → User doesn't have access
- 404 Not Found → Course ID is wrong
- 500 Server Error → Backend crash

### Step 3: Verify Course ID

In browser console, run:
```javascript
// Check if course ID is valid
const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
console.log('Enrollments:', enrollments);

// Check course IDs
enrollments.forEach(e => {
  console.log('Course:', e.course?.title, 'ID:', e.course?._id);
});
```

### Step 4: Check Backend Logs

In backend terminal, look for:
```
========================================
🔍 GET /courses/:id called
========================================
📋 Course ID from params: [id]
✅ Course found: [title]
📖 Videos count: X
📖 Quiz questions count: Y
✅ Access granted, returning course data
========================================
```

**If you see**:
- ❌ Invalid ObjectId format → ID is malformed
- ❌ Course not found → Course was deleted
- 🚫 Access denied → User not assigned to course

### Step 5: Test Direct API Call

In browser console:
```javascript
// Get token
const token = localStorage.getItem('token');

// Get a course ID from dashboard
const enrollments = await fetch('http://localhost:5000/api/enrollments', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

const courseId = enrollments[0]?.course?._id;
console.log('Testing course ID:', courseId);

// Try to fetch course
const course = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log('Course data:', course);
console.log('Has videos:', course.videos?.length);
console.log('Has quiz questions:', course.quizQuestions?.length);
```

## 🔧 Common Fixes

### Fix 1: Disable TEST_MODE

In `frontend/src/pages/CourseDetailPage.jsx`:

```javascript
// Change this:
const TEST_MODE = true; // TEMPORARILY ENABLED FOR TESTING

// To this:
const TEST_MODE = false; // Production mode
```

### Fix 2: Ensure Backend is Running

```bash
cd backend
npm start

# Should see:
# ✅ MongoDB connected
# ✅ Server running on port 5000
```

### Fix 3: Clear Cache and Re-login

```javascript
// In browser console:
localStorage.clear();
window.location.reload();

// Then login again
```

### Fix 4: Verify Course Exists in Database

```bash
cd backend
node -e "
import('./models/Course.js').then(async ({ default: Course }) => {
  const mongoose = await import('mongoose');
  await mongoose.default.connect(process.env.MONGO_URI);
  const courses = await Course.find().select('title videos quizQuestions');
  courses.forEach(c => {
    console.log('Course:', c.title);
    console.log('  Videos:', c.videos?.length || 0);
    console.log('  Quiz Questions:', c.quizQuestions?.length || 0);
  });
  process.exit(0);
});
"
```

### Fix 5: Re-assign Course to User

If course exists but user can't access:

1. Login as admin
2. Go to Admin Panel → User Management
3. Find the user
4. Click "Manage Courses"
5. Assign the course again
6. Logout and login as student

## 🧪 Testing Checklist

### Test 1: Dashboard to Course Navigation
- [ ] Login as student
- [ ] Go to Dashboard
- [ ] See course in "Not Started" section
- [ ] Click "Start Course"
- [ ] URL changes to `/courses/[id]`
- [ ] Course page loads with title
- [ ] Videos are visible
- [ ] Enroll button appears

### Test 2: Direct URL Access
- [ ] Copy course URL: `/courses/[id]`
- [ ] Paste in browser
- [ ] Course page loads
- [ ] No blank screen
- [ ] No access denied (if assigned)

### Test 3: Course Content Visibility
- [ ] Course title displays
- [ ] Course description displays
- [ ] Category and level badges show
- [ ] Enroll button works
- [ ] After enrolling, videos appear
- [ ] Progress tracker shows

### Test 4: Error Handling
- [ ] Try invalid course ID: `/courses/invalid123`
- [ ] Should show "Course not found"
- [ ] Try deleted course ID
- [ ] Should show "Course not found"
- [ ] Try unassigned course (as student)
- [ ] Should show "Access Denied"

## 📊 Debug Commands

### Check User's Assigned Courses
```javascript
// In browser console after login:
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user.email);
console.log('Role:', user.role);
console.log('Assigned Courses:', user.assignedCourses);

// Check if courses are populated
if (user.assignedCourses?.length > 0) {
  const firstCourse = user.assignedCourses[0];
  console.log('First course type:', typeof firstCourse);
  console.log('Is object?', typeof firstCourse === 'object');
  console.log('Has title?', firstCourse.title);
  console.log('Has videos?', firstCourse.videos?.length);
}
```

### Check Enrollments
```javascript
// In browser console:
fetch('http://localhost:5000/api/enrollments', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(enrollments => {
  console.log('Total enrollments:', enrollments.length);
  enrollments.forEach(e => {
    console.log('Course:', e.course?.title);
    console.log('  ID:', e.course?._id);
    console.log('  Progress:', e.progressPercent + '%');
  });
});
```

### Test Course Fetch
```javascript
// Replace COURSE_ID with actual ID
const COURSE_ID = 'YOUR_COURSE_ID_HERE';

fetch(`http://localhost:5000/api/courses/${COURSE_ID}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(course => {
  console.log('Course:', course.title);
  console.log('Videos:', course.videos?.length);
  console.log('Quiz Questions:', course.quizQuestions?.length);
  console.log('Modules:', course.modules?.length);
  console.log('Published:', course.isPublished);
})
.catch(err => {
  console.error('Error:', err);
});
```

## 🎯 Expected Behavior

### When Everything Works:

1. **Click "Start Course" on Dashboard**
   - URL changes to `/courses/[id]`
   - Loading spinner appears briefly
   - Course page loads with full content

2. **Course Page Shows**:
   - Course title and description
   - Category and level badges
   - Learning outcomes (if available)
   - "Enroll Now" button (if not enrolled)
   - Progress tracker (if enrolled)
   - Video modules (if enrolled)

3. **Console Logs Show**:
   ```
   🎯 CourseDetailPage Component Mounted
   📋 Course ID from URL: 507f1f77bcf86cd799439011
   🔄 Fetching Course Data
   ✅ Course Data Received
   📖 Course Title: Cloud Deployment Basics
   📖 Videos count: 5
   📖 Quiz questions count: 10
   ```

4. **Network Tab Shows**:
   - Request: `GET /api/courses/[id]`
   - Status: 200 OK
   - Response: Full course object with videos

## 🚨 Common Error Messages

### "Course not found"
**Cause**: Course doesn't exist in database or was deleted
**Fix**: 
1. Check if course exists in admin panel
2. Re-create course if needed
3. Verify course ID is correct

### "Access Denied"
**Cause**: Student not assigned to course
**Fix**:
1. Login as admin
2. Assign course to student
3. Student should logout/login or refresh

### "Invalid course ID format"
**Cause**: Course ID is not a valid MongoDB ObjectId
**Fix**:
1. Check URL for typos
2. Verify course ID is 24 hex characters
3. Check if ID was copied correctly

### "Not authorized. Invalid token"
**Cause**: Token expired or invalid
**Fix**:
1. Logout and login again
2. Clear localStorage
3. Check if backend JWT_SECRET matches

### Network Error / Failed to fetch
**Cause**: Backend not running or wrong URL
**Fix**:
1. Start backend: `cd backend && npm start`
2. Check VITE_API_URL in frontend/.env
3. Verify backend is on port 5000

## ✅ Final Checklist

Before reporting issue as unfixed:

- [ ] Backend is running (`npm start` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] User is logged in (check localStorage for token)
- [ ] User has courses assigned (check admin panel)
- [ ] Course exists in database (check admin panel)
- [ ] Course is published (check admin panel)
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 response for course fetch
- [ ] TEST_MODE is enabled for testing (or disabled for production)

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ Click "Start Course" → Course page loads immediately
2. ✅ Course title and description visible
3. ✅ Can enroll in course
4. ✅ After enrolling, videos appear
5. ✅ Progress tracker shows
6. ✅ No blank screens
7. ✅ No error messages
8. ✅ Console logs show successful fetch
9. ✅ Network tab shows 200 OK response

## 📞 Still Not Working?

If course still doesn't load after all checks:

1. **Capture Screenshots**:
   - Browser console (F12 → Console)
   - Network tab (F12 → Network)
   - Course page (what you see)

2. **Capture Logs**:
   - Backend terminal output
   - Frontend terminal output

3. **Provide Details**:
   - What happens when you click "Start Course"?
   - Does URL change?
   - What error message do you see?
   - What's in browser console?
   - What's in network tab?

4. **Run Test Script**:
   ```bash
   cd backend
   node test-course-population.js
   ```
   Share the output.

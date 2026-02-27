# 🔧 Dashboard Showing "No Courses Yet" - Troubleshooting Guide

## Problem
Dashboard shows:
- 0% Overall Progress
- 0 Courses Enrolled
- 0 Completed
- "No courses yet" message

But database has 6 courses assigned and 6 enrollments.

## ✅ Database Status (Verified)
```
User: jishnunreddy@gmail.com
Assigned Courses: 6
Enrollments: 6
Sync Status: ✅ PERFECT
```

## 🔍 Troubleshooting Steps

### Step 1: Verify You're Logged In as Correct User

1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `sessionStorage.getItem('user')`
4. Press Enter

**Expected Output**:
```json
{
  "_id": "69a13bad01cc1773d51e4474",
  "email": "jishnunreddy@gmail.com",
  "name": "Jishnu Reddy",
  "role": "user",
  "assignedCourses": [...]
}
```

**If you see `null` or different email**:
- ❌ You're not logged in or logged in as wrong user
- 🔧 Solution: Logout and login again with `jishnunreddy@gmail.com` / `password123`

---

### Step 2: Check Browser Console for Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the dashboard page
4. Look for these logs:

**Expected Logs**:
```
🔄 Initial load - DashboardPage mounted
🔄 Loading enrollments for user: jishnunreddy@gmail.com
✅ Enrollments loaded: 6
📊 Stats: { total: 6, inProgress: 0, completed: 0, avgProgress: 0 }
```

**If you see errors**:
- ❌ `401 Unauthorized` → Token expired, logout and login again
- ❌ `403 Forbidden` → User doesn't have access
- ❌ `Network Error` → Backend server not running
- ❌ `CORS Error` → API URL misconfigured

---

### Step 3: Check Network Tab for API Call

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the dashboard page
4. Look for request to `/api/enrollments`

**Click on the request and check**:

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- ✅ Should have Authorization header with token
- ❌ If missing, token not being sent

**Response**:
- Status: `200 OK` ✅
- Status: `401 Unauthorized` ❌ → Token invalid
- Status: `403 Forbidden` ❌ → Access denied
- Status: `500 Internal Server Error` ❌ → Backend error

**Response Body** (should be array of 6 enrollments):
```json
[
  {
    "_id": "69a13bad01cc1773d51e44bc",
    "student": "69a13bad01cc1773d51e4474",
    "course": {
      "_id": "69a13b20f41cc95ad75b00c9",
      "title": "Full Stack Web Fundamentals",
      ...
    },
    "progressPercent": 0,
    "completedVideos": []
  },
  ...
]
```

---

### Step 4: Check Backend Server is Running

1. Open terminal
2. Check if backend is running on port 5000
3. Try accessing: `http://localhost:5000/api/courses`

**If backend not running**:
```bash
cd backend
npm start
```

---

### Step 5: Check API URL Configuration

**Frontend .env file** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

**Verify in browser console**:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should output: `http://localhost:5000/api`

---

### Step 6: Clear Browser Cache and Storage

1. Open DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Clear:
   - ✅ Local Storage
   - ✅ Session Storage
   - ✅ Cookies
4. Refresh page
5. Login again

---

### Step 7: Check Token Validity

**In browser console**:
```javascript
const token = sessionStorage.getItem('token');
console.log('Token:', token);
console.log('Token length:', token?.length);
```

**Expected**:
- Token should be a long string (JWT)
- Length should be > 100 characters

**If token is null or invalid**:
- Logout and login again

---

### Step 8: Test API Call Manually

**In browser console** (while on dashboard):
```javascript
// Get token
const token = sessionStorage.getItem('token');

// Make API call
fetch('http://localhost:5000/api/enrollments', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('Enrollments:', data))
.catch(err => console.error('Error:', err));
```

**Expected Output**:
```
Enrollments: Array(6) [ {...}, {...}, ... ]
```

**If you get error**:
- Check the error message
- Verify backend is running
- Verify token is valid

---

## 🔧 Quick Fixes

### Fix 1: Logout and Login Again
```
1. Click Logout
2. Login with: jishnunreddy@gmail.com / password123
3. Go to Dashboard
4. Should see 6 courses
```

### Fix 2: Clear Storage and Retry
```
1. Open DevTools → Application → Clear Storage
2. Click "Clear site data"
3. Refresh page
4. Login again
5. Go to Dashboard
```

### Fix 3: Restart Backend Server
```bash
# Stop backend (Ctrl+C)
cd backend
npm start
```

### Fix 4: Restart Frontend Server
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

### Fix 5: Re-sync Database
```bash
node backend/sync-all-enrollments.js
```

---

## 🧪 Test API Endpoint Directly

### Using curl:
```bash
# Get token first by logging in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jishnunreddy@gmail.com","password":"password123"}'

# Copy the token from response, then:
curl http://localhost:5000/api/enrollments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:
1. POST `http://localhost:5000/api/auth/login`
   - Body: `{"email":"jishnunreddy@gmail.com","password":"password123"}`
   - Copy token from response

2. GET `http://localhost:5000/api/enrollments`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Should return 6 enrollments

---

## 🎯 Most Common Issues

### Issue 1: Wrong User Logged In
**Symptom**: Dashboard shows 0 courses
**Check**: `sessionStorage.getItem('user')` shows different email
**Fix**: Logout and login as jishnunreddy@gmail.com

### Issue 2: Token Expired
**Symptom**: 401 Unauthorized error in console
**Check**: Network tab shows 401 response
**Fix**: Logout and login again

### Issue 3: Backend Not Running
**Symptom**: Network Error in console
**Check**: Can't access http://localhost:5000
**Fix**: Start backend server

### Issue 4: CORS Error
**Symptom**: CORS policy error in console
**Check**: API URL mismatch
**Fix**: Check frontend .env file

### Issue 5: Database Out of Sync
**Symptom**: Database has courses but API returns empty
**Check**: Run `node backend/diagnose-jishnu.js`
**Fix**: Run `node backend/sync-all-enrollments.js`

---

## ✅ Success Checklist

After fixing, you should see:
- ✅ Dashboard shows "6" in Courses Enrolled
- ✅ Dashboard shows "0%" in Overall Progress (correct, no videos watched yet)
- ✅ Dashboard shows "0" in Completed
- ✅ "Your Courses" section shows 6 course cards
- ✅ Each course shows "Not Started" status
- ✅ No console errors
- ✅ Network tab shows 200 OK for /api/enrollments

---

## 🆘 Still Not Working?

### Check Backend Logs
Look at backend terminal for errors when API is called

### Check Frontend Console
Look for any JavaScript errors

### Verify Database
```bash
node backend/diagnose-jishnu.js
```

### Re-setup User
```bash
node backend/setup-test-user.js
```

### Contact Support
Provide:
1. Screenshot of browser console
2. Screenshot of Network tab
3. Output of `node backend/diagnose-jishnu.js`
4. Backend terminal logs

---

## 💡 Prevention

To avoid this issue in future:
1. Always check browser console for errors
2. Verify you're logged in as correct user
3. Keep backend server running
4. Don't manually edit sessionStorage
5. Use logout button instead of clearing storage manually

---

**Most likely fix**: Logout and login again! 🔄

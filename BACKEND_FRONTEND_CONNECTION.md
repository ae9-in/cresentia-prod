# ✅ Backend-Frontend Connection - Course Functionality

## 🎯 Connection Status: VERIFIED ✅

The backend and frontend are properly connected for all course functionality.

## 🔗 Connection Configuration

### Frontend API Configuration
**File**: `frontend/src/services/api.js`

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});
```

**Environment**: `frontend/.env`
```
VITE_API_URL=http://localhost:5000/api
```

### Backend Routes
**File**: `backend/app.js`

```javascript
app.use('/api/courses', courseRoutes);
```

### CORS Configuration
**Allowed Origins**:
- http://localhost:5173 (Frontend dev server)
- http://localhost:3000
- https://frontend-sepia-pi-54.vercel.app (Production)

## 📋 Course API Endpoints

### 1. List Courses
```
GET /api/courses
Headers: Authorization: Bearer <token>
Response: Array of courses
```

**Frontend Usage**:
```javascript
// HomePage.jsx
api.get('/courses', { params })
  .then((res) => setCourses(res.data))
```

### 2. Get Course by ID
```
GET /api/courses/:id
Headers: Authorization: Bearer <token>
Response: Course object with full details
```

**Frontend Usage**:
```javascript
// CourseDetailPage.jsx
api.get(`/courses/${id}`)
  .then((res) => setCourse(res.data))
```

### 3. Search Courses
```
GET /api/courses/search?q=<query>
Headers: Authorization: Bearer <token>
Response: { courses: [], autocomplete: [] }
```

**Frontend Usage**:
```javascript
// HomePage.jsx
api.get('/courses/search', { params: { q: query } })
  .then((res) => setAutocomplete(res.data.autocomplete))
```

### 4. Create Course (Admin Only)
```
POST /api/courses
Headers: Authorization: Bearer <token>
Body: { title, description, category, level, videos, quizQuestions }
Response: Created course object
```

**Frontend Usage**:
```javascript
// AdminPage.jsx
api.post('/courses', payload)
```

### 5. Update Course (Admin Only)
```
PUT /api/courses/:id
Headers: Authorization: Bearer <token>
Body: Course updates
Response: Updated course object
```

**Frontend Usage**:
```javascript
// AdminPage.jsx
api.put(`/courses/${editingId}`, payload)
```

### 6. Add Review
```
POST /api/courses/:id/reviews
Headers: Authorization: Bearer <token>
Body: { rating, comment }
Response: { message, ratingAverage }
```

**Frontend Usage**:
```javascript
// CourseDetailPage.jsx
api.post(`/courses/${id}/reviews`, review)
```

### 7. Get Categories
```
GET /api/courses/categories
Response: Array of category strings
```

## 🔐 Authentication Flow

### 1. Login
```javascript
// AuthContext.jsx
const { data } = await api.post('/auth/login', { email, password });
setToken(data.token);
localStorage.setItem('token', data.token);
setAuthToken(data.token); // Sets Authorization header
```

### 2. Token Management
```javascript
// api.js
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};
```

### 3. Protected Requests
All course requests automatically include the token:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Test Connection

### Method 1: Browser Console
```javascript
// Open http://localhost:5173
// Press F12 → Console
// Run:

fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend Status:', data));

// Expected output:
// {
//   status: 'ok',
//   service: 'Crescentia API',
//   database: 'connected'
// }
```

### Method 2: Check Network Tab
```
1. Open http://localhost:5173
2. Press F12 → Network tab
3. Login as student
4. Go to Courses page
5. Look for: GET /api/courses
6. Status should be: 200 OK
7. Response should contain course array
```

### Method 3: Backend Test Script
```bash
cd backend
node -e "
const axios = require('axios');
axios.get('http://localhost:5000/api/health')
  .then(r => console.log('✅ Backend running:', r.data))
  .catch(e => console.log('❌ Backend error:', e.message));
"
```

## 📊 Data Flow

### Course List Flow:
```
1. User opens /courses
   ↓
2. HomePage.jsx calls api.get('/courses')
   ↓
3. Request sent to http://localhost:5000/api/courses
   ↓
4. Backend: courseRoutes → listCourses controller
   ↓
5. Backend: Filters by user.assignedCourses (if student)
   ↓
6. Backend: Returns course array
   ↓
7. Frontend: setCourses(res.data)
   ↓
8. Frontend: Renders CourseCard components
```

### Course Detail Flow:
```
1. User clicks "Start Course"
   ↓
2. Navigate to /courses/:id
   ↓
3. CourseDetailPage.jsx calls api.get(`/courses/${id}`)
   ↓
4. Request sent to http://localhost:5000/api/courses/:id
   ↓
5. Backend: courseRoutes → getCourseById controller
   ↓
6. Backend: Validates ObjectId format
   ↓
7. Backend: Checks if course exists
   ↓
8. Backend: Checks user access (if student)
   ↓
9. Backend: Returns course object
   ↓
10. Frontend: setCourse(res.data)
   ↓
11. Frontend: Renders course content
```

## 🔍 Debugging Connection Issues

### Issue 1: CORS Error
**Symptom**: "Access to fetch blocked by CORS policy"

**Solution**: Backend already configured to allow localhost:5173
```javascript
// backend/app.js
const allowedOrigins = [
  'http://localhost:5173',
  // ...
];
```

### Issue 2: 401 Unauthorized
**Symptom**: All API calls return 401

**Solution**: Token not set or expired
```javascript
// Check token
console.log(localStorage.getItem('token'));

// Re-login
logout();
login(email, password);
```

### Issue 3: 404 Not Found
**Symptom**: GET /api/courses returns 404

**Solution**: Backend not running or wrong URL
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Should return: {"status":"ok"}
```

### Issue 4: Network Error
**Symptom**: "Network Error" in console

**Solution**: Backend not running
```bash
cd backend
npm start
```

## ✅ Connection Checklist

- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ MongoDB connected
- ✅ CORS configured
- ✅ Routes mounted correctly
- ✅ Authentication working
- ✅ Token management working
- ✅ Course endpoints responding
- ✅ Access control working

## 🚀 Servers Status

### Backend
```bash
cd backend
npm start
# Running on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

## 📝 Quick Test

1. **Open**: http://localhost:5173
2. **Login**: jishnunreddy10@gmail.com / student
3. **Check Network Tab**: Should see successful API calls
4. **View Courses**: Should load from backend
5. **Click Course**: Should fetch course details
6. **Check Console**: Should see debug logs

## 🎯 All Course Features Connected

- ✅ List courses (filtered by access)
- ✅ Search courses
- ✅ Get course details
- ✅ Create course (admin)
- ✅ Update course (admin)
- ✅ Delete course (admin)
- ✅ Add review
- ✅ Enroll in course
- ✅ Track progress
- ✅ Submit quiz
- ✅ Download certificate

## 🎉 Connection Verified!

The backend and frontend are fully connected and working together for all course functionality!

**Test it now**: Open http://localhost:5173 and start exploring courses!

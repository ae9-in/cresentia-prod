# API Testing Guide

## Prerequisites
1. MongoDB Atlas connection string configured in `.env`
2. Backend server running on `http://localhost:5000`

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. You can log in now.",
  "userId": "507f1f77bcf86cd799439011",
  "isVerified": true
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isVerified": true
  }
}
```

---

### 3. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isVerified": true
  }
}
```

---

## Course Endpoints

### 4. List All Courses
**GET** `/api/courses`

**Query Parameters (optional):**
- `category`: Filter by category (IT, Business & Analytics, etc.)
- `level`: Filter by level (Beginner, Intermediate, Advanced)
- `q`: Search query

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript basics",
    "category": "IT",
    "level": "Beginner",
    "durationMinutes": 120,
    "ratingAverage": 4.5,
    "videos": [...],
    "reviews": [...]
  }
]
```

---

### 5. Get Course by ID
**GET** `/api/courses/:id`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript basics",
  "category": "IT",
  "level": "Beginner",
  "videos": [
    {
      "title": "Variables and Data Types",
      "url": "https://example.com/video1.mp4",
      "durationMinutes": 30
    }
  ],
  "quizQuestions": [
    {
      "question": "What is JavaScript?",
      "options": ["A language", "A framework", "A library", "A database"]
    }
  ]
}
```

---

### 6. Create Course (Admin/Instructor only)
**POST** `/api/courses`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "IT",
  "level": "Beginner",
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch",
  "videos": [
    {
      "title": "Python Basics",
      "url": "https://example.com/video1.mp4",
      "durationMinutes": 45
    }
  ],
  "quizQuestions": [
    {
      "question": "What is Python?",
      "options": ["A snake", "A programming language", "A framework", "A database"],
      "correctAnswer": 1
    }
  ]
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Introduction to Python",
  "category": "IT",
  "level": "Beginner",
  "createdBy": "507f1f77bcf86cd799439011",
  ...
}
```

---

## Enrollment Endpoints

### 7. Enroll in Course
**POST** `/api/enrollments/:courseId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "student": "507f1f77bcf86cd799439011",
  "course": "507f1f77bcf86cd799439012",
  "completedVideos": [],
  "quizScore": 0,
  "progressPercent": 0
}
```

---

### 8. Get My Enrollments
**GET** `/api/enrollments`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "student": "507f1f77bcf86cd799439011",
    "course": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Introduction to Python",
      ...
    },
    "progressPercent": 35,
    "completedVideos": [0, 1]
  }
]
```

---

## Postman Collection Setup

### Step 1: Create Environment
1. Open Postman
2. Click "Environments" → "Create Environment"
3. Name it "Learnera Local"
4. Add variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (leave empty, will be set after login)

### Step 2: Test Registration
1. Create new request: POST `{{base_url}}/auth/register`
2. Body → raw → JSON
3. Paste registration JSON
4. Send request
5. Verify 201 status

### Step 3: Test Login & Save Token
1. Create new request: POST `{{base_url}}/auth/login`
2. Body → raw → JSON
3. Paste login JSON
4. Send request
5. Copy the `token` from response
6. Go to Environment → Set `token` variable

### Step 4: Test Protected Routes
1. Create new request: GET `{{base_url}}/auth/me`
2. Headers → Add:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
3. Send request
4. Verify user data returned

---

## Common Error Responses

### 400 Bad Request
```json
{
  "message": "name, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized. Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Not found - /api/invalid-route"
}
```

### 409 Conflict
```json
{
  "message": "User with this email already exists"
}
```

---

## Quick Test Commands (using curl)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Get Courses
```bash
curl http://localhost:5000/api/courses
```

### Get Current User (replace TOKEN)
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

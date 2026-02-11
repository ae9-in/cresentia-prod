# Learnera

Learnera is a Coursera-like learning platform with authentication, role-based access, course streaming, assessments, progress tracking, reviews, search autocomplete, and completion certificate PDF download.

## Tech Stack

- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT
- Frontend: React + Vite, React Router, Context API

## Project Structure

- `backend/models`
- `backend/routes`
- `backend/controllers`
- `backend/middlewares`
- `backend/utils`
- `frontend/src/components`
- `frontend/src/pages`
- `frontend/src/context`
- `frontend/src/services`

## Features Implemented

- Sign up, login, logout
- Password hashing with bcrypt
- Email verification flow (SMTP supported; console fallback if SMTP is not configured)
- JWT auth + protected routes
- Roles: `student`, `admin`, `instructor`
- Course categories, listing, detail, search, filters, autocomplete
- Video lessons and assessment (15-minute timer in frontend)
- User enrollment and progress tracking
- Ratings and reviews
- Admin/Instructor panel for creating/updating courses
- Student dashboard
- Completion certificate download as `.pdf`
- Bonus: dark/light theme toggle

## Prerequisites

- Node.js 18+
- MongoDB running locally or remote MongoDB URI

## Environment Setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Set values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - Optional SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Set `VITE_API_URL` (default: `http://localhost:5000/api`)

## Install

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Seed Data

```bash
cd backend
npm run seed
```

Seed users:

- Admin: `admin@learnera.com` / `Admin@123`
- Instructor: `instructor@learnera.com` / `Instructor@123`
- Student: `student@learnera.com` / `Student@123`

## Run Application

### Start backend

```bash
cd backend
npm run dev
```

### Start frontend

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

## REST API Overview

### Auth

- `POST /api/auth/register`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Courses

- `GET /api/courses`
- `GET /api/courses/search?q=...&category=...&level=...`
- `GET /api/courses/categories`
- `GET /api/courses/:id`
- `POST /api/courses` (admin/instructor)
- `PUT /api/courses/:id` (admin/instructor)
- `POST /api/courses/:id/reviews`

### Enrollment

- `GET /api/enrollments`
- `POST /api/enrollments/:courseId`
- `PATCH /api/enrollments/:courseId/video-progress`
- `POST /api/enrollments/:courseId/quiz`
- `GET /api/enrollments/:courseId/certificate`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`

## Migrations

Mongoose schema-based models are used; no manual SQL migrations are required.

## Notes

- For email verification in local development without SMTP, verification URLs are logged in backend console.
- Sample videos use public demo URLs.

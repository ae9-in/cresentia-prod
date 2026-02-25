# Quick Start Guide - Crescentia LMS

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Installation

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin**: admin@gmail.com / admin
- **Student**: student@gmail.com / student (with 3 courses assigned)
- **24 Courses** across 4 categories

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Server runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

## First Login

### Admin Access
1. Navigate to http://localhost:5173
2. Login with: **admin@gmail.com** / **admin**
3. You'll be redirected to the Admin Panel
4. Explore the three tabs:
   - **Analytics**: System statistics
   - **Course Management**: Create/edit/delete courses
   - **User Management**: Manage users and course assignments

### Student Access
1. Logout from admin
2. Login with: **student@gmail.com** / **student**
3. You'll be redirected to the Student Dashboard
4. You'll see 3 assigned courses
5. Click on any course to start learning

## Key Features to Test

### As Admin:
✅ View system analytics
✅ Create new users
✅ Assign courses to students
✅ Activate/deactivate users
✅ Publish/unpublish courses
✅ Create/edit/delete courses
✅ Reset user progress
✅ View all courses (published and unpublished)

### As Student:
✅ View only assigned courses
✅ Enroll in courses
✅ Watch videos
✅ Complete modules
✅ Take assessments
✅ Track progress
✅ Download certificates (when course completed)

## Common Commands

### Backend
```bash
npm start          # Start development server
npm run seed       # Seed database with sample data
npm run clear      # Clear all database data
node check-db.js   # Check database connection
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Troubleshooting

### Issue: Cannot connect to MongoDB
**Solution**: 
- Check your `MONGO_URI` in `backend/.env`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Test connection with `node backend/check-db.js`

### Issue: Frontend shows "Network Error"
**Solution**:
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env`
- Verify CORS is enabled in backend

### Issue: Login fails with "Invalid email or password"
**Solution**:
- Run seed script: `npm run seed` in backend folder
- Use exact credentials: admin@gmail.com / admin

### Issue: Student sees no courses
**Solution**:
- Login as admin
- Go to User Management
- Click "Manage Courses" for the student
- Assign courses to the student

### Issue: "Account deactivated" error
**Solution**:
- Login as admin
- Go to User Management
- Find the user and click "Activate"

## Project Structure

```
crescentia/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth & error handling
│   ├── seed/            # Database seeding
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth context
│   │   └── services/    # API service
│   └── index.html
└── docs/                # Documentation
```

## API Endpoints

### Public
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/verify-email` - Verify email

### Student (Protected)
- GET `/api/courses` - List assigned courses
- GET `/api/courses/:id` - Get course details
- POST `/api/enrollments/:courseId` - Enroll in course
- GET `/api/enrollments` - Get my enrollments
- POST `/api/enrollments/:courseId/progress` - Update progress

### Admin Only (Protected)
- GET `/api/admin/stats` - System statistics
- GET `/api/admin/users` - List all users
- POST `/api/admin/users` - Create user
- PUT `/api/admin/users/:userId` - Update user
- DELETE `/api/admin/users/:userId` - Delete user
- PATCH `/api/admin/users/:userId/toggle-status` - Activate/deactivate
- POST `/api/admin/users/:userId/assign-course` - Assign course
- POST `/api/admin/users/:userId/remove-course` - Remove course
- POST `/api/admin/users/:userId/reset-progress` - Reset progress
- POST `/api/admin/courses` - Create course
- PUT `/api/admin/courses/:id` - Update course
- DELETE `/api/admin/courses/:id` - Delete course
- PATCH `/api/admin/courses/:courseId/toggle-publish` - Publish/unpublish

## Security Features

✅ JWT-based authentication
✅ Role-based access control (Admin/Student)
✅ Password hashing with bcrypt
✅ Protected API routes
✅ User activation/deactivation
✅ Course access validation
✅ Publish/unpublish control

## Next Steps

1. **Customize Branding**: Update colors, logo, and text in `frontend/src/styles.css`
2. **Add More Courses**: Use the admin panel to create courses
3. **Configure Email**: Set up email service for verification (optional)
4. **Deploy**: Follow `deploy-vercel.md` for deployment instructions
5. **Backup Database**: Set up regular MongoDB backups

## Support

For issues or questions:
1. Check `TESTING_CHECKLIST.md` for common test cases
2. Review `COMPLETE_ADMIN_SYSTEM.md` for system architecture
3. Check console logs for error messages
4. Verify environment variables are set correctly

## Production Deployment

Before deploying to production:
- [ ] Change JWT_SECRET to a strong random string
- [ ] Update MONGO_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Update VITE_API_URL to production API URL
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Remove or secure default admin account
- [ ] Test all features in production environment

---

**Happy Learning! 🎓**

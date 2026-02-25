# 🚀 DATABASE INJECTION & CONNECTION TEST

## What This Does

This script will:
- ✅ Test MongoDB connection
- ✅ Inject test data (users, courses, enrollments)
- ✅ Verify all data is properly connected
- ✅ Check that courses have videos and quiz questions
- ✅ Ensure student has access to courses
- ✅ Provide login credentials
- ❌ **NOT change any existing code**

## How to Run

### Step 1: Ensure MongoDB is Running

Make sure your MongoDB connection string is in `backend/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crescentia
```

### Step 2: Run the Script

```bash
cd backend
node inject-and-test-db.js
```

### Step 3: Read the Output

The script will show:
- 📡 Database connection status
- 📊 Existing data count
- 💉 Data injection progress
- 🎓 Course assignment status
- 🔍 Data verification
- 🧪 Access control tests
- 🔑 Login credentials
- ✅ Verification checklist

## What You'll Get

### Test Users Created:

**Admin:**
- Email: `admin@crescentia.com`
- Password: `admin123`

**Student:**
- Email: `student@crescentia.com`
- Password: `student123`

### Test Courses Created:

1. **Cloud Deployment Basics** (IT, Beginner)
   - 3 videos
   - 3 quiz questions
   - Published ✅

2. **Introduction to Data Analytics** (Business & Analytics, Beginner)
   - 3 videos
   - 2 quiz questions
   - Published ✅

3. **Effective Communication Skills** (Sales & Soft Skills, Intermediate)
   - 2 videos
   - 1 quiz question
   - Published ✅

All courses are:
- ✅ Assigned to student
- ✅ Have videos with YouTube URLs
- ✅ Have quiz questions
- ✅ Published and accessible
- ✅ Enrolled for student

## Expected Output

```
╔════════════════════════════════════════════════════════╗
║   DATABASE INJECTION & CONNECTION TEST                ║
╚════════════════════════════════════════════════════════╝

📡 STEP 1: Testing Database Connection
─────────────────────────────────────────────────────────
✅ Connected to MongoDB successfully

📊 STEP 2: Checking Existing Data
─────────────────────────────────────────────────────────
Users in database: X
Courses in database: Y
Enrollments in database: Z

💉 STEP 3: Injecting Test Data
─────────────────────────────────────────────────────────
✅ Admin user created: admin@crescentia.com
✅ Student user created: student@crescentia.com
✅ Course created: Cloud Deployment Basics
✅ Course created: Introduction to Data Analytics
✅ Course created: Effective Communication Skills

🎓 STEP 4: Assigning Courses to Student
─────────────────────────────────────────────────────────
✅ Assigned 3 courses to student@crescentia.com

📝 STEP 5: Creating Enrollments
─────────────────────────────────────────────────────────
✅ Enrollment created for: Cloud Deployment Basics
✅ Enrollment created for: Introduction to Data Analytics
✅ Enrollment created for: Effective Communication Skills

🔍 STEP 6: Verifying Data Integrity
─────────────────────────────────────────────────────────
Student Data:
  Name: Test Student
  Email: student@crescentia.com
  Assigned Courses: 3

Assigned Courses Details:
  1. Cloud Deployment Basics
     Videos: 3
     Quiz Questions: 3
     Published: ✅ YES

🧪 STEP 7: Testing Data Access Patterns
─────────────────────────────────────────────────────────
✅ Course fetched: Cloud Deployment Basics
✅ Videos: 3
✅ Quiz Questions: 3
✅ Student has access: YES
✅ Enrollments found: 3

🔑 STEP 8: Login Credentials
─────────────────────────────────────────────────────────
Admin Login:
  Email: admin@crescentia.com
  Password: admin123

Student Login:
  Email: student@crescentia.com
  Password: student123

✅ STEP 10: Verification Checklist
─────────────────────────────────────────────────────────
✅ Database connection
✅ Admin user created
✅ Student user created
✅ Courses created
✅ Courses have videos
✅ Courses have quiz questions
✅ Courses are published
✅ Courses assigned to student
✅ Enrollments created
✅ Data properly populated

╔════════════════════════════════════════════════════════╗
║                  🎉 ALL CHECKS PASSED! 🎉              ║
╚════════════════════════════════════════════════════════╝
```

## After Running

### If All Checks Pass ✅

1. Start backend:
   ```bash
   cd backend
   npm start
   ```

2. Start frontend (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser: `http://localhost:5173`

4. Login with student credentials:
   - Email: `student@crescentia.com`
   - Password: `student123`

5. Go to Dashboard

6. Click "Start Course" on any course

7. Course should load with videos and content!

### If Course Still Doesn't Load ❌

Run debug mode to see exactly what's wrong:

**Windows:**
```bash
enable-debug-mode.bat
```

**Linux/Mac:**
```bash
chmod +x enable-debug-mode.sh
./enable-debug-mode.sh
```

Then refresh browser and click "Start Course" - you'll see a GREEN DEBUG SCREEN showing exactly what's wrong.

## Troubleshooting

### Error: MONGO_URI not found
- Check `backend/.env` file exists
- Ensure `MONGO_URI` is set correctly
- Copy from `.env.example` if needed

### Error: Connection failed
- Check MongoDB cluster is running
- Verify connection string is correct
- Check network/firewall settings
- Ensure IP is whitelisted in MongoDB Atlas

### Error: Validation failed
- Check MongoDB models are correct
- Ensure all required fields are provided
- Review error message for details

### Script runs but courses don't load
- Backend might not be running
- Frontend might not be connected to backend
- Run debug mode to diagnose

## What This Script Does NOT Do

- ❌ Does NOT modify existing code
- ❌ Does NOT delete existing data
- ❌ Does NOT change configuration files
- ❌ Does NOT restart servers

It ONLY:
- ✅ Injects test data into database
- ✅ Verifies connections
- ✅ Checks data integrity
- ✅ Provides diagnostic information

## Re-running the Script

You can run this script multiple times safely. It will:
- Skip creating users/courses that already exist
- Update assignments if needed
- Show current state of database

## Clean Database (Optional)

If you want to start fresh:

```bash
cd backend
node clear-database.js  # If this script exists
# OR manually delete collections in MongoDB Atlas
```

Then run `inject-and-test-db.js` again.

## Next Steps

After successful injection:

1. ✅ Database has test data
2. ✅ Student has assigned courses
3. ✅ Courses have videos and quizzes
4. ✅ Everything is connected

Now test the application:
- Login as student
- View dashboard
- Click "Start Course"
- Verify course loads with videos

If it doesn't work, use debug mode to identify the exact issue!

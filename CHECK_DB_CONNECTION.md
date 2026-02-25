# 🔍 DATABASE CONNECTION CHECK (READ-ONLY)

## What This Does

This script **ONLY READS** from your database. It will:
- ✅ Test MongoDB connection
- ✅ Count users, courses, enrollments
- ✅ Show existing data
- ✅ Verify data relationships
- ✅ Provide health check summary
- ❌ **NOT make any changes**
- ❌ **NOT create or delete anything**
- ❌ **NOT modify any data**

## How to Run

```bash
cd backend
node check-db-connection.js
```

## What You'll See

### Step 1: Environment Variables
```
📋 STEP 1: Environment Variables
─────────────────────────────────────────────────────────
✅ MONGO_URI found
   mongodb+srv://username:****@cluster.mongodb.net/crescentia
```

### Step 2: Connection Test
```
🔌 STEP 2: Testing MongoDB Connection
─────────────────────────────────────────────────────────
✅ Connected successfully in 234ms
   Database: crescentia
   Host: cluster0.mongodb.net
```

### Step 3: Database Statistics
```
📊 STEP 3: Database Statistics (Read-Only)
─────────────────────────────────────────────────────────
Users: 5
Courses: 3
Enrollments: 8
```

### Step 4: User Accounts
```
👥 STEP 4: User Accounts
─────────────────────────────────────────────────────────
Found 5 user(s):

1. Admin User
   Email: admin@crescentia.com
   Role: admin
   Active: ✅
   Assigned Courses: 0

2. Test Student
   Email: student@crescentia.com
   Role: student
   Active: ✅
   Assigned Courses: 3
```

### Step 5: Courses
```
📚 STEP 5: Courses
─────────────────────────────────────────────────────────
Found 3 course(s):

1. Cloud Deployment Basics
   ID: 507f1f77bcf86cd799439011
   Category: IT
   Level: Beginner
   Published: ✅
   Videos: 3
   Quiz Questions: 3
```

### Step 6: Enrollments
```
📝 STEP 6: Enrollments
─────────────────────────────────────────────────────────
Found 8 enrollment(s):

1. Test Student → Cloud Deployment Basics
   Progress: 0%
   Completed Videos: 0
```

### Step 7: Data Relationships
```
🔗 STEP 7: Data Relationships
─────────────────────────────────────────────────────────
✅ Found student with courses: student@crescentia.com
   Assigned Courses: 3

   Course Details:
   1. Cloud Deployment Basics
      ID: 507f1f77bcf86cd799439011
      Published: ✅
      Videos: 3
      Quiz Questions: 3
      ✅ Course is properly populated
```

### Step 8: Health Check Summary
```
🏥 STEP 8: Health Check Summary
─────────────────────────────────────────────────────────

✅ Database Connection: Connected
✅ Users Exist: 5 users found
✅ Courses Exist: 3 courses found
✅ Courses Have Content: Courses have videos/quizzes
✅ Enrollments Exist: 8 enrollments found
✅ Student Has Courses: 3 courses assigned
✅ Courses Are Populated: Courses properly populated
```

### Step 9: Recommendations
```
💡 STEP 9: Recommendations
─────────────────────────────────────────────────────────
✅ All checks passed! Database is healthy.

📋 Next Steps:
   1. Start backend: cd backend && npm start
   2. Start frontend: cd frontend && npm run dev
   3. Login and test course access
```

## Possible Outcomes

### ✅ All Checks Pass
```
╔════════════════════════════════════════════════════════╗
║              ✅ DATABASE IS HEALTHY ✅                 ║
╚════════════════════════════════════════════════════════╝
```

**What this means:**
- Database is connected
- Data exists and is properly structured
- Courses have content
- Students have assigned courses
- Everything is ready to use

**Next steps:**
1. Start your servers
2. Login and test

### ⚠️ Database Needs Attention
```
╔════════════════════════════════════════════════════════╗
║         ⚠️  DATABASE NEEDS ATTENTION ⚠️               ║
╚════════════════════════════════════════════════════════╝
```

**What this means:**
- Database is connected
- But some data is missing or incomplete

**Common issues:**
- No users found → Run `node inject-and-test-db.js`
- No courses found → Run `node inject-and-test-db.js`
- Courses have no content → Add videos via admin panel
- No assigned courses → Run `node inject-and-test-db.js`

### ❌ Connection Failed
```
╔════════════════════════════════════════════════════════╗
║         ❌ DATABASE CONNECTION FAILED ❌               ║
╚════════════════════════════════════════════════════════╝
```

**What this means:**
- Cannot connect to MongoDB

**Troubleshooting:**
1. Check `backend/.env` has `MONGO_URI`
2. Verify MongoDB cluster is running
3. Check network/firewall settings
4. Ensure IP is whitelisted in MongoDB Atlas
5. Verify credentials are correct

## Common Issues

### Issue: MONGO_URI not found
```
❌ MONGO_URI not found in .env file

⚠️  Please check:
   1. backend/.env file exists
   2. MONGO_URI is set in .env
   3. Connection string is correct
```

**Fix:**
1. Create `backend/.env` file
2. Add: `MONGO_URI=mongodb+srv://...`
3. Copy from `.env.example` if needed

### Issue: No users found
```
⚠️  No users found in database
   Run: node inject-and-test-db.js to create test users
```

**Fix:**
```bash
cd backend
node inject-and-test-db.js
```

### Issue: No courses found
```
⚠️  No courses found in database
   Run: node inject-and-test-db.js to create test courses
```

**Fix:**
```bash
cd backend
node inject-and-test-db.js
```

### Issue: Courses have no content
```
⚠️  WARNING: Course has no content!
```

**Fix:**
1. Login as admin
2. Go to Admin Panel
3. Edit course
4. Add videos and quiz questions
5. Save

### Issue: Connection timeout
```
❌ ERROR CHECKING DATABASE:
Error: connect ETIMEDOUT
```

**Fix:**
1. Check internet connection
2. Verify MongoDB cluster is running
3. Check firewall settings
4. Whitelist your IP in MongoDB Atlas

## What This Script Does NOT Do

This script is **completely safe** and:
- ❌ Does NOT create users
- ❌ Does NOT create courses
- ❌ Does NOT create enrollments
- ❌ Does NOT modify any data
- ❌ Does NOT delete anything
- ❌ Does NOT change configuration

It ONLY:
- ✅ Reads existing data
- ✅ Counts documents
- ✅ Shows information
- ✅ Verifies connections
- ✅ Provides recommendations

## After Running

### If All Checks Pass ✅

Your database is ready! Now:

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the application:**
   - Open browser: `http://localhost:5173`
   - Login with credentials shown in output
   - Go to Dashboard
   - Click "Start Course"

### If Issues Found ⚠️

Follow the recommendations in Step 9 of the output.

Most common fix:
```bash
cd backend
node inject-and-test-db.js
```

This will create test data without affecting existing data.

### If Connection Failed ❌

1. Check `.env` file
2. Verify MongoDB connection string
3. Test connection in MongoDB Compass
4. Check MongoDB Atlas dashboard

## Quick Commands

### Just check connection:
```bash
cd backend
node check-db-connection.js
```

### Check and inject data if needed:
```bash
cd backend
node check-db-connection.js
# If issues found:
node inject-and-test-db.js
```

### Full diagnostic:
```bash
cd backend
node check-db-connection.js > db-check.log 2>&1
cat db-check.log
```

## Summary

This script is your **first step** in diagnosing database issues:

1. ✅ **Safe** - Only reads, never writes
2. ✅ **Fast** - Completes in seconds
3. ✅ **Comprehensive** - Checks everything
4. ✅ **Clear** - Shows exactly what's wrong
5. ✅ **Actionable** - Provides specific fixes

**Run it anytime to check your database health!**

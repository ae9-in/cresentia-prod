# 🚀 Quick Start Guide

## 1. Fix MongoDB Password (REQUIRED)

Edit `backend/.env`:
```env
MONGO_URI=mongodb+srv://jishnunreddy:YOUR_ACTUAL_PASSWORD@cluster0.3hsk1xx.mongodb.net/learnera?retryWrites=true&w=majority
```

Replace `YOUR_ACTUAL_PASSWORD` with your MongoDB Atlas password.

---

## 2. Start Server

```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
MongoDB connected: cluster0-shard-00-00.3hsk1xx.mongodb.net
```

---

## 3. Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

Expected response:
```json
{
  "message": "Registration successful. You can log in now.",
  "userId": "...",
  "isVerified": true
}
```

---

## 4. Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## 5. Test Protected Route

Copy the token from step 4, then:

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Success Indicators

- Server starts without errors
- MongoDB connection successful
- Registration returns 201 status
- Login returns JWT token
- Protected route returns user data

---

## 🐛 Common Issues

**"Not found - /auth/register"**
→ Use `/api/auth/register` (with `/api` prefix)

**"MONGO_URI is missing"**
→ Check `.env` file exists and has MONGO_URI

**"MongoServerError: bad auth"**
→ Update MongoDB password in `.env`

---

## 📖 Full Documentation

- Complete setup: `SETUP_COMPLETE.md`
- API testing: `API_TESTING_GUIDE.md`

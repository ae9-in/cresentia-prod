# 🚀 Deploy to Vercel - Quick Guide

## ✅ Your App is Vercel-Ready!

### What's Been Configured:
- ✅ Database connection with connection pooling
- ✅ Serverless function support
- ✅ Environment-aware OAuth URLs
- ✅ CORS for production
- ✅ Error handling

---

## 🎯 Deploy in 5 Steps

### Step 1: Prepare MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Network Access → Add IP: `0.0.0.0/0` (allow all)
3. Copy your connection string

### Step 2: Deploy Backend
```bash
cd backend
npx vercel
```

When prompted:
- Project name: `learnera-backend`
- Press Enter for defaults

### Step 3: Add Environment Variables

Via Vercel Dashboard (https://vercel.com/dashboard):
1. Select your project
2. Settings → Environment Variables
3. Add these:

```
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/learnera
JWT_SECRET = your-jwt-secret-key
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://your-frontend.vercel.app
GOOGLE_CLIENT_ID = your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-your-secret
```

### Step 4: Redeploy with Variables
```bash
npx vercel --prod
```

Copy your backend URL (e.g., `https://learnera-backend.vercel.app`)

### Step 5: Update Google OAuth
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Edit OAuth Client
4. Add redirect URI:
   ```
   https://your-backend.vercel.app/api/auth/google/callback
   ```

---

## 🧪 Test Deployment

```bash
# Test health
curl https://your-backend.vercel.app/api/health

# Test registration
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

---

## 📱 Deploy Frontend (Optional)

```bash
cd frontend
npx vercel
```

Add environment variable:
```
VITE_API_URL = https://your-backend.vercel.app/api
```

Then:
```bash
npx vercel --prod
```

---

## ✅ Success Checklist

- [ ] Backend deployed
- [ ] Environment variables added
- [ ] MongoDB IP whitelist updated
- [ ] Google OAuth redirect URI updated
- [ ] Health endpoint returns 200
- [ ] Can register user
- [ ] Can login
- [ ] Google OAuth works

---

## 🐛 Common Issues

**"MONGO_URI is missing"**
→ Add to Vercel environment variables and redeploy

**"redirect_uri_mismatch"**
→ Add production URL to Google Console

**"CORS error"**
→ Update CLIENT_URL to match frontend URL

---

That's it! Your backend is deployed and ready to use! 🎉

# 🚀 Vercel Deployment Guide

## ✅ Backend is Vercel-Ready

Your backend has been configured for Vercel deployment with:
- ✅ Serverless function support
- ✅ MongoDB connection pooling
- ✅ Environment-aware OAuth callback URLs
- ✅ CORS configuration
- ✅ Production error handling

---

## 📋 Pre-Deployment Checklist

### 1. Database Connection
- [ ] MongoDB Atlas cluster is running
- [ ] Database user has correct permissions
- [ ] IP whitelist includes `0.0.0.0/0` (allow all) for Vercel
- [ ] Connection string is ready
## 🚀 Deploy Backend to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Backend
```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **learnera-backend**
- Directory? **./backend** (or just press Enter)
- Override settings? **N**

### Step 4: Add Environment Variables

After deployment, add environment variables:

```bash
vercel env add MONGO_URI
# Paste: mongodb+srv://username:password@cluster.mongodb.net/learnera

vercel env add JWT_SECRET
# Paste: your-jwt-secret

vercel env add JWT_EXPIRES_IN
# Paste: 7d

vercel env add CLIENT_URL
# Paste: https://your-frontend.vercel.app

vercel env add GOOGLE_CLIENT_ID
# Paste: your-client-id.apps.googleusercontent.com

vercel env add GOOGLE_CLIENT_SECRET
# Paste: GOCSPX-your-secret
```

Or add them via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Update Frontend API URL

Edit `frontend/src/services/api.js` or wherever you define the API base URL:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.vercel.app/api';
```

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Step 2: Deploy Frontend
```bash
cd frontend
vercel
```

Follow prompts:
- Project name? **learnera-frontend**
- Build command? **npm run build**
- Output directory? **dist**

### Step 3: Add Frontend Environment Variables
```bash
vercel env add VITE_API_URL
# Paste: https://your-backend.vercel.app/api
```

### Step 4: Deploy to Production
```bash
vercel --prod
```

---

## 🔐 Update Google OAuth Redirect URIs

After deployment, update Google Cloud Console:

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add production redirect URI:
   ```
   https://your-backend.vercel.app/api/auth/google/callback
   ```
6. Keep localhost URI for development:
   ```
   http://localhost:5000/api/auth/google/callback
   ```

---

## 🔧 Update Backend Environment Variables

After getting your Vercel URLs, update:

```bash
# Update CLIENT_URL to point to frontend
vercel env add CLIENT_URL production
# Enter: https://your-frontend.vercel.app

# Redeploy
vercel --prod
```

---

## 🧪 Test Deployment

### Test Backend Health
```bash
curl https://your-backend.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","service":"Learnera API"}
```

### Test Registration
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

### Test Google OAuth
Open browser to:
```
https://your-backend.vercel.app/api/auth/google
```

Should redirect to Google login.

---

## 📊 MongoDB Atlas Configuration

### Allow Vercel IPs

1. Go to MongoDB Atlas
2. Network Access → IP Access List
3. Add IP Address: `0.0.0.0/0` (Allow from anywhere)
   - Or add specific Vercel IPs if you prefer

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/learnera?retryWrites=true&w=majority
```

---

## 🔄 Continuous Deployment

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/learnera.git
   git push -u origin main
   ```

2. Connect to Vercel:
   - Go to Vercel Dashboard
   - Import Git Repository
   - Select your repo
   - Configure:
     - Root Directory: `backend` (for backend)
     - Root Directory: `frontend` (for frontend)
   - Add environment variables
   - Deploy

3. Auto-deploy on push:
   - Every push to `main` triggers deployment
   - Pull requests get preview deployments

### Option 2: Manual Deployment

```bash
# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd frontend
vercel --prod
```

---

## 🐛 Troubleshooting

### Error: "MONGO_URI is missing"
- Add MONGO_URI to Vercel environment variables
- Redeploy: `vercel --prod`

### Error: "Function execution timeout"
- Vercel free tier has 10s timeout
- Optimize database queries
- Add indexes to MongoDB collections

### Error: "CORS policy"
- Update CLIENT_URL in backend env vars
- Check CORS configuration in `app.js`

### Error: "Google OAuth redirect_uri_mismatch"
- Add production callback URL to Google Console
- Format: `https://your-backend.vercel.app/api/auth/google/callback`

### Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check database user permissions

---

## 📁 Project Structure for Vercel

```
project/
├── backend/
│   ├── api/
│   │   └── index.js          # Serverless entry point
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── app.js                # Express app
│   ├── server.js             # Server entry
│   ├── vercel.json           # Vercel config
│   └── package.json
└── frontend/
    ├── src/
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🎯 Environment Variables Summary

### Backend (Vercel)
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.vercel.app
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
NODE_ENV=production
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added to both
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Google OAuth redirect URIs updated
- [ ] CLIENT_URL points to frontend
- [ ] VITE_API_URL points to backend
- [ ] Health endpoint working
- [ ] Registration working
- [ ] Login working
- [ ] Google OAuth working
- [ ] Protected routes working

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Google Cloud Console: https://console.cloud.google.com
- Vercel Docs: https://vercel.com/docs

---

## 💡 Tips

1. **Use Vercel CLI for faster deployments**
2. **Set up GitHub integration for auto-deploy**
3. **Use environment variables for all secrets**
4. **Monitor logs in Vercel Dashboard**
5. **Test in preview deployments before production**
6. **Keep localhost OAuth for development**

Your app is now ready for Vercel deployment! 🚀

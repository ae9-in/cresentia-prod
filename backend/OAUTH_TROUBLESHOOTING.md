# 🔧 Google OAuth Troubleshooting Guide

## 🚨 Common Errors & Solutions

### 1. redirect_uri_mismatch

**Error Message:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request, http://localhost:5000/api/auth/google/callback, does not match the ones authorized for the OAuth client.
```

**Root Causes:**

| Issue | Wrong | Correct |
|-------|-------|---------|
| Missing /api | `http://localhost:5000/auth/google/callback` | `http://localhost:5000/api/auth/google/callback` |
| Wrong port | `http://localhost:3000/api/auth/google/callback` | `http://localhost:5000/api/auth/google/callback` |
| Trailing slash | `http://localhost:5000/api/auth/google/callback/` | `http://localhost:5000/api/auth/google/callback` |
| HTTPS vs HTTP | `https://localhost:5000/api/auth/google/callback` | `http://localhost:5000/api/auth/google/callback` |

**Fix Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add EXACTLY:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
6. Click "Save"
7. **Wait 5 minutes** for changes to propagate
8. Try again

**Verify in Code:**

Check `backend/config/passport.js`:
```javascript
callbackURL: `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`
```

Check `backend/.env`:
```env
PORT=5000
```

---

### 2. invalid_client

**Error Message:**
```
Error 401: invalid_client
The OAuth client was not found.
```

**Root Causes:**
- Wrong Client ID in .env
- Wrong Client Secret in .env
- Extra spaces in .env values
- Using credentials from wrong project

**Fix Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to "APIs & Services" → "Credentials"
3. Find your OAuth 2.0 Client ID
4. Copy the Client ID (looks like: `123456789-abc.apps.googleusercontent.com`)
5. Click "Download JSON" or view Client Secret
6. Update `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret
   ```
7. **No spaces, no quotes**
8. Restart backend server

**Verify:**
```bash
cd backend
node -e "require('dotenv').config(); console.log('ID:', process.env.GOOGLE_CLIENT_ID); console.log('Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');"
```

---

### 3. access_denied

**Error Message:**
```
Error 403: access_denied
The user denied access to your application.
```

**Root Causes:**
- User clicked "Cancel" on Google consent screen
- User email not in test users list (for unverified apps)
- App not verified (for production)

**Fix Steps:**

For Development:
1. Go to Google Cloud Console
2. Go to "OAuth consent screen"
3. Scroll to "Test users"
4. Click "Add Users"
5. Add your email address
6. Try login again

For Production:
1. Complete OAuth consent screen verification
2. Submit app for verification
3. Or keep in testing mode with specific test users

---

### 4. "Google OAuth credentials not found"

**Console Message:**
```
⚠️  Google OAuth credentials not found. Google login will not work.
   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file
```

**Root Causes:**
- .env file doesn't exist
- .env file in wrong location
- Variable names misspelled
- dotenv not loaded before passport config

**Fix Steps:**

1. Check .env file exists:
   ```bash
   ls backend/.env
   ```

2. Check .env content:
   ```bash
   cat backend/.env | grep GOOGLE
   ```

3. Verify variable names (case-sensitive):
   ```env
   GOOGLE_CLIENT_ID=...    ✅ Correct
   Google_Client_Id=...    ❌ Wrong
   google_client_id=...    ❌ Wrong
   ```

4. Ensure dotenv loads before passport:
   In `server.js`:
   ```javascript
   dotenv.config({ path: join(__dirname, '.env') });
   ```
   This must run BEFORE importing app.js

5. Restart server

---

### 5. Callback Route Not Found (404)

**Error:** Browser shows 404 after Google login

**Root Causes:**
- Routes not mounted correctly
- Passport not initialized
- Route path mismatch

**Fix Steps:**

1. Check `backend/app.js`:
   ```javascript
   app.use(passport.initialize());  // Must be before routes
   app.use('/api/auth', authRoutes);
   ```

2. Check `backend/routes/authRoutes.js`:
   ```javascript
   router.get('/google/callback', ...);  // Not '/api/auth/google/callback'
   ```

3. Verify route registration:
   ```bash
   curl http://localhost:5000/api/auth/google
   ```
   Should redirect to Google, not return 404

---

### 6. req.user is undefined

**Console Log:**
```
❌ No user found in req.user after authentication
```

**Root Causes:**
- Passport authentication failed silently
- User not created in database
- MongoDB connection issue

**Fix Steps:**

1. Check backend console for errors during OAuth callback

2. Check MongoDB connection:
   ```
   MongoDB connected: cluster0-shard-00-00.mongodb.net
   ```

3. Check User model has googleId field:
   ```javascript
   googleId: { type: String, sparse: true, unique: true }
   ```

4. Test database connection:
   ```bash
   curl http://localhost:5000/api/health
   ```

5. Check passport strategy logs:
   ```
   🔐 Google OAuth callback triggered
   Profile ID: 123456789
   Display Name: John Doe
   Email: john@example.com
   ```

---

### 7. Token Not Generated

**Console Log:**
```
📍 Google callback controller reached
   req.user exists: true
❌ JWT token generation failed
```

**Root Causes:**
- JWT_SECRET not set
- jwtUtils.js error

**Fix Steps:**

1. Check .env:
   ```env
   JWT_SECRET=your-long-random-secret-key
   ```

2. Verify JWT utils:
   ```bash
   node -e "require('dotenv').config(); const jwt = require('jsonwebtoken'); console.log(jwt.sign({test: 1}, process.env.JWT_SECRET));"
   ```

3. Check `backend/utils/jwtUtils.js` exists and exports generateToken

---

### 8. Frontend Not Receiving Token

**Issue:** Redirects to frontend but no token in URL

**Root Causes:**
- CLIENT_URL mismatch
- Redirect URL incorrect
- CORS issue

**Fix Steps:**

1. Check .env:
   ```env
   CLIENT_URL=http://localhost:5173
   ```
   Must match your frontend port!

2. Check redirect in controller:
   ```javascript
   res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
   ```

3. Check CORS in app.js:
   ```javascript
   app.use(cors());  // Or configure specific origins
   ```

4. Test redirect manually:
   ```
   http://localhost:5000/api/auth/google
   ```
   After login, check browser URL bar

---

## 🔍 Debug Checklist

Run through this checklist in order:

### Backend Configuration
- [ ] .env file exists in `backend/` folder
- [ ] GOOGLE_CLIENT_ID is set and correct
- [ ] GOOGLE_CLIENT_SECRET is set and correct
- [ ] PORT is 5000
- [ ] CLIENT_URL matches frontend port
- [ ] JWT_SECRET is set
- [ ] MONGO_URI is correct with password

### Google Cloud Console
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URI is exactly: `http://localhost:5000/api/auth/google/callback`
- [ ] No trailing slash in redirect URI
- [ ] OAuth consent screen configured
- [ ] Test users added (for development)
- [ ] Google+ API enabled

### Code Configuration
- [ ] passport.initialize() called in app.js
- [ ] Routes mounted at /api/auth
- [ ] callbackURL uses absolute URL with port
- [ ] Debug logging enabled (already done)

### Server Status
- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Console shows "Configuring Google OAuth Strategy"
- [ ] No errors in console

### Testing
- [ ] Can access http://localhost:5000/api/health
- [ ] Can access http://localhost:5000/api/auth/google (redirects to Google)
- [ ] After Google login, redirects to frontend
- [ ] Token appears in URL
- [ ] Token works for /api/auth/me

---

## 🧪 Testing Commands

### 1. Check Environment Variables
```bash
cd backend
node -e "require('dotenv').config(); console.log('Client ID:', process.env.GOOGLE_CLIENT_ID); console.log('Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set'); console.log('Client URL:', process.env.CLIENT_URL);"
```

### 2. Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok","service":"Learnera API"}`

### 3. Test OAuth Initiation
Open browser to:
```
http://localhost:5000/api/auth/google
```
Expected: Redirects to Google login

### 4. Check Backend Logs
Start server and watch console:
```bash
cd backend
npm start
```

Look for:
```
✅ Configuring Google OAuth Strategy
   Callback URL: http://localhost:5000/api/auth/google/callback
Server running on port 5000
MongoDB connected: ...
```

### 5. Test Complete Flow
1. Open: `http://localhost:5000/api/auth/google`
2. Login with Google
3. Check console logs for:
   ```
   🚀 Initiating Google OAuth flow
   📥 Google callback route hit
   🔐 Google OAuth callback triggered
   ✅ User authenticated successfully
   📍 Google callback controller reached
   ✅ JWT token generated
   ```
4. Check browser URL for token

---

## 📊 Log Analysis

### Successful Flow Logs:
```
✅ Configuring Google OAuth Strategy
   Callback URL: http://localhost:5000/api/auth/google/callback
Server running on port 5000
MongoDB connected: cluster0-shard-00-00.mongodb.net
🚀 Initiating Google OAuth flow
   Redirect URI will be: http://localhost:5000/api/auth/google/callback
📥 Google callback route hit
   Query params: {"code":"4/0AY0e-g7..."}
🔐 Google OAuth callback triggered
   Profile ID: 123456789
   Display Name: John Doe
   Email: john@example.com
✅ Creating new user from Google profile
✅ New user created: 507f1f77bcf86cd799439011
✅ User authenticated successfully
📍 Google callback controller reached
   req.user exists: true
   User ID: 507f1f77bcf86cd799439011
   User Email: john@example.com
✅ JWT token generated
   Redirecting to: http://localhost:5173/auth/google/success?token=eyJ...
```

### Failed Flow - redirect_uri_mismatch:
```
✅ Configuring Google OAuth Strategy
   Callback URL: http://localhost:5000/api/auth/google/callback
🚀 Initiating Google OAuth flow
(User sees Google error page - no callback logs)
```
**Fix:** Update Google Console redirect URI

### Failed Flow - invalid_client:
```
⚠️  Google OAuth credentials not found. Google login will not work.
```
**Fix:** Update .env with correct credentials

### Failed Flow - No user created:
```
🔐 Google OAuth callback triggered
❌ Google OAuth error: User validation failed
```
**Fix:** Check User model and MongoDB connection

---

## 🎯 Quick Fixes

### Fix 1: Reset Everything
```bash
# 1. Stop server
# 2. Update .env with correct credentials
# 3. Verify Google Console settings
# 4. Restart server
cd backend
npm start
```

### Fix 2: Test Without Frontend
```bash
# Open browser to:
http://localhost:5000/api/auth/google

# Should redirect to Google
# After login, check URL for token
```

### Fix 3: Verify Database
```bash
# Check if user was created
# Use MongoDB Compass or Atlas UI
# Look for users with googleId field
```

---

## 📞 Still Stuck?

1. Check all console logs (backend)
2. Check browser network tab
3. Check Google Cloud Console audit logs
4. Verify all environment variables
5. Try with a different Google account
6. Clear browser cookies and try again

All files now have extensive debug logging to help identify issues quickly!

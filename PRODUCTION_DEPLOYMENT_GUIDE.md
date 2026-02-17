# Production Deployment Guide - Google OAuth

## Overview
This guide covers deploying your Google OAuth-enabled MERN application to production environments (Render, Vercel, Railway, etc.).

## Pre-Deployment Checklist

- [ ] Google OAuth tested and working locally
- [ ] All environment variables documented
- [ ] Frontend build tested locally
- [ ] Backend tested with production database
- [ ] HTTPS certificates configured (handled by hosting platforms)

## Step 1: Setup Production Google OAuth Credentials

### 1.1 Create Production OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one for production)
3. Navigate to: APIs & Services → Credentials
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen (if not done):
   - User Type: External
   - App name: Learnera (Production)
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
   - Add logo (optional)
   - Add privacy policy URL (recommended)
   - Add terms of service URL (recommended)

### 1.2 Configure Authorized Origins and Redirect URIs

**For Backend on Render (example: `https://learnera-api.onrender.com`)**

Authorized JavaScript origins:
```
https://learnera-api.onrender.com
https://your-frontend-domain.vercel.app
```

Authorized redirect URIs:
```
https://learnera-api.onrender.com/api/auth/google/callback
```

**Important Notes:**
- Use HTTPS (not HTTP) in production
- No trailing slashes
- Exact match required
- Add both backend and frontend domains to origins

### 1.3 Save Credentials
- Copy Client ID
- Copy Client Secret
- Keep them secure (never commit to Git)

## Step 2: Deploy Backend (Render Example)

### 2.1 Prepare Backend for Deployment

Update `backend/package.json` if needed:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2.2 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `learnera-backend`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free or Starter

### 2.3 Set Environment Variables in Render

Go to Environment tab and add:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/learnera?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
```

**Important:**
- Use MongoDB Atlas for production database
- Generate new JWT_SECRET for production (use: `openssl rand -base64 32`)
- CLIENT_URL must match your frontend domain exactly

### 2.4 Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://learnera-backend.onrender.com`

### 2.5 Test Backend

```bash
# Health check
curl https://learnera-backend.onrender.com/api/health

# Expected: {"status":"ok","service":"Learnera API"}
```

## Step 3: Deploy Frontend (Vercel Example)

### 3.1 Prepare Frontend for Deployment

Create `frontend/.env.production`:
```env
VITE_API_URL=https://learnera-backend.onrender.com
```

Update API calls to use environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

### 3.2 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3.3 Set Environment Variables in Vercel

Go to Settings → Environment Variables:

```env
VITE_API_URL=https://learnera-backend.onrender.com
```

### 3.4 Deploy Frontend

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://learnera.vercel.app`

### 3.5 Update Backend CLIENT_URL

Go back to Render and update:
```env
CLIENT_URL=https://learnera.vercel.app
```

Redeploy backend for changes to take effect.

## Step 4: Update Google OAuth Configuration

### 4.1 Add Production URLs to Google Console

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to Authorized JavaScript origins:
   ```
   https://learnera-backend.onrender.com
   https://learnera.vercel.app
   ```
4. Add to Authorized redirect URIs:
   ```
   https://learnera-backend.onrender.com/api/auth/google/callback
   ```
5. Save changes

### 4.2 Test OAuth in Production

1. Visit: `https://learnera.vercel.app/login`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify successful authentication

## Step 5: Configure CORS for Production

Update `backend/app.js` if needed:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Step 6: MongoDB Atlas Setup (if not done)

### 6.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses:
   - Add `0.0.0.0/0` for Render (or specific IPs)
5. Get connection string

### 6.2 Update MONGO_URI

In Render environment variables:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/learnera?retryWrites=true&w=majority
```

## Step 7: Security Hardening

### 7.1 Rate Limiting (Optional but Recommended)

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `backend/app.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 7.2 Helmet for Security Headers

Install helmet:
```bash
npm install helmet
```

Add to `backend/app.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 7.3 Environment Variable Validation

Add to `backend/server.js`:
```javascript
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLIENT_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

## Step 8: Monitoring and Logging

### 8.1 Add Logging

Install winston:
```bash
npm install winston
```

Create `backend/utils/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

Use in OAuth flow:
```javascript
const logger = require('../utils/logger');

// In passport.js
logger.info('Google OAuth: User authenticated', { userId: user._id });
logger.error('Google OAuth: Error', { error: error.message });
```

### 8.2 Monitor Render Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor for errors during OAuth flow

## Step 9: Testing Production Deployment

### 9.1 Test Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads correctly
- [ ] Google OAuth button visible
- [ ] OAuth flow completes successfully
- [ ] New users can register via Google
- [ ] Existing users can link Google accounts
- [ ] Email/password login still works
- [ ] JWT tokens are generated
- [ ] Protected routes work
- [ ] No CORS errors
- [ ] No console errors

### 9.2 Test Different Scenarios

1. **New Google User**
   - Sign in with Google (new email)
   - Verify user created in MongoDB
   - Check role is "student"

2. **Existing Email User**
   - Register with email/password
   - Sign in with Google (same email)
   - Verify Google account linked

3. **Cross-Browser Testing**
   - Test in Chrome, Firefox, Safari
   - Verify OAuth works in all browsers

## Step 10: Rollback Plan

### 10.1 If OAuth Fails in Production

1. Check Render logs for errors
2. Verify environment variables
3. Check Google Console redirect URIs
4. Test with Postman/cURL
5. Rollback to previous deployment if needed

### 10.2 Emergency Disable OAuth

If OAuth causes issues, you can temporarily disable:

1. Remove Google Sign-In button from frontend
2. Users can still use email/password
3. Fix OAuth issues
4. Re-enable when ready

## Alternative Hosting Platforms

### Railway

Similar to Render:
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

### Heroku

1. Create Heroku app
2. Set config vars (environment variables)
3. Deploy via Git or GitHub integration

### DigitalOcean App Platform

1. Create app from GitHub
2. Configure environment variables
3. Deploy

### AWS (EC2 + Elastic Beanstalk)

More complex but more control:
1. Create EC2 instance
2. Install Node.js
3. Configure environment
4. Use PM2 for process management
5. Setup NGINX as reverse proxy

## Domain Configuration (Optional)

### Custom Domain for Backend

1. Purchase domain (e.g., api.learnera.com)
2. Add CNAME record pointing to Render URL
3. Configure custom domain in Render
4. Update Google OAuth redirect URIs
5. Update CLIENT_URL if needed

### Custom Domain for Frontend

1. Purchase domain (e.g., learnera.com)
2. Add DNS records in Vercel
3. Configure custom domain in Vercel
4. Update GOOGLE_CLIENT_ID origins

## Cost Considerations

### Free Tier Limits

**Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month free

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared cluster
- Good for development/small apps

### Upgrade Recommendations

Consider upgrading when:
- Users experience slow cold starts (Render)
- Need 99.9% uptime
- Database exceeds 512 MB
- High traffic volume

## Troubleshooting Production Issues

### Issue: "redirect_uri_mismatch"
**Solution:** Verify redirect URI in Google Console matches production URL exactly

### Issue: CORS errors
**Solution:** Check CLIENT_URL in backend matches frontend domain

### Issue: OAuth works locally but not in production
**Solution:** 
- Verify HTTPS is used
- Check environment variables are set
- Review Render logs for errors

### Issue: Slow cold starts on Render
**Solution:**
- Upgrade to paid plan
- Use cron job to ping server every 10 minutes
- Consider alternative hosting

### Issue: MongoDB connection timeout
**Solution:**
- Whitelist Render IP addresses in MongoDB Atlas
- Check connection string is correct
- Verify network access settings

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Google OAuth credentials configured
- [ ] Redirect URIs updated in Google Console
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] OAuth flow tested end-to-end
- [ ] Database connection working
- [ ] Logs monitored for errors
- [ ] Security headers configured
- [ ] Rate limiting enabled (optional)
- [ ] Custom domains configured (optional)
- [ ] Monitoring setup (optional)
- [ ] Backup strategy in place

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check for OAuth errors weekly
2. **Update Dependencies**: Run `npm audit` monthly
3. **Rotate Secrets**: Change JWT_SECRET every 6 months
4. **Review OAuth Scopes**: Ensure minimal permissions
5. **Check Google Console**: Monitor OAuth usage

### Security Updates

1. Keep dependencies updated
2. Monitor security advisories
3. Review access logs
4. Audit user permissions
5. Test OAuth flow after updates

## Success Metrics

Track these metrics post-deployment:
- OAuth success rate
- OAuth failure reasons
- Average authentication time
- User registration method (email vs Google)
- Error rates

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Passport.js Documentation](http://www.passportjs.org/docs/)

---

**Deployment Status**: Ready for Production
**Last Updated**: February 17, 2026

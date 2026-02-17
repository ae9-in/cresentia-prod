# Google OAuth Testing Checklist

## Pre-Testing Setup

- [ ] Google OAuth credentials obtained from Google Cloud Console
- [ ] GOOGLE_CLIENT_ID added to backend/.env
- [ ] GOOGLE_CLIENT_SECRET added to backend/.env
- [ ] CLIENT_URL set correctly in backend/.env
- [ ] Redirect URI added to Google Console: `http://localhost:5000/api/auth/google/callback`
- [ ] Backend dependencies installed: `npm install` in backend folder
- [ ] Backend server running: `npm run dev` in backend folder
- [ ] Frontend server running: `npm run dev` in frontend folder
- [ ] MongoDB connection working

## Backend API Tests

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok","service":"Learnera API"}`

### Test 2: Google OAuth Initiation (Browser)
```
http://localhost:5000/api/auth/google
```
Expected: Redirects to Google consent screen

### Test 3: Traditional Login Still Works
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: Returns JWT token and user data

### Test 4: Protected Route with JWT
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Expected: Returns user data

## Frontend Integration Tests

### Test 5: Google Sign-In Button Renders
- [ ] Navigate to login page
- [ ] "Sign in with Google" button is visible
- [ ] Button has Google logo/icon
- [ ] Button is clickable

### Test 6: OAuth Flow - New User
1. [ ] Click "Sign in with Google"
2. [ ] Redirects to Google consent screen
3. [ ] Select Google account (use test account)
4. [ ] Authorize application
5. [ ] Redirects back to frontend
6. [ ] Shows "Authenticating..." message
7. [ ] Redirects to dashboard
8. [ ] User is logged in
9. [ ] Check MongoDB: New user created with googleId
10. [ ] User role is "student"
11. [ ] isVerified is true

### Test 7: OAuth Flow - Existing Email User
1. [ ] Register user with email/password first
2. [ ] Logout
3. [ ] Click "Sign in with Google" with same email
4. [ ] Complete OAuth flow
5. [ ] Check MongoDB: User now has googleId field
6. [ ] All original user data preserved
7. [ ] User can login with either method

### Test 8: OAuth Flow - Returning Google User
1. [ ] User previously signed in with Google
2. [ ] Click "Sign in with Google" again
3. [ ] Completes quickly (no new user creation)
4. [ ] Redirects to dashboard
5. [ ] Same user data as before

### Test 9: Email/Password Login Unchanged
1. [ ] Navigate to login page
2. [ ] Enter email and password
3. [ ] Click "Login with Email"
4. [ ] Successfully logs in
5. [ ] JWT token generated
6. [ ] Redirects to dashboard

### Test 10: Error Handling - OAuth Failure
1. [ ] Start OAuth flow
2. [ ] Cancel on Google consent screen
3. [ ] Redirects to login with error message
4. [ ] Error message displayed to user

### Test 11: Error Handling - Invalid Token
1. [ ] Manually navigate to: `/auth/google/success?token=invalid`
2. [ ] Shows error message
3. [ ] Redirects to login page

### Test 12: Protected Routes
1. [ ] Login with Google
2. [ ] Navigate to protected route (e.g., /dashboard)
3. [ ] Page loads successfully
4. [ ] User data displayed correctly

### Test 13: Logout and Re-login
1. [ ] Login with Google
2. [ ] Logout
3. [ ] Login with Google again
4. [ ] Successfully authenticates

## Database Verification Tests

### Test 14: User Schema Validation
Check MongoDB after Google login:
```javascript
// User document should have:
{
  _id: ObjectId,
  name: "User Name",
  email: "user@gmail.com",
  googleId: "1234567890", // Google user ID
  role: "student",
  isVerified: true,
  password: "hashed_random_password", // Not used for Google users
  createdAt: Date,
  updatedAt: Date
}
```

### Test 15: No Duplicate Users
1. [ ] Login with Google (email: test@gmail.com)
2. [ ] Logout
3. [ ] Login with Google again (same email)
4. [ ] Check MongoDB: Only ONE user with that email
5. [ ] No duplicate users created

### Test 16: Email Uniqueness
1. [ ] Register with email: test@example.com
2. [ ] Try to login with Google using test@example.com
3. [ ] Google account linked to existing user
4. [ ] No error about duplicate email

## Security Tests

### Test 17: JWT Token Validation
1. [ ] Login with Google
2. [ ] Copy JWT token from localStorage
3. [ ] Decode token at jwt.io
4. [ ] Verify payload contains userId
5. [ ] Verify expiration is 7 days from now

### Test 18: Password Not Required for Google Users
1. [ ] Create user via Google OAuth
2. [ ] Check MongoDB: password field exists but not used
3. [ ] User cannot login with email/password (no password set)

### Test 19: Role System Preserved
1. [ ] Create admin user via email/password
2. [ ] Login with Google using same email
3. [ ] Check role is still "admin"
4. [ ] Admin privileges preserved

### Test 20: Protected Routes Require Auth
1. [ ] Logout
2. [ ] Try to access /api/auth/me without token
3. [ ] Expected: 401 Unauthorized

## Cross-Browser Tests

### Test 21: Chrome
- [ ] Google OAuth works in Chrome
- [ ] No console errors

### Test 22: Firefox
- [ ] Google OAuth works in Firefox
- [ ] No console errors

### Test 23: Safari (if available)
- [ ] Google OAuth works in Safari
- [ ] No console errors

## Production Readiness Tests

### Test 24: Environment Variables
- [ ] All required env vars documented in .env.example
- [ ] No hardcoded URLs in code
- [ ] CLIENT_URL used for redirects

### Test 25: Error Logging
- [ ] Check backend console for errors during OAuth
- [ ] Errors are descriptive and helpful
- [ ] No sensitive data in logs

### Test 26: CORS Configuration
- [ ] Frontend can make requests to backend
- [ ] No CORS errors in browser console

## Performance Tests

### Test 27: OAuth Speed
- [ ] OAuth flow completes in < 5 seconds
- [ ] No unnecessary database queries
- [ ] JWT generation is fast

### Test 28: Concurrent Users
- [ ] Multiple users can login with Google simultaneously
- [ ] No race conditions
- [ ] No duplicate user creation

## Edge Cases

### Test 29: No Email in Google Profile
- [ ] Use Google account without email (rare)
- [ ] Expected: Error message "No email found"
- [ ] User not created

### Test 30: Google Account Email Change
- [ ] User changes email in Google account
- [ ] Login with Google
- [ ] System handles gracefully (links by googleId)

### Test 31: Deleted Google Account
- [ ] User deletes Google account
- [ ] Try to login with Google
- [ ] Expected: OAuth fails at Google's end

### Test 32: Network Failure
- [ ] Start OAuth flow
- [ ] Disconnect internet during callback
- [ ] Expected: Error message displayed
- [ ] User can retry

## Documentation Tests

### Test 33: README Accuracy
- [ ] Follow setup instructions in GOOGLE_OAUTH_IMPLEMENTATION.md
- [ ] All steps work as described
- [ ] No missing information

### Test 34: Code Comments
- [ ] Code is well-commented
- [ ] Complex logic explained
- [ ] Function purposes clear

## Deployment Tests (Production)

### Test 35: Production OAuth Credentials
- [ ] Production credentials created in Google Console
- [ ] Production redirect URI added
- [ ] Environment variables set in hosting platform

### Test 36: HTTPS in Production
- [ ] OAuth works over HTTPS
- [ ] No mixed content warnings
- [ ] Secure cookies if used

### Test 37: Production Error Handling
- [ ] Errors logged to monitoring service
- [ ] User-friendly error messages
- [ ] No stack traces exposed to users

## Final Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] No database errors
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production deployment

## Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: [ ] Development [ ] Production

Passed: ___ / 37
Failed: ___ / 37

Failed Tests:
1. Test #___ - Reason: ___________
2. Test #___ - Reason: ___________

Notes:
___________________________________________
___________________________________________
```

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch"
Solution: Verify redirect URI in Google Console matches exactly (including protocol and port)

### Issue: "No email found in Google profile"
Solution: Ensure 'email' scope is requested (already configured)

### Issue: Token not received in frontend
Solution: Check CLIENT_URL in backend .env matches frontend URL

### Issue: User created but not logged in
Solution: Check JWT_SECRET is set and token generation works

### Issue: CORS errors
Solution: Verify CORS is enabled in backend and frontend URL is allowed

### Issue: MongoDB duplicate key error
Solution: Check email uniqueness and googleId sparse index

## Automated Testing (Optional)

Consider adding automated tests using:
- Jest for unit tests
- Supertest for API tests
- Cypress/Playwright for E2E tests

Example test structure:
```javascript
describe('Google OAuth', () => {
  it('should create new user on first Google login', async () => {
    // Test implementation
  });

  it('should link Google account to existing email user', async () => {
    // Test implementation
  });

  it('should generate valid JWT token', async () => {
    // Test implementation
  });
});
```

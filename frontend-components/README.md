# Frontend Components for Google OAuth

This folder contains ready-to-use React components for implementing Google OAuth in your frontend.

## Files

1. **GoogleSignInButton.jsx** - Google sign-in button component
2. **GoogleAuthCallback.jsx** - OAuth callback handler page
3. **LoginPageExample.jsx** - Example login page with Google OAuth

## Installation Steps

### Step 1: Copy Components

```bash
# Copy Google Sign-In Button
cp frontend-components/GoogleSignInButton.jsx frontend/src/components/

# Copy OAuth Callback Handler
cp frontend-components/GoogleAuthCallback.jsx frontend/src/pages/
```

### Step 2: Update Your Login Page

Either:
- Copy the entire `LoginPageExample.jsx` to `frontend/src/pages/LoginPage.jsx`, OR
- Add the Google Sign-In button to your existing login page:

```jsx
import GoogleSignInButton from '../components/GoogleSignInButton';

// In your login form, add:
<GoogleSignInButton />
```

### Step 3: Add Route for OAuth Callback

In your `frontend/src/App.jsx`, add:

```jsx
import GoogleAuthCallback from './pages/GoogleAuthCallback';

// In your Routes:
<Route path="/auth/google/success" element={<GoogleAuthCallback />} />
```

### Step 4: Set Environment Variable

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

For production, create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.onrender.com
```

## Component Details

### GoogleSignInButton

A styled button that redirects users to the Google OAuth flow.

**Props:** None

**Usage:**
```jsx
import GoogleSignInButton from '../components/GoogleSignInButton';

<GoogleSignInButton />
```

### GoogleAuthCallback

Handles the OAuth callback from Google, stores the JWT token, and redirects to dashboard.

**Features:**
- Extracts token from URL
- Fetches user data
- Stores token and user in localStorage
- Error handling with user feedback
- Loading spinner

**Route:** `/auth/google/success`

### LoginPageExample

Complete login page with both email/password and Google OAuth options.

**Features:**
- Email/password login form
- Google OAuth button
- Error display
- Responsive design
- Link to registration page

## Testing

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:5173/login`
4. Click "Sign in with Google"
5. Complete OAuth flow
6. Verify redirect to dashboard

## Customization

### Styling

All components use inline styles for portability. You can:
- Replace inline styles with CSS classes
- Use your UI library (Material-UI, Chakra, etc.)
- Customize colors and spacing

### Auth Context Integration

If you're using AuthContext, update `GoogleAuthCallback.jsx`:

```jsx
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();

// After fetching user data:
login(data.user, token);
```

### Error Handling

Customize error messages in `GoogleAuthCallback.jsx`:

```jsx
if (errorParam === 'google_auth_failed') {
  setError('Google authentication failed. Please try again.');
}
```

## Troubleshooting

### Button doesn't redirect
- Check VITE_API_URL is set correctly
- Verify backend is running
- Check browser console for errors

### Callback fails
- Verify route `/auth/google/success` exists
- Check CLIENT_URL in backend .env
- Ensure Google redirect URI is correct

### Token not stored
- Check localStorage in browser DevTools
- Verify API endpoint `/api/auth/me` works
- Check CORS settings in backend

## Production Deployment

1. Update `VITE_API_URL` in `.env.production`
2. Build frontend: `npm run build`
3. Deploy to Vercel/Netlify
4. Update Google Console redirect URIs
5. Test OAuth flow in production

## Support

For detailed documentation, see:
- `GOOGLE_OAUTH_IMPLEMENTATION.md`
- `START_HERE.md`
- `TESTING_CHECKLIST.md`

---

**Status:** ✅ Ready to Use
**All components tested and working**

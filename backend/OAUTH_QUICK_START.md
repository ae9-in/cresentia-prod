# Google OAuth Quick Start Guide

## 1. Get Google Credentials (5 minutes)

1. Visit: https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Credentials → Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Secret

## 2. Update .env File

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
CLIENT_URL=http://localhost:5173
```

## 3. Frontend Integration

### Add Button
```jsx
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

<button onClick={handleGoogleLogin}>
  <img src="/google-icon.svg" alt="Google" />
  Sign in with Google
</button>
```

### Handle Callback (Create new route)
```jsx
// frontend/src/pages/GoogleAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          // Update auth context
          navigate('/dashboard');
        });
    }
  }, [searchParams, navigate]);

  return <div>Authenticating...</div>;
};

export default GoogleAuthCallback;
```

### Add Route
```jsx
// In App.jsx
<Route path="/auth/google/success" element={<GoogleAuthCallback />} />
```

## 4. Test

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm run dev
```

Visit: http://localhost:5173/login → Click "Sign in with Google"

## API Endpoints

- `GET /api/auth/google` - Start OAuth flow
- `GET /api/auth/google/callback` - OAuth callback (automatic)
- `POST /api/auth/login` - Email/password login (unchanged)
- `POST /api/auth/register` - Email/password register (unchanged)

## How It Works

1. User clicks "Sign in with Google"
2. Redirects to Google consent screen
3. User authorizes
4. Google redirects to `/api/auth/google/callback`
5. Backend creates/finds user
6. Backend generates JWT token
7. Redirects to frontend: `/auth/google/success?token=JWT`
8. Frontend stores token and fetches user data

## User Scenarios

### New Google User
- Creates new user with role "student"
- Email verified automatically
- Can login with Google anytime

### Existing Email User
- Links Google account to existing user
- Can now use either method to login
- All data preserved

### Returning Google User
- Logs in instantly
- Same JWT token system
- Works with existing protected routes

## Production Deployment

### Update Google Console
Add production redirect URI:
```
https://your-backend.onrender.com/api/auth/google/callback
```

### Update Environment Variables
```env
CLIENT_URL=https://your-frontend.vercel.app
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-secret
```

## Troubleshooting

### "redirect_uri_mismatch"
→ Check Google Console redirect URIs match exactly

### "No email found"
→ Ensure 'email' scope is requested (already configured)

### Token not received
→ Check CLIENT_URL in backend .env

### User not created
→ Check MongoDB connection and console logs

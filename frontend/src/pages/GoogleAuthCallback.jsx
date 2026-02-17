import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(errorParam);
      setTimeout(() => {
        navigate('/login?error=' + errorParam);
      }, 2000);
      return;
    }

    if (token) {
      // Store token
      localStorage.setItem('token', token);
      setToken(token);

      // Fetch user data
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user data');
          return res.json();
        })
        .then((data) => {
          // Store user data
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);

          // Redirect to dashboard
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Authentication error:', err);
          setError('Failed to complete authentication');
          setTimeout(() => {
            navigate('/login?error=auth_failed');
          }, 2000);
        });
    } else {
      setError('No token received');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [searchParams, navigate, setUser, setToken]);

  if (error) {
    return (
      <main className="auth-page">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '20px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '48px' }}>❌</div>
          <h2>Authentication Failed</h2>
          <p className="muted">{error}</p>
          <p className="muted">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '20px',
          textAlign: 'center'
        }}
      >
        <div
          className="spinner"
          style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}
        ></div>
        <h2>Authenticating with Google...</h2>
        <p className="muted">Please wait while we complete your sign-in.</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </main>
  );
};

export default GoogleAuthCallback;

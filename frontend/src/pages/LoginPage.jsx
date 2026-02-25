import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-panel">
          <div className="auth-brand">
            <span className="brand-pill">Crescentia</span>
            <h1>Welcome back.</h1>
            <p>
              Sign in to continue your learning journey, track progress, and earn certificates that stand out.
            </p>
          </div>
          <ul className="auth-features">
            <li>
              <span>Personalized dashboard</span>
              <small>Pick up from where you left off with smart progress tracking.</small>
            </li>
            <li>
              <span>Curated paths</span>
              <small>Browse focused course paths built for real-world roles.</small>
            </li>
            <li>
              <span>Verified certificates</span>
              <small>Download branded certificates after every completion.</small>
            </li>
          </ul>
        </div>
        <form className="auth-form card" onSubmit={submit}>
          <div>
            <h2>Login</h2>
            <p className="muted">Use your registered email and password.</p>
          </div>
          {error && <p className="error">{error}</p>}
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <button className="primary-btn" type="submit">
            Login
          </button>
          
          <p className="muted">
            New user? <Link to="/register">Register</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;

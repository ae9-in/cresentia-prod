import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      // Register the user
      await register(form);
      
      // Auto-login after successful registration
      await login(form.email, form.password);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-panel">
          <div className="auth-brand">
            <span className="brand-pill">Crescentia</span>
            <h1>Create your account.</h1>
            <p>Start learning with personalized paths, projects, and progress insights built for you.</p>
          </div>
          <ul className="auth-features">
            <li>
              <span>Personalized learning</span>
              <small>Access curated courses tailored to your goals.</small>
            </li>
            <li>
              <span>Smart course picks</span>
              <small>Receive recommendations that evolve with your progress.</small>
            </li>
            <li>
              <span>Anytime access</span>
              <small>Learn from any device with seamless sync.</small>
            </li>
          </ul>
        </div>
        <form className="auth-form card" onSubmit={submit}>
          <div>
            <h2>Create Account</h2>
            <p className="muted">Join Crescentia to access courses and start learning.</p>
          </div>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={loading}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Create a secure password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
            />
          </label>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register as User'}
          </button>
          
          <p className="muted">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;

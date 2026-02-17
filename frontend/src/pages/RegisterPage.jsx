import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setVerificationUrl('');
    try {
      const { data } = await register(form);
      setMessage(data.message || 'Registered successfully. Verify your email.');
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-panel">
          <div className="auth-brand">
            <span className="brand-pill">Learnera</span>
            <h1>Create your account.</h1>
            <p>Start learning with personalized paths, projects, and progress insights built for you.</p>
          </div>
          <ul className="auth-features">
            <li>
              <span>Role-based learning</span>
              <small>Choose a student or instructor profile tailored to your goals.</small>
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
            <p className="muted">Join Learnera to access courses and certificates.</p>
          </div>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          {verificationUrl && (
            <p className="muted">
              Verify now: <a href={verificationUrl}>Open verification link</a>
            </p>
          )}
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
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
            />
          </label>
          <label className="field">
            <span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </label>
          <button className="primary-btn" type="submit">
            Register
          </button>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '20px 0',
            gap: '10px'
          }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <span style={{ color: '#666', fontSize: '14px' }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
          </div>

          <GoogleSignInButton />
          
          <p className="muted">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, user } = useAuth();
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
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF5F1F]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 w-[1000px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 relative z-20">
        <Link to="/" className="text-2xl font-bold text-[#FF5F1F] tracking-tight hover:opacity-80 transition-opacity">
          Crescentia
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/#courses" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
            Courses
          </Link>
          <Link to="/#features" className="text-gray-400 hover:text-white transition-colors font-medium text-sm">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl shadow-black/50 bg-[#1a1a1a] border border-white/5">
          {/* Left Panel */}
          <div className="w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#2A1108] to-[#1a0a05]">
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 w-[120%] h-[150%] bg-[#4A2111] -translate-y-[10%] translate-x-[40%] -rotate-12 origin-top-right pointer-events-none opacity-60" />
            
            <div className="relative z-10 p-12 h-full flex flex-col justify-center">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white text-[#FF5F1F] text-sm font-bold mb-8 w-max">
                Crescentia
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                Welcome back.
              </h1>
              
              <p className="text-orange-100/80 text-lg mb-10 leading-relaxed max-w-md">
                Sign in to continue your learning journey, track progress, and earn certificates that stand out.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Personalized dashboard</h3>
                  <p className="text-orange-100/70 text-sm">Pick up from where you left off with smart progress tracking.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Curated paths</h3>
                  <p className="text-orange-100/70 text-sm">Browse focused course paths built for real-world roles.</p>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Verified certificates</h3>
                  <p className="text-orange-100/70 text-sm">Download branded certificates after every completion.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-[#18181b]">
            <h2 className="text-3xl font-extrabold text-white mb-2">Login</h2>
            <p className="text-gray-400 mb-8">Use your registered email and password.</p>
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={submit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#f0f4f8] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] transition-all font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#f0f4f8] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] transition-all font-medium"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#FF5F1F] hover:bg-[#e6551c] text-white font-bold text-lg transition-all mt-4 shadow-[0_0_15px_rgba(255,95,31,0.3)] hover:shadow-[0_0_25px_rgba(255,95,31,0.5)]"
              >
                Login
              </button>
            </form>
            
            <p className="mt-8 text-gray-400 text-sm text-center">
              New user?{' '}
              <Link to="/register" className="text-[#FF5F1F] hover:text-[#e6551c] font-semibold transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

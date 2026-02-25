import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout, refreshUser } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  return (
    <header className="topbar">
      <div className="container topbar-content">
        <Link to="/" className="brand">
          Crescentia
        </Link>
        <nav className="nav-links">
          {user && user.role === 'student' && (
            <>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </>
          )}
          {user && user.role === 'admin' && (
            <>
              <NavLink to="/admin">Admin Panel</NavLink>
              <NavLink to="/courses">Browse Courses</NavLink>
            </>
          )}
        </nav>
        <div className="nav-actions">
          <button
            className="ghost-btn"
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            type="button"
          >
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register">Register</Link>}
          {user && (
            <>
              <button 
                className="ghost-btn" 
                onClick={handleRefresh} 
                type="button"
                disabled={refreshing}
                title="Refresh your course assignments"
              >
                {refreshing ? '⟳' : '↻'} Refresh
              </button>
              <span className="user-pill">👤 {user.name}</span>
              <button 
                className="primary-btn logout-btn" 
                onClick={onLogout} 
                type="button"
                title="Logout from your account"
              >
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

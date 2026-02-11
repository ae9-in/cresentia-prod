import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="container topbar-content">
        <Link to="/" className="brand">
          Learnera
        </Link>
        <nav className="nav-links">
          {user && <NavLink to="/">Home</NavLink>}
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && ['admin', 'instructor'].includes(user.role) && <NavLink to="/admin">Admin</NavLink>}
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
              <span className="user-pill">{user.name}</span>
              <button className="primary-btn" onClick={onLogout} type="button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

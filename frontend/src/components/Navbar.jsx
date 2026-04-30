import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="container topbar-content">
        <Link to={user?.role === 'admin' || user?.role === 'instructor' ? '/admin' : '/dashboard'} className="brand">
          Crescentia
        </Link>
        <nav className="nav-links">
          {user?.role === 'user' && (
            <>
              <Link to="/courses">Courses</Link>
            </>
          )}
          {(user?.role === 'admin' || user?.role === 'instructor') && <Link to="/admin">Admin Panel</Link>}
        </nav>
        <div className="nav-actions">
          {user && (
            <>
              <span className="user-pill">{user.name}</span>
              <button className="primary-btn logout-btn" onClick={onLogout} type="button">
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

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import AssessmentPage from './pages/AssessmentPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'instructor') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <LandingPage />;
  if (user.role === 'admin' || user.role === 'instructor') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/courses" replace />;
};

function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/courses"
          element={
            <ProtectedRoute roles={['user', 'admin', 'instructor']}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute roles={['user', 'admin', 'instructor']}>
              <CoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:id/assessment"
          element={
            <ProtectedRoute roles={['user', 'admin', 'instructor']}>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={<Navigate to="/courses" replace />}
        />
        <Route path="/profile" element={<Navigate to="/courses" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin', 'instructor']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={<Navigate to="/admin" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

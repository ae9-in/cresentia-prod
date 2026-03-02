import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePage from './pages/CoursePage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

import { Routes, Route } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, hasAccess } = useAuth();
  
  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Check if user has no assigned courses
  if (user.role === 'user' && !hasAccess() && window.location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (roles && !roles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'instructor') return <Navigate to="/instructor" replace />;
    if (user.role === 'user') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <LandingPage />;
  
  // Redirect based on role
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'instructor') return <Navigate to="/instructor" replace />;
  if (user.role === 'user') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { user, hasAccess } = useAuth();
  
  // Show navbar for all authenticated users
  const shouldShowNavbar = user && (user.role === 'admin' || user.role === 'instructor' || (user.role === 'user' && hasAccess()));
  
  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route
          path="/courses"
          element={
            <ProtectedRoute roles={['user', 'admin', 'instructor']}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
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
          element={
            <ProtectedRoute roles={['user']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
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
          element={
            <ProtectedRoute roles={['admin', 'instructor']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

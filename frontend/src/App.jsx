import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
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
  
  // CRITICAL: Only blank screen for students with NO courses at all
  // Do NOT blank screen individual course pages - let them handle access
  if (user.role === 'student' && !hasAccess() && window.location.pathname === '/courses') {
    return (
      <div className="container page">
        <div className="card empty-state">
          <h2>No Courses Assigned</h2>
          <p className="muted">You don't have any courses assigned yet. Please contact an administrator.</p>
        </div>
      </div>
    );
  }
  
  if (roles && !roles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'student') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const RoleBasedRedirect = () => {
  const { user, loading, hasAccess } = useAuth();
  
  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  // Check if student has no assigned courses - show message
  if (user.role === 'student' && !hasAccess()) {
    return (
      <div className="container page">
        <div className="card empty-state">
          <h2>No Courses Assigned</h2>
          <p className="muted">You don't have any courses assigned yet. Please contact an administrator.</p>
        </div>
      </div>
    );
  }
  
  // Redirect based on role
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'student') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  const { user, hasAccess } = useAuth();
  
  // Don't render navbar for students with no assigned courses
  const shouldShowNavbar = !user || user.role === 'admin' || (user.role === 'student' && hasAccess());
  
  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route
          path="/courses"
          element={
            <ProtectedRoute roles={['student', 'admin']}>
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
            <ProtectedRoute roles={['student', 'admin']}>
              <CoursePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses/:id/assessment" 
          element={
            <ProtectedRoute roles={['student', 'admin']}>
              <AssessmentPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['student']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
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

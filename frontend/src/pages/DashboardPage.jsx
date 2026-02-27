import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardPage = () => {
  const { user, hasAccess } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, avgProgress: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const loadEnrollments = () => {
    console.log('🔄 Loading enrollments for user:', user?.email);
    api.get('/enrollments')
      .then((res) => {
        console.log('✅ Enrollments loaded:', res.data.length);
        console.log('Enrollments:', res.data);
        const data = res.data;
        setEnrollments(data);
        
        // Calculate stats
        const total = data.length;
        const completed = data.filter(e => e.progressPercent === 100).length;
        const inProgress = data.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
        const avgProgress = total > 0 ? Math.round(data.reduce((sum, e) => sum + e.progressPercent, 0) / total) : 0;
        
        setStats({ total, inProgress, completed, avgProgress });
        console.log('📊 Stats:', { total, inProgress, completed, avgProgress });
      })
      .catch((err) => {
        console.error('❌ Failed to load enrollments:', err);
        setEnrollments([]);
      });
  };

  useEffect(() => {
    console.log('🔄 Initial load - DashboardPage mounted');
    loadEnrollments();
  }, []);

  // Reload enrollments when user's assignedCourses change
  // Create a stable key from the course IDs
  const coursesKey = user?.assignedCourses?.map(c => 
    typeof c === 'object' ? c._id : c
  ).join(',') || '';
  
  useEffect(() => {
    if (coursesKey) {
      console.log('🔄 User assignedCourses changed, reloading enrollments');
      console.log('Current courses:', user?.assignedCourses?.length || 0);
      console.log('Courses key:', coursesKey);
      loadEnrollments();
    }
  }, [coursesKey]);

  // Listen for storage events (when admin updates user in another tab/component)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' && e.newValue) {
        console.log('🔄 User data changed in sessionStorage, reloading enrollments');
        loadEnrollments();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event within same tab
    const handleUserUpdate = () => {
      console.log('🔄 User update event received, reloading enrollments');
      loadEnrollments();
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const downloadCertificate = async (courseId) => {
    const res = await api.get(`/enrollments/${courseId}/certificate`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crescentia-certificate-${courseId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Get most recently accessed course (highest progress that's not 100%)
  const resumeCourse = enrollments
    .filter(e => e.progressPercent > 0 && e.progressPercent < 100)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  // Get courses with pending assessments (enrolled but quiz not submitted)
  const pendingAssessments = enrollments.filter(e => !e.quizSubmittedAt && e.progressPercent > 0);

  // Group by status
  const notStarted = enrollments.filter(e => e.progressPercent === 0);
  const inProgress = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100);
  const completed = enrollments.filter(e => e.progressPercent === 100);

  return (
    <main className="container page">
      {/* Welcome Section */}
      <section className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.name} 👋</h1>
          <p className="muted">Continue your learning journey and track your progress</p>
        </div>
        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.avgProgress}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Courses Enrolled</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </section>

      {/* Resume Learning */}
      {resumeCourse && (
        <section className="dashboard-section">
          <h2>Resume Learning</h2>
          <div className="resume-card card">
            <div className="resume-content">
              <div>
                <h3>{resumeCourse.course?.title}</h3>
                <p className="muted">{resumeCourse.course?.category} • {resumeCourse.course?.level}</p>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${resumeCourse.progressPercent}%` }}></div>
                </div>
                <p className="progress-text">{resumeCourse.progressPercent}% complete • {resumeCourse.completedVideos?.length || 0} of {resumeCourse.course?.videos?.length || 0} modules</p>
              </div>
              <Link className="primary-btn" to={`/courses/${resumeCourse.course?._id}`}>
                Continue Learning →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pending Assessments */}
      {pendingAssessments.length > 0 && (
        <section className="dashboard-section">
          <h2>Pending Assessments</h2>
          <div className="assessment-grid">
            {pendingAssessments.map((item) => (
              <div className="assessment-card card" key={item._id}>
                <h4>{item.course?.title}</h4>
                <p className="muted">Complete the quiz to finish this course</p>
                <Link className="ghost-btn" to={`/courses/${item.course?._id}/assignment`}>
                  Take Assessment
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Course Progress */}
      <section className="dashboard-section">
        <h2>Your Courses</h2>
        
        {/* In Progress */}
        {inProgress.length > 0 && (
          <div className="course-status-group">
            <h3 className="status-heading">In Progress ({inProgress.length})</h3>
            <div className="course-progress-grid">
              {inProgress.map((item) => (
                <div className="progress-course-card card" key={item._id}>
                  <div className="course-header">
                    <h4>{item.course?.title}</h4>
                    <span className="chip">{item.course?.category}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${item.progressPercent}%` }}></div>
                  </div>
                  <div className="course-meta">
                    <span className="progress-text">{item.progressPercent}% complete</span>
                    <span className="muted">{item.completedVideos?.length || 0}/{item.course?.videos?.length || 0} modules</span>
                  </div>
                  <Link className="ghost-btn" to={`/courses/${item.course?._id}`}>
                    Continue
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="course-status-group">
            <h3 className="status-heading">Completed ({completed.length})</h3>
            <div className="course-progress-grid">
              {completed.map((item) => (
                <div className="progress-course-card card completed" key={item._id}>
                  <div className="course-header">
                    <h4>{item.course?.title}</h4>
                    <span className="completion-badge">✓ Completed</span>
                  </div>
                  <div className="course-meta">
                    <span className="muted">Quiz Score: {item.quizScore || 0}%</span>
                    <span className="muted">Completed {new Date(item.completedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-row">
                    <Link className="ghost-btn" to={`/courses/${item.course?._id}`}>
                      Review
                    </Link>
                    <button className="primary-btn" type="button" onClick={() => downloadCertificate(item.course?._id)}>
                      Download Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not Started */}
        {notStarted.length > 0 && (
          <div className="course-status-group">
            <h3 className="status-heading">Not Started ({notStarted.length})</h3>
            <div className="course-progress-grid">
              {notStarted.map((item) => (
                <div className="progress-course-card card not-started" key={item._id}>
                  <div className="course-header">
                    <h4>{item.course?.title}</h4>
                    <span className="chip">{item.course?.category}</span>
                  </div>
                  <p className="muted">{item.course?.description?.substring(0, 80)}...</p>
                  <Link className="primary-btn" to={`/courses/${item.course?._id}`}>
                    Start Course
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {enrollments.length === 0 && (
          <div className="empty-state card">
            <h3>No courses yet</h3>
            <p className="muted">You haven't been assigned any courses yet. Please contact an administrator to get course access.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * DEBUG VERSION OF COURSE DETAIL PAGE
 * 
 * This version has extensive logging to trace the entire data flow.
 * Use this temporarily to debug course loading issues.
 * 
 * To use:
 * 1. Rename CourseDetailPage.jsx to CourseDetailPage-OLD.jsx
 * 2. Rename this file to CourseDetailPage.jsx
 * 3. Click "Start Course" and check console
 * 4. After debugging, restore original file
 */

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasCourseAccess, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  // HARD DEBUG MODE - Shows all data on screen
  const HARD_DEBUG_MODE = true;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   COURSE DETAIL PAGE - DEBUG MODE     ║');
  console.log('╚════════════════════════════════════════╝\n');

  // STEP 1: Verify ID is correct
  console.log('📋 STEP 1: VERIFY ID');
  console.log('─────────────────────────────────────────');
  console.log('Course ID from URL:', id);
  console.log('ID type:', typeof id);
  console.log('ID length:', id?.length);
  console.log('ID is valid ObjectId format:', /^[0-9a-fA-F]{24}$/.test(id));
  console.log('ID value (JSON):', JSON.stringify(id));
  console.log('');

  // STEP 2: Verify user data
  console.log('👤 STEP 2: VERIFY USER DATA');
  console.log('─────────────────────────────────────────');
  console.log('User exists:', !!user);
  console.log('User email:', user?.email);
  console.log('User role:', user?.role);
  console.log('Assigned courses count:', user?.assignedCourses?.length || 0);
  
  if (user?.assignedCourses?.length > 0) {
    console.log('Assigned courses:');
    user.assignedCourses.forEach((c, i) => {
      const courseId = typeof c === 'object' ? c._id : c;
      const courseTitle = typeof c === 'object' ? c.title : 'ID only';
      console.log(`  ${i + 1}. ${courseTitle} (${courseId})`);
    });
  }
  console.log('');

  // STEP 3: Check access control
  console.log('🔐 STEP 3: CHECK ACCESS CONTROL');
  console.log('─────────────────────────────────────────');
  
  let hasAccess = false;
  let accessReason = '';
  
  if (!user) {
    accessReason = 'No user logged in';
  } else if (user.role === 'admin') {
    hasAccess = true;
    accessReason = 'User is admin';
  } else if (user.role === 'student') {
    // Check if course is in assignedCourses
    const isAssigned = user.assignedCourses?.some(c => {
      const courseId = typeof c === 'object' ? c._id : c;
      const match = courseId?.toString() === id?.toString();
      if (match) {
        console.log(`  ✅ Match found: ${courseId} === ${id}`);
      }
      return match;
    });
    
    hasAccess = isAssigned;
    accessReason = isAssigned ? 'Course is assigned to student' : 'Course NOT assigned to student';
  }
  
  console.log('Has access:', hasAccess);
  console.log('Reason:', accessReason);
  console.log('');

  // STEP 4: Fetch course data
  const fetchCourse = useCallback(async () => {
    console.log('🔄 STEP 4: FETCH COURSE DATA');
    console.log('─────────────────────────────────────────');
    console.log('Starting fetch...');
    console.log('API URL:', `/courses/${id}`);
    console.log('Token exists:', !!localStorage.getItem('token'));
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Making API request...');
      const startTime = Date.now();
      
      const { data } = await api.get(`/courses/${id}`);
      
      const endTime = Date.now();
      console.log(`✅ Request completed in ${endTime - startTime}ms`);
      console.log('');
      
      console.log('📦 RESPONSE DATA:');
      console.log('─────────────────────────────────────────');
      console.log('Course title:', data.title);
      console.log('Course ID:', data._id);
      console.log('Course category:', data.category);
      console.log('Course level:', data.level);
      console.log('Is published:', data.isPublished);
      console.log('Videos count:', data.videos?.length || 0);
      console.log('Quiz questions count:', data.quizQuestions?.length || 0);
      console.log('Modules count:', data.modules?.length || 0);
      
      if (data.videos?.length > 0) {
        console.log('First video:', data.videos[0].title);
        console.log('First video URL:', data.videos[0].url);
      }
      
      if (data.quizQuestions?.length > 0) {
        console.log('First question:', data.quizQuestions[0].question.substring(0, 50) + '...');
      }
      
      console.log('');
      console.log('Full course object:', data);
      console.log('');
      
      // Store debug info
      setDebugInfo({
        fetchTime: endTime - startTime,
        courseId: data._id,
        title: data.title,
        videosCount: data.videos?.length || 0,
        quizCount: data.quizQuestions?.length || 0,
        modulesCount: data.modules?.length || 0,
        isPublished: data.isPublished,
        hasAccess,
        accessReason
      });
      
      setCourse(data);
      console.log('✅ Course state updated');
      
    } catch (err) {
      console.log('');
      console.log('❌ ERROR FETCHING COURSE');
      console.log('─────────────────────────────────────────');
      console.error('Error object:', err);
      console.error('Error message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Request config:', err.config);
      console.log('');
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load course';
      setError(errorMessage);
      
      setDebugInfo({
        error: errorMessage,
        status: err.response?.status,
        hasAccess,
        accessReason
      });
    } finally {
      setLoading(false);
      console.log('Loading state set to false');
      console.log('');
    }
  }, [id, hasAccess, accessReason]);

  useEffect(() => {
    console.log('🚀 useEffect triggered - calling fetchCourse');
    fetchCourse();
  }, [fetchCourse]);

  // STEP 5: Render based on state
  console.log('🎨 STEP 5: RENDER DECISION');
  console.log('─────────────────────────────────────────');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Course exists:', !!course);
  console.log('Has access:', hasAccess);
  console.log('');

  // HARD DEBUG MODE - Show everything on screen
  if (HARD_DEBUG_MODE) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '2rem', background: '#1a1a1a', color: '#00ff00', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#00ff00', marginBottom: '2rem' }}>🐛 HARD DEBUG MODE</h1>
          
          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#ffff00' }}>📋 URL & ID Info</h2>
            <pre style={{ color: '#00ff00', fontSize: '14px' }}>
              Current URL: {window.location.href}
              Course ID: {id}
              ID Type: {typeof id}
              ID Length: {id?.length}
              Valid ObjectId: {/^[0-9a-fA-F]{24}$/.test(id) ? '✅ YES' : '❌ NO'}
            </pre>
          </section>

          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#ffff00' }}>👤 User Info</h2>
            <pre style={{ color: '#00ff00', fontSize: '14px' }}>
              Logged In: {user ? '✅ YES' : '❌ NO'}
              Email: {user?.email || 'N/A'}
              Role: {user?.role || 'N/A'}
              Assigned Courses: {user?.assignedCourses?.length || 0}
            </pre>
            {user?.assignedCourses?.length > 0 && (
              <div>
                <h3 style={{ color: '#00ffff', marginTop: '1rem' }}>Assigned Course IDs:</h3>
                <ul style={{ color: '#00ff00' }}>
                  {user.assignedCourses.map((c, i) => {
                    const courseId = typeof c === 'object' ? c._id : c;
                    const courseTitle = typeof c === 'object' ? c.title : 'ID only';
                    return <li key={i}>{courseTitle}: {courseId?.toString()}</li>;
                  })}
                </ul>
              </div>
            )}
          </section>

          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#ffff00' }}>🔐 Access Control</h2>
            <pre style={{ color: '#00ff00', fontSize: '14px' }}>
              Has Access: {hasAccess ? '✅ YES' : '❌ NO'}
              Reason: {accessReason}
            </pre>
          </section>

          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#ffff00' }}>🔄 Loading State</h2>
            <pre style={{ color: '#00ff00', fontSize: '14px' }}>
              Loading: {loading ? '⏳ YES' : '✅ NO'}
              Error: {error || 'None'}
              Course Loaded: {course ? '✅ YES' : '❌ NO'}
            </pre>
          </section>

          {course && (
            <section style={{ marginBottom: '2rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
              <h2 style={{ color: '#ffff00' }}>📦 Course Data</h2>
              <pre style={{ color: '#00ff00', fontSize: '14px' }}>
                Title: {course.title}
                ID: {course._id}
                Category: {course.category}
                Level: {course.level}
                Published: {course.isPublished ? '✅ YES' : '❌ NO'}
                Videos: {course.videos?.length || 0}
                Quiz Questions: {course.quizQuestions?.length || 0}
                Modules: {course.modules?.length || 0}
              </pre>
              
              {course.videos?.length > 0 && (
                <div>
                  <h3 style={{ color: '#00ffff', marginTop: '1rem' }}>Videos:</h3>
                  <ul style={{ color: '#00ff00' }}>
                    {course.videos.map((v, i) => (
                      <li key={i}>{v.title} - {v.url}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {course.quizQuestions?.length > 0 && (
                <div>
                  <h3 style={{ color: '#00ffff', marginTop: '1rem' }}>Quiz Questions:</h3>
                  <ul style={{ color: '#00ff00' }}>
                    {course.quizQuestions.map((q, i) => (
                      <li key={i}>{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <section style={{ marginBottom: '2rem', padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#ffff00' }}>📊 Debug Info</h2>
            <pre style={{ color: '#00ff00', fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </section>

          <section style={{ padding: '1rem', background: '#0a0a0a', borderRadius: '8px' }}>
            <h2 style={{ color: '#ffff00' }}>🔍 Full Course Object</h2>
            <pre style={{ color: '#00ff00', fontSize: '11px', overflow: 'auto', maxHeight: '400px' }}>
              {JSON.stringify(course, null, 2)}
            </pre>
          </section>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#ff0000', color: '#fff', borderRadius: '8px' }}>
            <h3>⚠️ IMPORTANT</h3>
            <p>This is DEBUG MODE. To restore normal view:</p>
            <ol>
              <li>Rename CourseDetailPage.jsx to CourseDetailPage-DEBUG.jsx</li>
              <li>Rename CourseDetailPage-OLD.jsx to CourseDetailPage.jsx</li>
              <li>Refresh the page</li>
            </ol>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ padding: '1rem 2rem', fontSize: '16px', cursor: 'pointer' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Normal rendering (if HARD_DEBUG_MODE is false)
  if (loading) {
    return (
      <main className="container page">
        <div className="loading-spinner">Loading course...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container page">
        <div className="card error-message">
          <h2>Error Loading Course</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="primary-btn">
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="container page">
        <div className="card error-message">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/dashboard')} className="primary-btn">
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!hasAccess && user?.role === 'student') {
    return (
      <main className="container page">
        <div className="card" style={{ 
          padding: '40px',
          textAlign: 'center',
          border: '2px solid #ef4444',
          background: '#fef2f2'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>🚫 Access Denied</h2>
          <p style={{ fontSize: '18px', marginBottom: '12px' }}>
            You don't have access to: <strong>{course.title}</strong>
          </p>
          <p className="muted" style={{ marginBottom: '24px' }}>
            This course has not been assigned to you. Please contact an administrator.
          </p>
          <button onClick={() => navigate('/dashboard')} className="primary-btn">
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // Course loaded successfully
  return (
    <main className="container page">
      <div className="card">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="meta-row">
          <span className="chip">{course.category}</span>
          <span className="chip">{course.level}</span>
        </div>
        
        {course.videos?.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Videos ({course.videos.length})</h2>
            <ul>
              {course.videos.map((v, i) => (
                <li key={i}>{v.title}</li>
              ))}
            </ul>
          </div>
        )}
        
        {course.quizQuestions?.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Quiz Questions ({course.quizQuestions.length})</h2>
          </div>
        )}
        
        <button onClick={() => navigate('/dashboard')} className="ghost-btn" style={{ marginTop: '2rem' }}>
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
};

export default CourseDetailPage;

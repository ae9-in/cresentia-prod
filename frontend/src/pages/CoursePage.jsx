import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * COURSE PAGE - Video Learning Interface
 * 
 * Features:
 * - Left side: Video player with playlist
 * - Right side: Course info and assessment button
 * - Cloudinary video support
 * - Progress tracking
 * - No blank screens - always shows something
 */

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);
      
      console.log('✅ Course loaded:', data.title);
      console.log('   Videos:', data.videos?.length || 0);
      console.log('   Quiz Questions:', data.quizQuestions?.length || 0);
      
    } catch (err) {
      console.error('❌ Error loading course:', err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch enrollment data
  const fetchEnrollment = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data } = await api.get('/enrollments');
      const found = data.find(e => e.course?._id === id);
      
      if (found) {
        setEnrollment(found);
        // Resume from last watched video
        if (found.completedVideos?.length > 0) {
          const lastCompleted = Math.max(...found.completedVideos);
          setCurrentVideoIndex(Math.min(lastCompleted + 1, (course?.videos?.length || 1) - 1));
        }
      }
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    }
  }, [id, user, course]);

  // Load data on mount
  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (course) {
      fetchEnrollment();
    }
  }, [course, fetchEnrollment]);

  // OPTIMIZATION: Preload next video for faster switching
  useEffect(() => {
    if (!course?.videos || currentVideoIndex >= course.videos.length - 1) return;
    
    const nextVideo = course.videos[currentVideoIndex + 1];
    if (nextVideo?.url) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'video';
      link.href = nextVideo.url;
      link.type = 'video/mp4';
      document.head.appendChild(link);
      
      return () => {
        try {
          document.head.removeChild(link);
        } catch (e) {
          // Link already removed or doesn't exist
        }
      };
    }
  }, [currentVideoIndex, course]);

  // Enroll in course
  const handleEnroll = async () => {
    try {
      const { data } = await api.post(`/enrollments/${id}`);
      setEnrollment(data);
      setMessage('✅ Enrolled successfully! Start learning now.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to enroll'));
    }
  };

  // Mark video as completed
  const markVideoCompleted = async (videoIndex) => {
    if (!enrollment) return;
    
    try {
      const { data } = await api.patch(`/enrollments/${id}/video-progress`, {
        videoIndex
      });
      setEnrollment(data);
      setMessage('✅ Progress saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    if (!enrollment) return;
    
    // Mark current video as completed
    if (!enrollment.completedVideos?.includes(currentVideoIndex)) {
      markVideoCompleted(currentVideoIndex);
    }
    
    // Auto-advance to next video
    if (currentVideoIndex < (course?.videos?.length || 0) - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // Get video URL (Cloudinary only)
  const getVideoUrl = (video) => {
    if (!video?.url) return '';
    return video.url.trim();
  };

  // Check if all videos are completed
  const allVideosCompleted = enrollment?.completedVideos?.length === course?.videos?.length;

  // LOADING STATE
  if (loading) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner">Loading course...</div>
          <p className="muted" style={{ marginTop: '1rem' }}>Please wait while we load the course content</p>
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '2px solid #ef4444' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>❌ Error Loading Course</h2>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/dashboard')} className="primary-btn">
              ← Back to Dashboard
            </button>
            <button onClick={fetchCourse} className="ghost-btn">
              🔄 Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  // COURSE NOT FOUND
  if (!course) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>📚 Course Not Found</h2>
          <p className="muted" style={{ marginBottom: '2rem' }}>
            The course you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => navigate('/dashboard')} className="primary-btn">
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // NO VIDEOS AVAILABLE
  if (!course.videos || course.videos.length === 0) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem' }}>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="meta-row">
            <span className="chip">{course.category}</span>
            <span className="chip">{course.level}</span>
          </div>
          <div style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            background: '#fef3c7', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>⚠️ No Videos Available</h3>
            <p className="muted">
              This course doesn't have any video content yet. Please check back later or contact the instructor.
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="ghost-btn" style={{ marginTop: '2rem' }}>
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // ACCESS DENIED (for students without enrollment)
  if (user?.role === 'student' && !enrollment) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem' }}>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="meta-row">
            <span className="chip">{course.category}</span>
            <span className="chip">{course.level}</span>
          </div>
          
          <div style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            background: '#f0f9ff', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>🎓 Enroll to Start Learning</h3>
            <p className="muted" style={{ marginBottom: '2rem' }}>
              Enroll in this course to access {course.videos.length} video lessons and assessments.
            </p>
            <button onClick={handleEnroll} className="primary-btn">
              Enroll Now
            </button>
          </div>
          
          {message && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#d1fae5', borderRadius: '8px' }}>
              {message}
            </div>
          )}
        </div>
      </main>
    );
  }

  // MAIN COURSE PAGE - TWO COLUMN LAYOUT
  const currentVideo = course.videos[currentVideoIndex];
  const videoUrl = getVideoUrl(currentVideo);
  const completedCount = enrollment?.completedVideos?.length || 0;
  const progressPercent = enrollment?.progressPercent || 0;

  return (
    <main className="container page">
      {/* Success Message */}
      {message && (
        <div style={{ 
          padding: '1rem', 
          background: '#d1fae5', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* Course Header */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{course.title}</h1>
        <p className="muted">{course.description}</p>
        <div className="meta-row" style={{ marginTop: '1rem' }}>
          <span className="chip">{course.category}</span>
          <span className="chip">{course.level}</span>
          <span>📹 {course.videos.length} videos</span>
          {course.quizQuestions?.length > 0 && (
            <span>📝 {course.quizQuestions.length} quiz questions</span>
          )}
        </div>
        
        {/* Progress Bar */}
        {enrollment && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                Progress: {completedCount}/{course.videos.length} videos completed
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--brand)' }}>
                {progressPercent}%
              </span>
            </div>
            <div style={{ 
              background: '#e5e7eb', 
              borderRadius: '999px', 
              height: '8px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                background: 'linear-gradient(90deg, var(--brand), var(--accent))', 
                height: '100%', 
                width: `${progressPercent}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* LEFT SIDE - Video Player and Playlist */}
        <div>
          {/* Video Player */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
            {videoUrl ? (
              <video
                key={videoUrl}
                controls
                preload="metadata"
                poster={currentVideo.thumbnailUrl || undefined}
                style={{ width: '100%', aspectRatio: '16/9', background: '#000' }}
                onEnded={handleVideoEnd}
                src={videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                background: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af'
              }}>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
                  <div>Video not available</div>
                </div>
              </div>
            )}
            
            {/* Video Info */}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>
                {currentVideoIndex + 1}. {currentVideo.title}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span className="muted">⏱️ {currentVideo.durationMinutes || 0} minutes</span>
                {enrollment?.completedVideos?.includes(currentVideoIndex) && (
                  <span style={{ color: '#10b981', fontWeight: '600' }}>✅ Completed</span>
                )}
              </div>
              
              {/* Mark as Complete Button */}
              {enrollment && !enrollment.completedVideos?.includes(currentVideoIndex) && (
                <button 
                  onClick={() => markVideoCompleted(currentVideoIndex)}
                  className="primary-btn"
                  style={{ marginTop: '1rem' }}
                >
                  ✅ Mark as Completed
                </button>
              )}
            </div>
          </div>

          {/* Video Playlist */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📹 Course Videos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {course.videos.map((video, index) => {
                const isCompleted = enrollment?.completedVideos?.includes(index);
                const isCurrent = index === currentVideoIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    style={{
                      padding: '1rem',
                      border: isCurrent ? '2px solid var(--brand)' : '1px solid var(--line)',
                      borderRadius: '8px',
                      background: isCurrent ? 'rgba(10, 106, 116, 0.05)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="video-playlist-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ 
                        fontSize: '1.2rem',
                        minWidth: '24px'
                      }}>
                        {isCompleted ? '✅' : isCurrent ? '▶️' : '⭕'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: isCurrent ? '600' : '500' }}>
                          {index + 1}. {video.title}
                        </div>
                        <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          ⏱️ {video.durationMinutes || 0} min
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Course Info and Assessment */}
        <div>
          {/* Assessment Section */}
          {course.quizQuestions?.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📝 Course Assessment</h3>
              <p className="muted" style={{ marginBottom: '1rem' }}>
                Test your knowledge with {course.quizQuestions.length} quiz questions.
              </p>
              
              {enrollment?.quizSubmittedAt ? (
                <div>
                  <div style={{ 
                    padding: '1rem', 
                    background: '#d1fae5', 
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      ✅ Assessment Completed
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand)' }}>
                      Score: {enrollment.quizScore}%
                    </div>
                  </div>
                  <Link 
                    to={`/courses/${id}/assessment`}
                    className="ghost-btn"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    📊 View Results
                  </Link>
                </div>
              ) : (
                <div>
                  {allVideosCompleted ? (
                    <Link 
                      to={`/courses/${id}/assessment`}
                      className="primary-btn"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      🚀 Start Assessment
                    </Link>
                  ) : (
                    <div style={{ 
                      padding: '1rem', 
                      background: '#fef3c7', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '0.9rem' }}>
                        Complete all {course.videos.length} videos to unlock the assessment
                      </p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#92400e' }}>
                        {completedCount}/{course.videos.length} completed
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Course Stats */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Your Progress</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Videos Watched
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {completedCount}/{course.videos.length}
                </div>
              </div>
              
              <div>
                <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Overall Progress
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {progressPercent}%
                </div>
              </div>
              
              {enrollment?.quizScore > 0 && (
                <div>
                  <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Assessment Score
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                    {enrollment.quizScore}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="ghost-btn"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
};

export default CoursePage;

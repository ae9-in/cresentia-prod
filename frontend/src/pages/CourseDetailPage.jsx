import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuizTimer from '../components/QuizTimer';
import VideoThumbnail from '../components/VideoThumbnail';
import { useAuth } from '../context/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasCourseAccess, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [loading, setLoading] = useState(true);

  // TEST MODE - Set to true to bypass access checks temporarily
  const TEST_MODE = true; // TEMPORARILY ENABLED FOR TESTING

  // Refresh user data on mount to ensure we have latest assigned courses
  useEffect(() => {
    if (user && refreshUser) {
      console.log('🔄 Refreshing user data to get latest assigned courses...');
      refreshUser();
    }
  }, []);

  console.log('\n========================================');
  console.log('🎯 CourseDetailPage Component Mounted');
  console.log('========================================');
  console.log('📋 Course ID from URL:', id);
  console.log('📋 ID type:', typeof id);
  console.log('📋 ID length:', id?.length);
  console.log('📋 ID value:', JSON.stringify(id));
  console.log('👤 Current User Email:', user?.email);
  console.log('👤 Current User Role:', user?.role);
  console.log('📚 Assigned Courses:', user?.assignedCourses);
  console.log('📚 Assigned Courses Count:', user?.assignedCourses?.length);
  console.log('📚 Assigned Course IDs:', user?.assignedCourses?.map(c => typeof c === 'object' ? c._id : c));
  console.log('🧪 TEST MODE:', TEST_MODE ? '⚠️ ENABLED (bypassing access checks)' : 'DISABLED');

  // Check access for students - but only after course is loaded
  const accessCheck = TEST_MODE ? true : (user && user.role === 'student' ? hasCourseAccess(id) : true);
  console.log('🔐 Access Check Result:', accessCheck);
  console.log('========================================\n');

  const fetchCourse = useCallback(async () => {
    try {
      console.log('\n========================================');
      console.log('🔄 Fetching Course Data');
      console.log('========================================');
      console.log('📋 Course ID:', id);
      console.log('🌐 API URL:', `/courses/${id}`);
      console.log('🔑 Token exists:', !!localStorage.getItem('token'));
      
      setLoading(true);
      const { data } = await api.get(`/courses/${id}`);
      
      console.log('✅ Course Data Received');
      console.log('📖 Course Title:', data.title);
      console.log('📖 Course ID:', data._id);
      console.log('📖 Course Published:', data.isPublished);
      console.log('📖 Course Category:', data.category);
      console.log('========================================\n');
      
      setCourse(data);
    } catch (error) {
      console.log('\n========================================');
      console.error('❌ Error Fetching Course');
      console.log('========================================');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.log('========================================\n');
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load course';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (!user) return;
    api
      .get('/enrollments')
      .then((res) => {
        const found = res.data.find((item) => item.course?._id === id);
        if (found) {
          setEnrollment(found);
          // Use new module tracking if available, fallback to video tracking
          if (found.currentModuleIndex !== undefined) {
            setCurrentStep(found.currentModuleIndex);
          } else if (found.completedVideos?.length > 0) {
            setCurrentStep(found.completedVideos[found.completedVideos.length - 1] + 1);
          }
        }
      })
      .catch(() => setEnrollment(null));
  }, [id, user]);

  const enroll = async () => {
    const { data } = await api.post(`/enrollments/${id}`);
    setEnrollment(data);
    setMessage('Enrolled successfully! Start learning now.');
    setTimeout(() => setMessage(''), 3000);
  };

  const markModuleCompleted = async () => {
    try {
      const module = getModules()[currentStep];
      let currentEnrollment = enrollment;

      // Auto-enroll if not enrolled (common for admins/instructors)
      if (!currentEnrollment) {
        console.log('📝 Auto-enrolling user to track progress...');
        const enrollRes = await api.post(`/enrollments/${id}`);
        currentEnrollment = enrollRes.data;
        setEnrollment(currentEnrollment);
      }
      
      // For backward compatibility with old video-based system
      if (!course.modules || course.modules.length === 0) {
        const { data } = await api.patch(`/enrollments/${id}/video-progress`, { videoIndex: currentStep });
        setEnrollment(data);
      } else {
        // New module-based system
        const { data } = await api.patch(`/enrollments/${id}/module-progress`, { 
          moduleId: module._id,
          moduleIndex: currentStep 
        });
        setEnrollment(data);
      }
      
      setMessage('Progress saved! Continue to next module.');
      setTimeout(() => setMessage(''), 3000);
      
      // Move to next step
      const modules = getModules();
      if (currentStep < modules.length - 1) {
        setCurrentStep(currentStep + 1);
        setShowAssessment(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save progress');
    }
  };

  const continueToAssessment = () => {
    setShowAssessment(true);
    setTimerRunning(true);
  };

  const downloadCertificate = async () => {
    const res = await api.get(`/enrollments/${id}/certificate`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crescentia-certificate-${id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const submitQuiz = useCallback(async () => {
    try {
      setTimerRunning(false);
      const moduleId = currentModule?.type === 'assessment' ? currentModule._id : null;
      const { data } = await api.post(`/enrollments/${id}/quiz`, { 
        answers,
        moduleId 
      });
      setQuizResult(data);
      const enrollments = await api.get('/enrollments');
      const found = enrollments.data.find((item) => item.course?._id === id);
      if (found) setEnrollment(found);
      setMessage(data.passed ? '🎉 Assessment passed!' : 'Assessment submitted. Review your results below.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Quiz submission failed');
    }
  }, [answers, id, currentModule]);

  const submitReview = async (e) => {
    e.preventDefault();
    await api.post(`/courses/${id}/reviews`, review);
    setReview({ rating: 5, comment: '' });
    fetchCourse();
    setMessage('Review submitted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Helper to get modules (supports both old and new structure)
  const getModules = () => {
    if (course?.modules && course.modules.length > 0) {
      return course.modules.sort((a, b) => a.order - b.order);
    }
    // Fallback to old video structure
    return course?.videos?.map((video, index) => ({
      type: 'video',
      title: video.title,
      videoUrl: video.url,
      durationMinutes: video.durationMinutes,
      order: index
    })) || [];
  };

  const canLearn = !!user && !!enrollment;
  const modules = getModules();
  const currentModule = modules[currentStep];
  const hasQuiz = (course?.quizQuestions && course.quizQuestions.length > 0) || 
                  modules.some(m => m.type === 'assessment');
  
  // Check if all modules are completed
  const allModulesCompleted = enrollment?.completedModules?.length === modules.length ||
                               enrollment?.completedVideos?.length === modules.length;
  
  // Check if current module is completed
  const isCurrentModuleCompleted = enrollment?.completedModules?.includes(currentModule?._id) ||
                                    enrollment?.completedVideos?.includes(currentStep);

  // Get YouTube embed URL
  const getYoutubeEmbed = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.includes('youtube.com/embed')) return trimmed;
    const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i) || [];
    return match[1] ? `https://www.youtube.com/embed/${match[1]}` : '';
  };

  if (loading) return <main className="container page"><div className="loading-spinner">Loading course...</div></main>;
  if (!course) return <main className="container page"><div className="error-message">Course not found</div></main>;

  // Check access AFTER course is loaded
  if (user && user.role === 'student' && !accessCheck) {
    console.log('🚫 Access denied for course:', course.title);
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
          <p className="muted" style={{ marginBottom: '8px' }}>
            Course ID: {id}
          </p>
          <p className="muted" style={{ marginBottom: '24px' }}>
            You have {user.assignedCourses?.length || 0} course(s) assigned
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/courses" className="primary-btn">
              Back to My Courses
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="ghost-btn"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container page">
      {/* Course Header */}
      <section className="card course-header-card">
        <div className="course-header-content">
          <div>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="meta-row">
              <span className="chip">{course.category}</span>
              <span className={`difficulty-badge ${course.level?.toLowerCase()}`}>
                {course.level}
              </span>
              {course.estimatedDuration && (
                <span>⏱️ {course.estimatedDuration}h</span>
              )}
              <span>⭐ {course.ratingAverage?.toFixed(1) || '0.0'}</span>
            </div>
            
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="learning-outcomes">
                <h4>What you'll learn:</h4>
                <ul>
                  {course.learningOutcomes.slice(0, 4).map((outcome, idx) => (
                    <li key={idx}>✓ {outcome}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="prerequisites">
                <h4>Prerequisites:</h4>
                <p>{course.prerequisites.join(' • ')}</p>
              </div>
            )}
          </div>
          {!enrollment && user && (
            <button className="primary-btn enroll-btn" onClick={enroll} type="button">
              Enroll Now
            </button>
          )}
          {enrollment?.progressPercent === 100 && (
            <button className="primary-btn" type="button" onClick={downloadCertificate}>
              📄 Download Certificate
            </button>
          )}
        </div>
        {message && <p className="success message-banner">{message}</p>}
      </section>

      {/* Progress Tracker */}
      {canLearn && modules.length > 0 && (
        <section className="progress-tracker card">
          <h3>Your Progress</h3>
          <div className="module-steps">
            {modules.map((module, index) => {
              const isCompleted = enrollment?.completedModules?.includes(module._id) ||
                                 enrollment?.completedVideos?.includes(index);
              const isCurrent = index === currentStep;
              
              return (
                <div 
                  key={module._id || index} 
                  className={`module-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => isCompleted && setCurrentStep(index)}
                  style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                >
                  <div className="step-number">{isCompleted ? '✓' : index + 1}</div>
                  <div className="step-info">
                    <div className="step-title">{module.title}</div>
                    <div className="step-type">{module.type}</div>
                  </div>
                </div>
              );
            })}
            {hasQuiz && (
              <div className={`module-step ${enrollment?.quizSubmittedAt ? 'completed' : ''} ${allModulesCompleted && !enrollment?.quizSubmittedAt ? 'current' : ''}`}>
                <div className="step-number">{enrollment?.quizSubmittedAt ? '✓' : modules.length + 1}</div>
                <div className="step-info">
                  <div className="step-title">Final Assessment</div>
                  <div className="step-type">assessment</div>
                </div>
              </div>
            )}
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${enrollment?.progressPercent || 0}%` }}></div>
          </div>
          <p className="progress-text">{enrollment?.progressPercent || 0}% Complete</p>
        </section>
      )}

      {/* Module Grid with Thumbnails */}
      {canLearn && modules.length > 0 && modules.some(m => m.type === 'video') && (
        <section className="card">
          <h3 className="mb-4">Course Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              if (module.type !== 'video') return null;
              
              const isCompleted = enrollment?.completedModules?.includes(module._id) ||
                                 enrollment?.completedVideos?.includes(index);
              const isCurrent = index === currentStep;
              const isLocked = index > 0 && !enrollment?.completedModules?.includes(modules[index - 1]._id) &&
                              !enrollment?.completedVideos?.includes(index - 1);
              
              return (
                <VideoThumbnail
                  key={module._id || index}
                  module={module}
                  onClick={() => setCurrentStep(index)}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Learning Content */}
      {canLearn && currentModule && !showAssessment && (
        <section className="learning-content">
          {/* Video Module */}
          {currentModule.type === 'video' && (
            <div className="card video-module">
              <h2>📹 {currentModule.title}</h2>
              <p className="muted">Duration: {currentModule.durationMinutes} minutes</p>
              
              <div className="video-player">
                {getYoutubeEmbed(currentModule.videoUrl) ? (
                  <iframe
                    src={getYoutubeEmbed(currentModule.videoUrl)}
                    title={currentModule.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls width="100%" src={currentModule.videoUrl} />
                )}
              </div>

              <div className="module-actions">
                {!isCurrentModuleCompleted && (
                  <button className="primary-btn" onClick={markModuleCompleted} type="button">
                    Mark as Complete & Continue →
                  </button>
                )}
                {isCurrentModuleCompleted && currentStep < modules.length - 1 && (
                  <button className="primary-btn" onClick={() => setCurrentStep(currentStep + 1)} type="button">
                    Next Module →
                  </button>
                )}
                {isCurrentModuleCompleted && currentStep === modules.length - 1 && hasQuiz && !enrollment?.quizSubmittedAt && (
                  <button className="primary-btn" onClick={continueToAssessment} type="button">
                    Continue to Final Assessment →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Theory Module */}
          {currentModule.type === 'theory' && (
            <div className="card theory-module">
              <h2 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {currentModule.title}
              </h2>
              <div className="theory-content" dangerouslySetInnerHTML={{ __html: currentModule.content }} />
              
              <div className="module-actions">
                {!isCurrentModuleCompleted && (
                  <button className="primary-btn" onClick={markModuleCompleted} type="button">
                    Mark as Complete & Continue →
                  </button>
                )}
                {isCurrentModuleCompleted && currentStep < modules.length - 1 && (
                  <button className="primary-btn" onClick={() => setCurrentStep(currentStep + 1)} type="button">
                    Next Module →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Module Assessment */}
          {currentModule.type === 'assessment' && (
            <div className="card assessment-module">
              <div className="assessment-header">
                <div>
                  <h2>✏️ {currentModule.title}</h2>
                  <p className="muted">Time Limit: {currentModule.timeLimit} minutes • Passing Score: {currentModule.passingScore || 70}%</p>
                </div>
                {enrollment?.averageAssessmentScore > 0 && (
                  <div className="performance-badge">
                    Avg Score: {enrollment.averageAssessmentScore}%
                  </div>
                )}
              </div>
              
              <QuizTimer durationMinutes={currentModule.timeLimit} onTimeout={submitQuiz} isRunning={timerRunning} />
              
              {!quizResult && currentModule.questions?.map((question, qIndex) => (
                <div key={qIndex} className={`question-block difficulty-${question.difficulty || 'medium'}`}>
                  <div className="question-header">
                    <p className="question-text">
                      {qIndex + 1}. {question.question}
                    </p>
                    <div className="question-meta">
                      <span className={`difficulty-tag ${question.difficulty || 'medium'}`}>
                        {question.difficulty || 'medium'}
                      </span>
                      <span className="question-type-tag">
                        {question.questionType || 'concept'}
                      </span>
                      {question.points > 1 && (
                        <span className="points-tag">{question.points} pts</span>
                      )}
                    </div>
                  </div>
                  {question.options.map((option, oIndex) => (
                    <label key={oIndex} className="option-row">
                      <input
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={Number(answers[qIndex]) === oIndex}
                        onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                        disabled={!!quizResult}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ))}
              
              {!quizResult && (
                <button className="primary-btn" onClick={submitQuiz} type="button">
                  Submit Assessment
                </button>
              )}
              
              {quizResult && (
                <div className={`quiz-result ${quizResult.passed ? 'passed' : 'failed'}`}>
                  <h3>{quizResult.passed ? '🎉 Congratulations!' : '📝 Review Your Results'}</h3>
                  <div className="result-stats">
                    <div className="stat">
                      <span className="stat-label">Score</span>
                      <span className="stat-value">{quizResult.percentage}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Points</span>
                      <span className="stat-value">{quizResult.score}/{quizResult.totalPoints}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Status</span>
                      <span className={`stat-value ${quizResult.passed ? 'passed' : 'failed'}`}>
                        {quizResult.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Detailed Results with Explanations */}
                  {quizResult.detailedResults && (
                    <div className="detailed-results">
                      <h4>Question Review:</h4>
                      {quizResult.detailedResults.map((result, idx) => {
                        const question = currentModule.questions[result.questionIndex];
                        return (
                          <div key={idx} className={`result-item ${result.correct ? 'correct' : 'incorrect'}`}>
                            <div className="result-header">
                              <span className="result-icon">{result.correct ? '✓' : '✗'}</span>
                              <span className="result-question">Question {result.questionIndex + 1}</span>
                              <span className="result-points">{result.points} pts</span>
                            </div>
                            <p className="result-question-text">{question.question}</p>
                            <div className="result-answers">
                              <p className={result.correct ? 'correct-answer' : 'wrong-answer'}>
                                Your answer: {question.options[result.userAnswer]}
                              </p>
                              {!result.correct && (
                                <p className="correct-answer">
                                  Correct answer: {question.options[result.correctAnswer]}
                                </p>
                              )}
                            </div>
                            {result.explanation && (
                              <div className="explanation">
                                <strong>Explanation:</strong> {result.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {quizResult.passed && currentStep < modules.length - 1 && (
                    <button className="primary-btn" onClick={() => {
                      setCurrentStep(currentStep + 1);
                      setQuizResult(null);
                      setAnswers({});
                      setTimerRunning(false);
                    }} type="button">
                      Continue to Next Module →
                    </button>
                  )}
                  
                  {!quizResult.passed && (
                    <button className="ghost-btn" onClick={() => {
                      setQuizResult(null);
                      setAnswers({});
                      setTimerRunning(true);
                    }} type="button">
                      Retry Assessment
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Final Assessment (Legacy Quiz) */}
      {canLearn && showAssessment && allModulesCompleted && course.quizQuestions?.length > 0 && (
        <section className="card assessment-module">
          <h2>✏️ Final Assessment</h2>
          <p className="muted">Complete this assessment to finish the course</p>
          <p className="warning-text">⚠️ You cannot go back once you start the assessment</p>
          
          <QuizTimer durationMinutes={15} onTimeout={submitQuiz} isRunning={timerRunning} />
          
          {course.quizQuestions.map((question, qIndex) => (
            <div key={qIndex} className="question-block">
              <p className="question-text">
                {qIndex + 1}. {question.question}
              </p>
              {question.options.map((option, oIndex) => (
                <label key={oIndex} className="option-row">
                  <input
                    type="radio"
                    name={`q-${qIndex}`}
                    checked={Number(answers[qIndex]) === oIndex}
                    onChange={() => setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          
          <button className="primary-btn" onClick={submitQuiz} type="button">
            Submit Final Assessment
          </button>
          {quizResult && (
            <div className="quiz-result">
              <p className="success">Score: {quizResult.score}%</p>
              {quizResult.score >= 70 && <p className="success">🎉 Congratulations! You passed the course!</p>}
            </div>
          )}
        </section>
      )}

      {/* Enrollment Required Message */}
      {!canLearn && user && (
        <section className="card empty-state">
          <h3>Enroll to Start Learning</h3>
          <p className="muted">Enroll in this course to access all modules and assessments</p>
          <button className="primary-btn" onClick={enroll} type="button">
            Enroll Now
          </button>
        </section>
      )}

      {!user && (
        <section className="card empty-state">
          <h3>Login Required</h3>
          <p className="muted">Please login to enroll and access course content</p>
          <Link className="primary-btn" to="/login">
            Go to Login
          </Link>
        </section>
      )}

      {/* Reviews Section */}
      <section className="card reviews-section">
        <h2>Ratings & Reviews</h2>
        {course.reviews?.length === 0 && <p className="muted">No reviews yet. Be the first to review!</p>}
        <div className="reviews-list">
          {course.reviews?.map((item) => (
            <div key={item._id} className="review-block">
              <div className="review-header">
                <strong>{item.name}</strong>
                <span className="review-rating">{'⭐'.repeat(item.rating)}</span>
              </div>
              <p>{item.comment}</p>
              <span className="review-date">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

        {user && enrollment && (
          <form className="review-form" onSubmit={submitReview}>
            <h3>Add Your Review</h3>
            <label className="field">
              <span>Rating</span>
              <select
                value={review.rating}
                onChange={(e) => setReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {'⭐'.repeat(r)} ({r}/5)
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Your Review</span>
              <textarea
                value={review.comment}
                onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this course..."
                required
                rows="4"
              />
            </label>
            <button className="primary-btn" type="submit">
              Submit Review
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default CourseDetailPage;

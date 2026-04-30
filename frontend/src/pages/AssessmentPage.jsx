import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * ASSESSMENT PAGE - Quiz with Timer
 * 
 * Features:
 * - Countdown timer
 * - Question navigation
 * - Auto-submit on timeout
 * - Results display
 * - Certificate download
 */

const AssessmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch course and enrollment
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data);
        
        // Fetch enrollment
        const enrollmentRes = await api.get('/enrollments');
        const found = enrollmentRes.data.find(e => e.course?._id === id);
        
        if (found) {
          setEnrollment(found);
          // If already submitted, show results
          if (found.quizSubmittedAt) {
            setQuizSubmitted(true);
            setResult({
              score: found.quizScore,
              passed: found.quizScore >= 70
            });
          }
        }
        
      } catch (err) {
        console.error('Error loading assessment:', err);
        setError(err.response?.data?.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || quizSubmitted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizStarted, quizSubmitted, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start quiz
  const startQuiz = () => {
    setQuizStarted(true);
  };

  // Handle answer selection
  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      const { data } = await api.post(`/enrollments/${id}/quiz`, { answers });
      
      setResult({
        score: data.score,
        passed: data.passed,
        details: data.details
      });
      setQuizSubmitted(true);
      
      // Refresh enrollment
      const enrollmentRes = await api.get('/enrollments');
      const found = enrollmentRes.data.find(e => e.course?._id === id);
      if (found) {
        setEnrollment(found);
      }
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, submitting]);

  // Download certificate
  const downloadCertificate = async () => {
    try {
      const response = await api.get(`/enrollments/${id}/certificate`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `crescentia-certificate-${course.title.replace(/\s+/g, '-')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate');
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner">Loading assessment...</div>
        </div>
      </main>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '2px solid #ef4444' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>❌ Error</h2>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <button onClick={() => navigate(`/courses/${id}`)} className="primary-btn">
            ← Back to Course
          </button>
        </div>
      </main>
    );
  }

  // NO ENROLLMENT
  if (!enrollment) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>🚫 Not Enrolled</h2>
          <p className="muted" style={{ marginBottom: '2rem' }}>
            You need to enroll in this course before taking the assessment.
          </p>
          <button onClick={() => navigate(`/courses/${id}`)} className="primary-btn">
            ← Back to Course
          </button>
        </div>
      </main>
    );
  }

  // NO QUIZ QUESTIONS
  if (!course?.quizQuestions || course.quizQuestions.length === 0) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>📝 No Assessment Available</h2>
          <p className="muted" style={{ marginBottom: '2rem' }}>
            This course doesn't have an assessment yet.
          </p>
          <button onClick={() => navigate(`/courses/${id}`)} className="primary-btn">
            ← Back to Course
          </button>
        </div>
      </main>
    );
  }

  // RESULTS VIEW (after submission)
  if (quizSubmitted && result) {
    const isPassed = result.passed;
    
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem' }}>
          {/* Results Header */}
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: isPassed ? '#d1fae5' : '#fee2e2',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {isPassed ? (
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 auto', display: 'block'}}>
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{margin: '0 auto', display: 'block'}}>
                  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="#FF5F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="#FF5F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <h1 style={{ marginBottom: '0.5rem' }}>
              {isPassed ? 'Congratulations!' : 'Keep Learning!'}
            </h1>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              {isPassed 
                ? 'You have successfully completed the assessment!' 
                : 'You need 70% to pass. Review the material and try again.'}
            </p>
            <div style={{ 
              fontSize: '3rem', 
              fontWeight: '700', 
              color: isPassed ? '#10b981' : '#ef4444'
            }}>
              {result.score}%
            </div>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Total Questions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                {course.quizQuestions.length}
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Your Score
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--brand)' }}>
                {result.score}%
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Status
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isPassed ? '#10b981' : '#ef4444' }}>
                {isPassed ? '✅ Passed' : '❌ Failed'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isPassed && (
              <button onClick={downloadCertificate} className="primary-btn">
                📄 Download Certificate
              </button>
            )}
            {!isPassed && (
              <button 
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizStarted(false);
                  setAnswers({});
                  setTimeLeft(900);
                  setResult(null);
                }} 
                className="primary-btn"
              >
                🔄 Retake Assessment
              </button>
            )}
            <button onClick={() => navigate(`/courses/${id}`)} className="ghost-btn">
              ← Back to Course
            </button>
            <button onClick={() => navigate('/dashboard')} className="ghost-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle'}}>
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // QUIZ START SCREEN
  if (!quizStarted) {
    return (
      <main className="container page">
        <div className="card" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1rem' }}>📝 {course.title}</h1>
          <h2 style={{ marginBottom: '2rem', color: 'var(--brand)' }}>Course Assessment</h2>
          
          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))', 
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 4px 16px rgba(6, 182, 212, 0.2)'
          }}>
            <h3 style={{ 
              marginBottom: '1rem',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📋 Assessment Details
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ 
                padding: '0.75rem 0', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e5e7eb'
              }}>
                <strong style={{ color: '#06b6d4' }}>Questions:</strong> {course.quizQuestions.length}
              </li>
              <li style={{ 
                padding: '0.75rem 0', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e5e7eb'
              }}>
                <strong style={{ color: '#06b6d4' }}>Time Limit:</strong> 15 minutes
              </li>
              <li style={{ 
                padding: '0.75rem 0', 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e5e7eb'
              }}>
                <strong style={{ color: '#06b6d4' }}>Passing Score:</strong> 70%
              </li>
              <li style={{ 
                padding: '0.75rem 0',
                color: '#e5e7eb'
              }}>
                <strong style={{ color: '#06b6d4' }}>Attempts:</strong> {enrollment?.quizAttempts || 0}
              </li>
            </ul>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05))', 
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 4px 16px rgba(251, 191, 36, 0.2)'
          }}>
            <h3 style={{ 
              marginBottom: '0.75rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Important
            </h3>
            <ul style={{ 
              margin: '0.5rem 0 0 1.5rem', 
              lineHeight: '1.8',
              color: '#e5e7eb'
            }}>
              <li>You cannot pause once started</li>
              <li>Quiz will auto-submit when time runs out</li>
              <li>Make sure you have a stable internet connection</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={startQuiz} className="primary-btn" style={{ flex: 1 }}>
              🚀 Start Assessment
            </button>
            <button onClick={() => navigate(`/courses/${id}`)} className="ghost-btn">
              Cancel
            </button>
          </div>
        </div>
      </main>
    );
  }

  // QUIZ IN PROGRESS
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === course.quizQuestions.length;
  const timeWarning = timeLeft < 60; // Less than 1 minute

  return (
    <main className="container page">
      {/* Timer Bar */}
      <div style={{ 
        position: 'sticky', 
        top: '72px', 
        zIndex: 100,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ 
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#f3f4f6',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {course.title} - Assessment
            </h3>
            <p className="muted" style={{ 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.95rem',
              color: '#9ca3af'
            }}>
              {answeredCount}/{course.quizQuestions.length} questions answered
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700',
              color: timeWarning ? '#ef4444' : '#06b6d4',
              fontFamily: 'monospace',
              textShadow: timeWarning 
                ? '0 0 20px rgba(239, 68, 68, 0.8)' 
                : '0 0 20px rgba(6, 182, 212, 0.6)',
              letterSpacing: '0.05em'
            }}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            {timeWarning && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '0.9rem', 
                fontWeight: '600',
                marginTop: '0.25rem',
                animation: 'pulse 1s infinite'
              }}>
                ⚠️ Time running out!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="card" style={{ 
        padding: '2.5rem', 
        marginBottom: '1.5rem',
        background: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {course.quizQuestions.map((question, qIndex) => (
          <div 
            key={qIndex}
            style={{ 
              marginBottom: qIndex < course.quizQuestions.length - 1 ? '3rem' : 0,
              paddingBottom: qIndex < course.quizQuestions.length - 1 ? '3rem' : 0,
              borderBottom: qIndex < course.quizQuestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ 
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#06b6d4',
                minWidth: '40px',
                textShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
              }}>
                {qIndex + 1}.
              </span>
              <h3 style={{ 
                margin: 0, 
                flex: 1,
                fontSize: '1.15rem',
                fontWeight: '500',
                color: '#f3f4f6',
                lineHeight: '1.6'
              }}>
                {question.question}
              </h3>
              {answers[qIndex] !== undefined && (
                <span style={{ 
                  color: '#10b981', 
                  fontSize: '1.5rem',
                  textShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                  animation: 'pulse 2s infinite'
                }}>
                  ✓
                </span>
              )}
            </div>
            
            <div style={{ marginLeft: '3rem' }}>
              {question.options.map((option, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                return (
                  <label 
                    key={oIndex}
                    style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      alignItems: 'center',
                      padding: '1.25rem 1.5rem',
                      marginBottom: '0.75rem',
                      border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
                        : 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: isSelected 
                        ? '0 0 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    className="quiz-option"
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    {/* Left: Option Text */}
                    <span style={{ 
                      fontSize: '1rem',
                      fontWeight: isSelected ? '600' : '400',
                      color: isSelected ? '#10b981' : '#e5e7eb',
                      letterSpacing: '0.01em',
                      transition: 'all 0.3s ease'
                    }}>
                      {option}
                    </span>
                    
                    {/* Center: Radio Button */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      padding: '0 1rem'
                    }}>
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(qIndex, oIndex)}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #10b981' : '2px solid rgba(255, 255, 255, 0.3)',
                        background: isSelected 
                          ? 'radial-gradient(circle, #10b981 0%, #10b981 40%, transparent 40%)' 
                          : 'transparent',
                        boxShadow: isSelected 
                          ? '0 0 12px rgba(16, 185, 129, 0.6), inset 0 0 8px rgba(16, 185, 129, 0.4)' 
                          : 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative'
                      }}>
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#10b981',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
                          }} />
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Empty (for future icons) */}
                    <div style={{ textAlign: 'right' }}>
                      {isSelected && (
                        <span style={{ 
                          fontSize: '1.2rem',
                          opacity: 0.8,
                          animation: 'fadeIn 0.3s ease'
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="card" style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {!allAnswered && (
          <p className="muted" style={{ 
            marginBottom: '1.5rem',
            color: '#fbbf24',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            ⚠️ Please answer all questions before submitting
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="primary-btn"
            style={{ 
              minWidth: '240px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              opacity: !allAnswered || submitting ? 0.5 : 1,
              cursor: !allAnswered || submitting ? 'not-allowed' : 'pointer',
              background: allAnswered && !submitting 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : '#374151',
              border: 'none',
              boxShadow: allAnswered && !submitting 
                ? '0 4px 20px rgba(16, 185, 129, 0.4)' 
                : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {submitting ? '⏳ Submitting...' : '✅ Submit Assessment'}
          </button>
        </div>
      </div>
    </main>
  );
};

export default AssessmentPage;

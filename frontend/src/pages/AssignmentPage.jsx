import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import QuizTimer from '../components/QuizTimer';

const AssignmentPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [message, setMessage] = useState('');
  const [timerRunning, setTimerRunning] = useState(true);

  const fetchCourse = useCallback(() => {
    api.get(`/courses/${id}`).then((res) => setCourse(res.data));
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
        if (found) setEnrollment(found);
      })
      .catch(() => setEnrollment(null));
  }, [id, user]);

  const submitQuiz = useCallback(async () => {
    try {
      setTimerRunning(false);
      const { data } = await api.post(`/enrollments/${id}/quiz`, { answers });
      setQuizResult(data);
      const enrollments = await api.get('/enrollments');
      const found = enrollments.data.find((item) => item.course?._id === id);
      if (found) setEnrollment(found);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Assignment submission failed');
    }
  }, [answers, id]);

  const downloadCertificate = async () => {
    const res = await api.get(`/enrollments/${id}/certificate`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course-completed-${id}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const canLearn = !!user && !!enrollment;
  const questions = useMemo(() => course?.quizQuestions || [], [course]);

  if (!course) return <main className="container page">Loading...</main>;

  return (
    <main className="container page">
      <section className="card">
        <h1>{course.title} Assignment</h1>
        <p className="muted">Complete this assignment to finish the course.</p>
        <div className="meta-row">
          <Link className="ghost-btn" to={`/courses/${id}`}>
            Back to Course
          </Link>
          {enrollment?.progressPercent === 100 && (
            <button className="primary-btn" type="button" onClick={downloadCertificate}>
              Download Certificate PDF
            </button>
          )}
        </div>
        {message && <p className="error">{message}</p>}
      </section>

      <section className="card">
        <h2>Assignment (15 mins)</h2>
        {canLearn ? (
          <>
            <QuizTimer durationMinutes={15} onTimeout={submitQuiz} isRunning={timerRunning} />
            {questions.map((question, qIndex) => (
              <div key={question.question} className="question-block">
                <p>
                  {qIndex + 1}. {question.question}
                </p>
                {question.options.map((option, oIndex) => (
                  <label key={option} className="option-row">
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
              Submit Assignment
            </button>
            {quizResult && <p className="success">Score: {quizResult.score}%</p>}
          </>
        ) : (
          <p>Enroll and login as a student/instructor/admin to take this assignment.</p>
        )}
      </section>
    </main>
  );
};

export default AssignmentPage;

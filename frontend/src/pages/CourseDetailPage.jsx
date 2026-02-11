import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import QuizTimer from '../components/QuizTimer';
import { useAuth } from '../context/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
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

  const enroll = async () => {
    const { data } = await api.post(`/enrollments/${id}`);
    setEnrollment(data);
    setMessage('Enrolled successfully');
  };

  const markVideoCompleted = async () => {
    const { data } = await api.patch(`/enrollments/${id}/video-progress`, { videoIndex: selectedVideoIndex });
    setEnrollment(data);
    setMessage('Video progress saved');
  };

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

  const submitQuiz = useCallback(async () => {
    try {
      setTimerRunning(false);
      const { data } = await api.post(`/enrollments/${id}/quiz`, { answers });
      setQuizResult(data);
      const enrollments = await api.get('/enrollments');
      const found = enrollments.data.find((item) => item.course?._id === id);
      if (found) setEnrollment(found);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Quiz submission failed');
    }
  }, [answers, id]);

  const submitReview = async (e) => {
    e.preventDefault();
    await api.post(`/courses/${id}/reviews`, review);
    setReview({ rating: 5, comment: '' });
    fetchCourse();
    setMessage('Review submitted');
  };

  const canLearn = !!user && !!enrollment;
  const activeVideo = useMemo(() => course?.videos?.[selectedVideoIndex], [course, selectedVideoIndex]);
  const youtubeEmbed = useMemo(() => {
    if (!activeVideo?.url) return '';
    const url = activeVideo.url.trim();
    if (url.includes('youtube.com/embed')) {
      return url;
    }
    const match =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i) || [];
    return match[1] ? `https://www.youtube.com/embed/${match[1]}` : '';
  }, [activeVideo]);

  if (!course) return <main className="container page">Loading...</main>;

  return (
    <main className="container page">
      <section className="card">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="meta-row">
          <span>{course.category}</span>
          <span>{course.level}</span>
          <span>Rating {course.ratingAverage || 0}</span>
        </div>
        {message && <p className="success">{message}</p>}
        {!!user && !enrollment && (
          <button className="primary-btn" onClick={enroll} type="button">
            Enroll Now
          </button>
        )}
        {enrollment?.progressPercent === 100 && (
          <button className="primary-btn" type="button" onClick={downloadCertificate}>
            Download Certificate PDF
          </button>
        )}
        {canLearn && (
          <Link className="ghost-btn" to={`/courses/${id}/assignment`}>
            Go to Assignment
          </Link>
        )}
      </section>

      <section className="grid two-col">
        <article className="card">
          <h2>Course Videos</h2>
          <ul className="video-list">
            {course.videos.map((video, index) => (
              <li key={video.title}>
                <button type="button" onClick={() => setSelectedVideoIndex(index)}>
                  {index + 1}. {video.title} ({video.durationMinutes} mins)
                </button>
              </li>
            ))}
          </ul>
          {activeVideo && (
            <div className="video-player">
              {youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls width="100%" src={activeVideo.url} />
              )}
              {canLearn && (
                <button className="primary-btn" onClick={markVideoCompleted} type="button">
                  Mark This Video Completed
                </button>
              )}
            </div>
          )}
        </article>

        <article className="card">
          <h2>Assessment (15 mins)</h2>
          {canLearn ? (
            <>
              <QuizTimer durationMinutes={15} onTimeout={submitQuiz} isRunning={timerRunning} />
              {course.quizQuestions.map((question, qIndex) => (
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
                Submit Assessment
              </button>
              {quizResult && <p className="success">Score: {quizResult.score}%</p>}
            </>
          ) : (
            <p>Enroll and login as a student/instructor/admin to take this assessment.</p>
          )}
        </article>
      </section>

      <section className="card">
        <h2>Ratings & Reviews</h2>
        {course.reviews?.length === 0 && <p>No reviews yet.</p>}
        {course.reviews?.map((item) => (
          <div key={item._id} className="review-block">
            <strong>{item.name}</strong>
            <span> Rating: {item.rating}/5</span>
            <p>{item.comment}</p>
          </div>
        ))}

        {user && (
          <form className="review-form" onSubmit={submitReview}>
            <h3>Add Review</h3>
            <select
              value={review.rating}
              onChange={(e) => setReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <textarea
              value={review.comment}
              onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Write your review"
              required
            />
            <button className="primary-btn" type="submit">
              Save Review
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default CourseDetailPage;

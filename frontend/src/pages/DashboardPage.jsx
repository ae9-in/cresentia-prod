import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DashboardPage = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get('/enrollments').then((res) => setEnrollments(res.data));
  }, []);

  const downloadCertificate = async (courseId) => {
    const res = await api.get(`/enrollments/${courseId}/certificate`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course-completed-${courseId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="container page">
      <h1>Student Dashboard</h1>
      <section className="grid">
        {enrollments.map((item) => (
          <article className="card" key={item._id}>
            <h3>{item.course?.title}</h3>
            <p>{item.course?.category}</p>
            <p>Progress: {item.progressPercent}%</p>
            <p>Quiz score: {item.quizScore || 0}%</p>
            <div className="meta-row">
              <Link className="primary-btn" to={`/courses/${item.course?._id}`}>
                Continue
              </Link>
              {item.progressPercent === 100 && (
                <button className="ghost-btn" type="button" onClick={() => downloadCertificate(item.course?._id)}>
                  Download PDF
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default DashboardPage;

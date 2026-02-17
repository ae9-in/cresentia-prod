import { useEffect, useState } from 'react';
import api from '../services/api';

const emptyCourse = {
  title: '',
  description: '',
  category: 'IT',
  level: 'Beginner',
  videosText: '',
  quizText: ''
};

const AdminPage = () => {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyCourse);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [videoUpload, setVideoUpload] = useState({ title: '', durationMinutes: 30, cloudinaryUrl: '' });
  const [showCloudinaryInfo, setShowCloudinaryInfo] = useState(false);

  const loadCourses = () => {
    api.get('/courses').then((res) => setCourses(res.data));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const parseVideos = (text) => {
    if (!text.trim()) return [];
    return text
      .split('\n')
      .filter((line) => line.trim()) // Filter out empty lines
      .map((line) => {
        const [title, url, duration] = line.split('|').map((v) => v.trim());
        return { title, url, durationMinutes: Number(duration || 30) };
      });
  };

  const parseQuiz = (text) => {
    if (!text.trim()) return [];
    return text
      .split('\n')
      .filter((line) => line.trim()) // Filter out empty lines
      .map((line) => {
        const parts = line.split('|').map((v) => v.trim());
        const [question, optionA, optionB, optionC, optionD, answer] = parts;

        // Validate that all required fields are present
        if (!question || !optionA || !optionB || !optionC || !optionD) {
          console.error('Invalid quiz question format:', line);
          return null;
        }

        return {
          question,
          options: [optionA, optionB, optionC, optionD],
          correctAnswer: Number(answer || 0)
        };
      })
      .filter((q) => q !== null); // Remove any invalid questions
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      level: form.level,
      videos: parseVideos(form.videosText),
      quizQuestions: parseQuiz(form.quizText)
    };

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
        setMessage('Course updated');
      } else {
        await api.post('/courses', payload);
        setMessage('Course created');
      }

      setEditingId('');
      setForm(emptyCourse);
      loadCourses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Operation failed');
    }
  };

  const uploadVideo = async () => {
    if (!videoUpload.cloudinaryUrl.trim()) {
      setMessage('Please enter a Cloudinary URL first');
      return;
    }
    if (!videoUpload.title.trim()) {
      setMessage('Enter a title for the video');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      const { data } = await api.post('/uploads/videos', {
        cloudinaryUrl: videoUpload.cloudinaryUrl
      });
      const line = `${videoUpload.title} | ${data.url} | ${Number(videoUpload.durationMinutes || 30)}`;
      setForm((prev) => ({
        ...prev,
        videosText: prev.videosText ? `${prev.videosText}\n${line}` : line
      }));
      setVideoUpload({ title: '', durationMinutes: 30, cloudinaryUrl: '' });
      setMessage('Video added to course list successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add video');
    } finally {
      setUploading(false);
    }
  };

  const loadCloudinaryInfo = async () => {
    try {
      const { data } = await api.get('/uploads/cloudinary-info');
      setShowCloudinaryInfo(true);
      setMessage(data.instructions.join('\n'));
    } catch (err) {
      setMessage('Failed to load Cloudinary instructions');
    }
  };

  const editCourse = (course) => {
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      videosText: (course.videos || [])
        .map((v) => `${v.title} | ${v.url} | ${v.durationMinutes}`)
        .join('\n'),
      quizText: (course.quizQuestions || [])
        .map((q) => `${q.question} | ${q.options?.[0]} | ${q.options?.[1]} | ${q.options?.[2]} | ${q.options?.[3]} | 0`)
        .join('\n')
    });
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${courseId}`);
      setMessage('Course deleted successfully');
      loadCourses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <main className="container page">
      <h1>Admin / Instructor Panel</h1>
      {message && <p className="success">{message}</p>}
      <form className="card admin-form" onSubmit={submit}>
        <h2>{editingId ? 'Edit Course' : 'Create Course'}</h2>
        <input
          type="text"
          placeholder="Course title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Course description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <div className="meta-row">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>IT</option>
            <option>Business & Analytics</option>
            <option>Sales & Soft Skills</option>
            <option>AI & ML</option>
          </select>
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div className="card upload-card">
          <h3>Add Video (Cloudinary)</h3>
          <div className="meta-row">
            <input
              type="text"
              placeholder="Video title"
              value={videoUpload.title}
              onChange={(e) => setVideoUpload((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              type="number"
              min="1"
              placeholder="Duration (mins)"
              value={videoUpload.durationMinutes}
              onChange={(e) =>
                setVideoUpload((prev) => ({ ...prev, durationMinutes: Number(e.target.value || 30) }))
              }
            />
          </div>
          <div className="meta-row">
            <input
              type="url"
              placeholder="Cloudinary video URL"
              value={videoUpload.cloudinaryUrl}
              onChange={(e) => setVideoUpload((prev) => ({ ...prev, cloudinaryUrl: e.target.value }))}
            />
            <button className="ghost-btn" type="button" onClick={uploadVideo} disabled={uploading}>
              {uploading ? 'Adding...' : 'Add Video'}
            </button>
          </div>
          <div className="meta-row">
            <button className="ghost-btn" type="button" onClick={loadCloudinaryInfo}>
              How to upload to Cloudinary?
            </button>
          </div>
          <p className="muted">Videos are added to the list below. Use Cloudinary for video hosting.</p>
        </div>
        <label>
          Videos (one per line: title | url | durationMinutes) - Video URL (Cloudinary or Direct Link)
          <textarea
            value={form.videosText}
            onChange={(e) => setForm({ ...form, videosText: e.target.value })}
            rows={4}
          />
        </label>
        <label>
          Quiz (one per line: question | option1 | option2 | option3 | option4 | correctOptionIndex)
          <textarea
            value={form.quizText}
            onChange={(e) => setForm({ ...form, quizText: e.target.value })}
            rows={6}
          />
        </label>
        <button className="primary-btn" type="submit">
          {editingId ? 'Update Course' : 'Create Course'}
        </button>
      </form>

      <section className="grid">
        {courses.map((course) => (
          <article key={course._id} className="card">
            <h3>{course.title}</h3>
            <p>{course.category}</p>
            <div className="meta-row">
              <button className="ghost-btn" type="button" onClick={() => editCourse(course)}>
                Edit
              </button>
              <button className="ghost-btn delete-btn" type="button" onClick={() => deleteCourse(course._id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default AdminPage;

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
  const [videoUpload, setVideoUpload] = useState({ title: '', durationMinutes: 30, file: null });

  const loadCourses = () => {
    api.get('/courses').then((res) => setCourses(res.data));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const parseVideos = (text) => {
    if (!text.trim()) return [];
    return text.split('\n').map((line) => {
      const [title, url, duration] = line.split('|').map((v) => v.trim());
      return { title, url, durationMinutes: Number(duration || 30) };
    });
  };

  const parseQuiz = (text) => {
    if (!text.trim()) return [];
    return text.split('\n').map((line) => {
      const [question, optionA, optionB, optionC, optionD, answer] = line.split('|').map((v) => v.trim());
      return {
        question,
        options: [optionA, optionB, optionC, optionD],
        correctAnswer: Number(answer || 0)
      };
    });
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
  };

  const uploadVideo = async () => {
    if (!videoUpload.file) {
      setMessage('Select a video file first');
      return;
    }
    if (!videoUpload.title.trim()) {
      setMessage('Enter a title for the video');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      const payload = new FormData();
      payload.append('video', videoUpload.file);
      const { data } = await api.post('/uploads/videos', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const line = `${videoUpload.title} | ${data.url} | ${Number(videoUpload.durationMinutes || 30)}`;
      setForm((prev) => ({
        ...prev,
        videosText: prev.videosText ? `${prev.videosText}\n${line}` : line
      }));
      setVideoUpload({ title: '', durationMinutes: 30, file: null });
      setMessage('Video uploaded and added to course list');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Video upload failed');
    } finally {
      setUploading(false);
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
          <h3>Upload Video</h3>
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
              type="file"
              accept="video/*"
              onChange={(e) => setVideoUpload((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
            />
            <button className="ghost-btn" type="button" onClick={uploadVideo} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
          <p className="muted">Uploaded videos are appended to the list below.</p>
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
            <button className="ghost-btn" type="button" onClick={() => editCourse(course)}>
              Edit
            </button>
          </article>
        ))}
      </section>
    </main>
  );
};

export default AdminPage;

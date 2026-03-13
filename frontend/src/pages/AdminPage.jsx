import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const emptyCourse = {
  title: '',
  description: '',
  category: 'IT',
  level: 'Beginner',
  thumbnail: '',
  videosText: '',
  quizText: ''
};

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'user'
};

const AdminPage = () => {
  const { user, refreshUser, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'user' ? 'courses' : 'analytics');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(emptyCourse);
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingUserId, setEditingUserId] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [videoUpload, setVideoUpload] = useState({ title: '', durationMinutes: 30, cloudinaryUrl: '' });
  const [showCloudinaryInfo, setShowCloudinaryInfo] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCourseAssignment, setShowCourseAssignment] = useState(false);

  const loadCourses = () => {
    api.get('/courses').then((res) => setCourses(res.data));
  };

  const loadUsers = async () => {
    if (user?.role === 'admin') {
      try {
        const res = await api.get('/admin/users');
        console.log('✅ Users loaded:', res.data.length);
        setUsers(res.data);
        return res.data;
      } catch (err) {
        console.error('❌ Failed to load users:', err);
        return [];
      }
    }
  };

  const loadStats = () => {
    if (user?.role === 'admin') {
      api.get('/admin/stats').then((res) => setStats(res.data));
    }
  };

  useEffect(() => {
    loadCourses();
    loadUsers();
    loadStats();
  }, []);

  const parseVideos = (text) => {
    if (!text.trim()) return [];
    return text
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [title, url, duration] = line.split('|').map((v) => v.trim());
        return { title, url, durationMinutes: Number(duration || 30) };
      });
  };

  const parseQuiz = (text) => {
    if (!text.trim()) return [];
    return text
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split('|').map((v) => v.trim());
        const [question, optionA, optionB, optionC, optionD, answer] = parts;

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
      .filter((q) => q !== null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      level: form.level,
      thumbnail: form.thumbnail || undefined,
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
      loadStats();
      
      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      thumbnail: course.thumbnail || '',
      videosText: (course.videos || [])
        .map((v) => `${v.title} | ${v.url} | ${v.durationMinutes}`)
        .join('\n'),
      quizText: (course.quizQuestions || [])
        .map((q) => `${q.question} | ${q.options?.[0] || ''} | ${q.options?.[1] || ''} | ${q.options?.[2] || ''} | ${q.options?.[3] || ''} | ${q.correctAnswer || 0}`)
        .join('\n')
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${courseId}`);
      setMessage('Course deleted successfully');
      loadCourses();
      loadStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // User Management Functions
  const submitUser = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let response;
      if (editingUserId) {
        response = await api.put(`/admin/users/${editingUserId}`, userForm);
        setMessage('User updated successfully');
      } else {
        response = await api.post('/admin/users', userForm);
        setMessage('User created successfully');
      }

      setEditingUserId('');
      setUserForm(emptyUser);
      
      // Reload users list immediately
      await loadUsers();
      await loadStats();
      
      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Operation failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const editUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage('User deleted successfully');
      await loadUsers();
      await loadStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
      setMessage(data.message);
      
      // Reload users list
      const updatedUsers = await loadUsers();
      
      // Update selectedUser if it's the one being toggled
      if (selectedUser && selectedUser._id === userId) {
        const updatedUser = updatedUsers?.find(u => u._id === userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to toggle user status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const openCourseAssignment = (user) => {
    setSelectedUser(user);
    setShowCourseAssignment(true);
  };

  const assignCourse = async (courseId) => {
    try {
      console.log('\n========================================');
      console.log('🎯 Assigning Course');
      console.log('========================================');
      console.log('User ID:', selectedUser._id);
      console.log('User Email:', selectedUser.email);
      console.log('Course ID:', courseId);
      console.log('Current logged-in user:', user?.email);
      
      const { data } = await api.post(`/admin/users/${selectedUser._id}/assign-course`, { courseId });
      
      console.log('✅ Course Assigned Successfully');
      console.log('Updated User:', data.user);
      console.log('Updated User Courses:', data.user.assignedCourses?.length);
      console.log('========================================\n');
      
      setMessage(data.message);
      
      // CRITICAL: Update selectedUser FIRST with fresh data from backend
      if (data.user) {
        setSelectedUser(data.user);
        console.log('✅ Selected user updated in modal');
      }
      
      // Update users list in background
      loadUsers().then(() => {
        console.log('✅ Users list reloaded');
      });
      
      // CRITICAL: If the logged-in user is being modified, update their context immediately
      if (user && user._id === selectedUser._id) {
        console.log('🔄 Updating logged-in user context - SAME USER!');
        console.log('Before update - user courses:', user.assignedCourses?.length);
        console.log('After update - user courses:', data.user.assignedCourses?.length);
        
        // Update sessionStorage
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        // Update AuthContext state directly with the data we already have
        setUser(data.user);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('userUpdated'));
        
        console.log('✅ User context updated successfully');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (err) {
      console.error('❌ Failed to assign course:', err);
      setMessage(err.response?.data?.message || 'Failed to assign course');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeCourse = async (courseId) => {
    try {
      console.log('\n========================================');
      console.log('🎯 Removing Course');
      console.log('========================================');
      console.log('User ID:', selectedUser._id);
      console.log('Course ID:', courseId);
      
      const { data } = await api.post(`/admin/users/${selectedUser._id}/remove-course`, { courseId });
      
      console.log('✅ Course Removed Successfully');
      console.log('Updated User:', data.user);
      console.log('========================================\n');
      
      setMessage(data.message);
      
      // CRITICAL: Update selectedUser FIRST with fresh data from backend
      if (data.user) {
        setSelectedUser(data.user);
        console.log('✅ Selected user updated in modal');
      }
      
      // Update users list in background
      loadUsers().then(() => {
        console.log('✅ Users list reloaded');
      });
      
      // CRITICAL: If the logged-in user is being modified, update their context immediately
      if (user && user._id === selectedUser._id) {
        console.log('🔄 Updating logged-in user context');
        // Update sessionStorage
        sessionStorage.setItem('user', JSON.stringify(data.user));
        // Update AuthContext state directly with the data we already have
        setUser(data.user);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('userUpdated'));
        console.log('✅ User context updated successfully');
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (err) {
      console.error('❌ Failed to remove course:', err);
      setMessage(err.response?.data?.message || 'Failed to remove course');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetProgress = async (userId, courseId = null) => {
    const confirmMsg = courseId
      ? 'Reset progress for this specific course?'
      : 'Reset ALL progress for this user?';
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await api.post(`/admin/users/${userId}/reset-progress`, { courseId });
      setMessage('Progress reset successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reset progress');
    }
  };

  const togglePublish = async (courseId) => {
    try {
      const { data } = await api.patch(`/admin/courses/${courseId}/toggle-publish`);
      setMessage(data.message);
      loadCourses();
      loadStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to toggle publish status');
    }
  };

  return (
    <main className="container page">
      <h1>Admin Panel</h1>
      {message && <p className="success">{message}</p>}

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {user?.role === 'admin' && (
          <button
            className={activeTab === 'analytics' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('analytics')}
            type="button"
          >
            Analytics
          </button>
        )}
        <button
          className={activeTab === 'courses' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('courses')}
          type="button"
        >
          {user?.role === 'instructor' ? 'My Uploaded Courses' : 'Course Management'}
        </button>
        {user?.role === 'admin' && (
          <button
            className={activeTab === 'users' ? 'tab-active' : 'tab-inactive'}
            onClick={() => setActiveTab('users')}
            type="button"
          >
            User Management
          </button>
        )}
      </div>

      {/* Analytics Tab - Admin Only */}
      {activeTab === 'analytics' && user?.role === 'admin' && stats && (
        <section className="analytics-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-meta">
                {stats.activeUsers} active • {stats.inactiveUsers} inactive
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalCourses}</div>
              <div className="stat-label">Total Courses</div>
              <div className="stat-meta">
                {stats.publishedCourses} published • {stats.unpublishedCourses} draft
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalEnrollments}</div>
              <div className="stat-label">Total Enrollments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.usersByRole?.find(r => r._id === 'user')?.count || 0}
              </div>
              <div className="stat-label">Users</div>
            </div>
          </div>

          <div className="card analytics-info">
            <h2>System Overview</h2>
            <p className="muted">
              You have full control over users, courses, and access permissions. Use the tabs above to manage your platform.
            </p>
            <div className="meta-row">
              <button className="primary-btn" onClick={() => setActiveTab('users')} type="button">
                Manage Users
              </button>
              <button className="ghost-btn" onClick={() => setActiveTab('courses')} type="button">
                Manage Courses
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Course Management Tab */}
      {activeTab === 'courses' && (
        <>
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
            <input
              type="url"
              placeholder="Thumbnail URL (Cloudinary image URL - optional)"
              value={form.thumbnail}
              onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            />
            {form.thumbnail && (
              <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                <p className="muted" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Thumbnail Preview:</p>
                <img 
                  src={form.thumbnail} 
                  alt="Thumbnail preview" 
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <p className="error" style={{ display: 'none', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  ⚠️ Invalid image URL
                </p>
              </div>
            )}
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
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <span className={`status-badge ${course.isPublished ? 'active' : 'inactive'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p>{course.category}</p>
                <div className="meta-row">
                  <button className="bg-[#FF5F1F] hover:bg-[#e0561b] text-white px-4 py-2 rounded-lg font-semibold transition-all" type="button" onClick={() => editCourse(course)}>
                    Edit
                  </button>
                  <button
                    className="border border-gray-600 hover:border-[#FF5F1F] hover:bg-[#FF5F1F]/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    type="button"
                    onClick={() => togglePublish(course._id)}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="border border-red-600 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all" type="button" onClick={() => deleteCourse(course._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <>
          <form className="card admin-form" onSubmit={submitUser}>
            <h2>{editingUserId ? 'Edit User' : 'Create User'}</h2>
            <input
              type="text"
              placeholder="Name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder={editingUserId ? 'Password (leave blank to keep current)' : 'Password'}
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required={!editingUserId}
            />
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="user">User</option>
              <option value="instructor">Instructor</option>
            </select>
            <button className="primary-btn" type="submit">
              {editingUserId ? 'Update User' : 'Create User'}
            </button>
            {editingUserId && (
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setEditingUserId('');
                  setUserForm(emptyUser);
                }}
              >
                Cancel
              </button>
            )}
          </form>

          <section className="user-list">
            <h2>All Users</h2>
            {users.map((user) => (
              <article key={user._id} className="card user-card">
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="muted">{user.email}</p>
                  <div className="user-meta">
                    <span className="chip">{user.role}</span>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="muted">
                      {user.assignedCourses?.length || 0} courses assigned
                    </span>
                  </div>
                </div>
                <div className="user-actions">
                  <button className="bg-[#FF5F1F] hover:bg-[#e0561b] text-white px-4 py-2 rounded-lg font-semibold transition-all" type="button" onClick={() => editUser(user)}>
                    Edit
                  </button>
                  <button
                    className="border border-gray-600 hover:border-[#FF5F1F] hover:bg-[#FF5F1F]/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    type="button"
                    onClick={() => toggleUserStatus(user._id)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="border border-gray-600 hover:border-[#FF5F1F] hover:bg-[#FF5F1F]/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    type="button"
                    onClick={() => openCourseAssignment(user)}
                  >
                    Manage Courses
                  </button>
                  <button
                    className="border border-gray-600 hover:border-[#FF5F1F] hover:bg-[#FF5F1F]/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    type="button"
                    onClick={() => resetProgress(user._id)}
                  >
                    Reset Progress
                  </button>
                  <button className="border border-red-600 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all" type="button" onClick={() => deleteUser(user._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>

          {/* Course Assignment Modal */}
          {showCourseAssignment && selectedUser && (
            <div className="modal-overlay" onClick={() => setShowCourseAssignment(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Manage Courses for {selectedUser.name}</h2>
                <div className="course-assignment">
                  <div className="assigned-courses">
                    <h3>Assigned Courses ({selectedUser.assignedCourses?.length || 0})</h3>
                    {selectedUser.assignedCourses?.length > 0 ? (
                      <ul>
                        {selectedUser.assignedCourses.map((courseIdOrObj) => {
                          // Handle both ObjectId strings and populated course objects
                          const courseId = typeof courseIdOrObj === 'object' ? courseIdOrObj._id : courseIdOrObj;
                          const course = courses.find((c) => c._id.toString() === courseId.toString());
                          return course ? (
                            <li key={courseId}>
                              {course.title}
                              <button
                                className="ghost-btn"
                                type="button"
                                onClick={() => removeCourse(courseId)}
                              >
                                Remove
                              </button>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    ) : (
                      <p className="muted">No courses assigned</p>
                    )}
                  </div>
                  <div className="available-courses">
                    <h3>Available Courses</h3>
                    {courses.filter((c) => {
                      // Handle both ObjectId strings and populated course objects
                      return !selectedUser.assignedCourses?.some(courseIdOrObj => {
                        const courseId = typeof courseIdOrObj === 'object' ? courseIdOrObj._id : courseIdOrObj;
                        return c._id.toString() === courseId.toString();
                      });
                    }).length > 0 ? (
                      <ul>
                        {courses
                          .filter((c) => {
                            // Handle both ObjectId strings and populated course objects
                            return !selectedUser.assignedCourses?.some(courseIdOrObj => {
                              const courseId = typeof courseIdOrObj === 'object' ? courseIdOrObj._id : courseIdOrObj;
                              return c._id.toString() === courseId.toString();
                            });
                          })
                          .map((course) => (
                            <li key={course._id}>
                              {course.title}
                              <button
                                className="primary-btn"
                                type="button"
                                onClick={() => assignCourse(course._id)}
                              >
                                Assign
                              </button>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <div className="admin-empty-state">
                        <h4>All Courses Assigned</h4>
                        <p>This user has been assigned all available courses.</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => setShowCourseAssignment(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default AdminPage;

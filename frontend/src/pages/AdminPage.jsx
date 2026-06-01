import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'user'
};

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingUserId, setEditingUserId] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(user?.role === 'admin' ? 'analytics' : 'account');
  const [courses, setCourses] = useState([]);
  const [selectedCourseForUser, setSelectedCourseForUser] = useState({});

  const loadUsers = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load users');
    }
  };

  const loadStats = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load stats');
    }
  };

  const loadCourses = async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await api.get('/courses');
      if (Array.isArray(res.data)) {
        setCourses(res.data);
      } else if (res.data && Array.isArray(res.data.courses)) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
    loadCourses();
  }, []);

  const submitUser = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, userForm);
        setMessage('User updated successfully');
      } else {
        await api.post('/admin/users', userForm);
        setMessage('User created successfully');
      }

      setEditingUserId('');
      setUserForm(emptyUser);
      await loadUsers();
      await loadStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Operation failed');
    }
  };

  const editUser = (item) => {
    setEditingUserId(item._id);
    setUserForm({
      name: item.name,
      email: item.email,
      password: '',
      role: item.role
    });
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage('User deleted successfully');
      await loadUsers();
      await loadStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
      setMessage(data.message);
      await loadUsers();
      await loadStats();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const assignCourseToUser = async (userId) => {
    const courseId = selectedCourseForUser[userId];
    if (!courseId) return;

    try {
      setMessage('');
      const res = await api.post(`/admin/users/${userId}/assign-course`, { courseId });
      setMessage(res.data.message || 'Course assigned successfully');
      setSelectedCourseForUser(prev => ({ ...prev, [userId]: '' }));
      await loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign course');
    }
  };

  const removeCourseFromUser = async (userId, courseId) => {
    if (!window.confirm('Are you sure you want to remove this course access?')) return;

    try {
      setMessage('');
      const res = await api.post(`/admin/users/${userId}/remove-course`, { courseId });
      setMessage(res.data.message || 'Course access removed successfully');
      await loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to remove course');
    }
  };

  if (user?.role === 'instructor') {
    return (
      <main className="container page">
        <section className="card" style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Instructor Account</h1>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Course management has been removed from the frontend. Your account details remain available below.
          </p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="card">
              <strong>Name:</strong> {user.name}
            </div>
            <div className="card">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="card">
              <strong>Role:</strong> {user.role}
            </div>
            <div className="card">
              <strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container page">
      <h1>Admin Panel</h1>
      {message && <p className="success">{message}</p>}

      <div className="admin-tabs">
        <button
          className={activeTab === 'analytics' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('analytics')}
          type="button"
        >
          Analytics
        </button>
        <button
          className={activeTab === 'users' ? 'tab-active' : 'tab-inactive'}
          onClick={() => setActiveTab('users')}
          type="button"
        >
          User Management
        </button>
        <button
          className="tab-inactive"
          onClick={() => navigate('/courses')}
          type="button"
        >
          Course Page
        </button>
      </div>

      {activeTab === 'analytics' && stats && (
        <section className="analytics-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
              <div className="stat-meta">{stats.activeUsers} active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.inactiveUsers}</div>
              <div className="stat-label">Inactive Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.usersByRole?.length || 0}</div>
              <div className="stat-label">Role Types</div>
            </div>
          </div>

          <div className="card analytics-info">
            <h2>System Overview</h2>
            <p className="muted">
              The frontend has been simplified to user management and account details only. Course management has been removed.
            </p>
            <div className="meta-row">
              <button className="primary-btn" onClick={() => setActiveTab('users')} type="button">
                Manage Users
              </button>
              <button className="ghost-btn" onClick={() => navigate('/courses')} type="button">
                Open Course Page
              </button>
            </div>
          </div>
        </section>
      )}

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
              <option value="admin">Admin</option>
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
            {users.map((item) => (
              <article key={item._id} className="card user-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="user-info">
                    <h3>{item.name}</h3>
                    <p className="muted">{item.email}</p>
                    <div className="user-meta">
                      <span className="chip">{item.role}</span>
                      <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button className="bg-[#FF5F1F] hover:bg-[#e0561b] text-white px-4 py-2 rounded-lg font-semibold transition-all" type="button" onClick={() => editUser(item)}>
                      Edit
                    </button>
                    <button
                      className="border border-gray-600 hover:border-[#FF5F1F] hover:bg-[#FF5F1F]/10 text-gray-300 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      type="button"
                      onClick={() => toggleUserStatus(item._id)}
                    >
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="border border-red-600 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all" type="button" onClick={() => deleteUser(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Course Assignment Section */}
                {item.role === 'user' && (
                  <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--line)' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                      Assigned Courses
                    </h4>
                    
                    {/* List of assigned courses */}
                    {item.assignedCourses && item.assignedCourses.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {item.assignedCourses.map((course) => (
                          <div 
                            key={course._id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem', 
                              background: '#2a2a2a', 
                              padding: '0.4rem 0.8rem', 
                              borderRadius: '8px',
                              fontSize: '0.85rem' 
                            }}
                          >
                            <span>{course.title}</span>
                            <button
                              type="button"
                              onClick={() => removeCourseFromUser(item._id, course._id)}
                              style={{
                                width: 'auto',
                                padding: '0 0.2rem',
                                border: 'none',
                                background: 'transparent',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              title="Remove course access"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>No courses assigned yet.</p>
                    )}

                    {/* Assign new course selector */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={selectedCourseForUser[item._id] || ''}
                        onChange={(e) => setSelectedCourseForUser({ ...selectedCourseForUser, [item._id]: e.target.value })}
                        style={{ width: 'auto', minWidth: '220px', padding: '0.4rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem' }}
                      >
                        <option value="">-- Select a Course to Assign --</option>
                        {courses
                          .filter(c => c.isPublished)
                          .filter(c => !item.assignedCourses?.some(ac => ac._id === c._id))
                          .map(c => (
                            <option key={c._id} value={c._id}>
                              {c.title} ({c.level})
                            </option>
                          ))
                        }
                      </select>
                      
                      <button
                        className="bg-[#FF5F1F] hover:bg-[#e0561b] text-white font-semibold transition-all"
                        type="button"
                        onClick={() => assignCourseToUser(item._id)}
                        disabled={!selectedCourseForUser[item._id]}
                        style={{
                          width: 'auto',
                          padding: '0.4rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          opacity: selectedCourseForUser[item._id] ? 1 : 0.6,
                          cursor: selectedCourseForUser[item._id] ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Assign Course
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
};

export default AdminPage;

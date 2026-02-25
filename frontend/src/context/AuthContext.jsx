import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthToken(data.token);
    return data.user;
  };

  const register = async (payload) => {
    return api.post('/auth/register', payload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  };

  // Check if user has access (for students with no assigned courses)
  const hasAccess = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'student') {
      return user.assignedCourses && user.assignedCourses.length > 0;
    }
    return false;
  };

  // Check if user has access to a specific course
  const hasCourseAccess = (courseId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'student') {
      if (!user.assignedCourses || user.assignedCourses.length === 0) {
        return false;
      }
      // Handle both string and object ID formats
      const hasAccess = user.assignedCourses.some(id => {
        const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
        return idStr === courseId.toString();
      });
      console.log('Course Access Check:', { courseId, assignedCourses: user.assignedCourses, hasAccess });
      return hasAccess;
    }
    return false;
  };

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshUser, setUser, setToken, hasAccess, hasCourseAccess }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

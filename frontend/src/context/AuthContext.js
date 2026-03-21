import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  // Seed user state from localStorage immediately so ProtectedRoute never
  // redirects due to a transient fetchMe failure (500, network, etc.)
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); setAuthChecked(true); return; }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      // For 500 / network errors: keep cached user so ProtectedRoute stays open.
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/updateprofile', data);
    setUser(res.data.data);
    return res.data.data;
  };

  const isAdmin = user?.role === 'admin';
  const isCommunityAdmin = user?.role === 'community_admin';
  const isStudent = user?.role === 'student';
  const isExternal = user?.role === 'external';

  return (
    <AuthContext.Provider value={{
      user, loading, authChecked,
      login, register, logout, updateProfile, fetchMe,
      isAdmin, isCommunityAdmin, isStudent, isExternal,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

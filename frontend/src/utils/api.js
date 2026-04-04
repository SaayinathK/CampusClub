import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired / invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || '';

    // Only clear session on definitive auth failures — NOT on 503 (DB down) or network errors
    const isDefinitiveAuthFailure = status === 401 && (
      msg.includes('not valid') ||
      msg.includes('No token') ||
      msg.includes('not found') ||
      msg.includes('expired')
    );

    if (isDefinitiveAuthFailure) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicPaths = ['/signin', '/signup', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/signin?reason=session_expired';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

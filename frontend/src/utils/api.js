import axios from 'axios';

const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';
const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true, // send cookies if backend uses them
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired / invalid tokens globally (keep minimal)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data?.message || '';

    // Only clear session when the JWT itself is bad — NOT on network/DB errors
    const isDefinitiveAuthFailure = status === 401 && (
      msg.includes('not valid') ||
      msg.includes('No token')
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

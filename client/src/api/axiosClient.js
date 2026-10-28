import axios from 'axios';

// Get API base URL from Vite environment variable with safe localhost fallback
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach Bearer token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized or expired token
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Don't loop if login itself failed with 401
      if (!originalRequest.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=1';
        }
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'A network or server error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;

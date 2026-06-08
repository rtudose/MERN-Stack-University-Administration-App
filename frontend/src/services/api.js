// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Session expired or token is invalid. Logging out.');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
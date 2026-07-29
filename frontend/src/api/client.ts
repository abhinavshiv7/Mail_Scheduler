import axios from 'axios';

const api = axios.create({
  // In development, use local backend. In production (on VM), use relative path which Nginx will proxy to the backend container.
  baseURL: import.meta.env.DEV ? 'http://localhost:8081' : '',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

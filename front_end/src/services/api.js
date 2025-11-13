// API service
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:4000/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
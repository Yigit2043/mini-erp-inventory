import axios from 'axios';

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default customerApi;
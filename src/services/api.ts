import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const activeStoreId = localStorage.getItem('active_store_id');
    if (activeStoreId) {
      config.headers['x-store-id'] = activeStoreId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isCheckAuth = error.config.url.includes('/auth/me');

    if (error.response?.status === 401 && !isCheckAuth) {
       window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);
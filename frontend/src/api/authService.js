import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to headers if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => {
    return api.post('/login', { email, password });
  },

  register: (name, email, password) => {
    return api.post('/register', { name, email, password });
  },

  logout: () => {
    return api.post('/logout').finally(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('employee_data');
    });
  },

  getProfile: () => {
    return api.get('/me');
  },

  setToken: (token) => {
    localStorage.setItem('auth_token', token);
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  setUserData: (user) => {
    localStorage.setItem('user_data', JSON.stringify(user));
  },

  getUserData: () => {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  setEmployeeData: (employee) => {
    localStorage.setItem('employee_data', JSON.stringify(employee));
  },

  getEmployeeData: () => {
    const data = localStorage.getItem('employee_data');
    return data ? JSON.parse(data) : null;
  },
};

export default api;

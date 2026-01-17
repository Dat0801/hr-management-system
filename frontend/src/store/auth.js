import { create } from 'zustand';
import api from '../lib/api';

const mapUserFromApi = (user) => {
  if (!user) return user;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  let primaryRole = roles[0] || null;
  if (roles.includes('admin')) {
    primaryRole = 'admin';
  } else if (roles.includes('hr_manager')) {
    primaryRole = 'hr';
  }
  return { ...user, role: primaryRole };
};

export const useAuth = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/login', { email, password });
      const { user, token } = res.data;
      const mappedUser = mapUserFromApi(user);
      localStorage.setItem('token', token);
      set({ user: mappedUser, token, isLoading: false });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.message || 'Login failed', isLoading: false });
      return false;
    }
  },
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/register', payload);
      const { user, token } = res.data;
      const mappedUser = mapUserFromApi(user);
      localStorage.setItem('token', token);
      set({ user: mappedUser, token, isLoading: false });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.message || 'Registration failed', isLoading: false });
      return false;
    }
  },
  fetchMe: async () => {
    try {
      const res = await api.get('/me');
      const mappedUser = mapUserFromApi(res.data);
      set({ user: mappedUser });
    } catch (e) {
      set({ error: e.response?.data?.message || 'Failed to fetch current user' });
    }
  },
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      set({ error: e.response?.data?.message || 'Logout failed' });
    }
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

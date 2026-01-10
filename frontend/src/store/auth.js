import { create } from 'zustand';
import api from '../lib/api';

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
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
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
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
      return true;
    } catch (e) {
      set({ error: e.response?.data?.message || 'Registration failed', isLoading: false });
      return false;
    }
  },
  fetchMe: async () => {
    try {
      const res = await api.get('/me');
      set({ user: res.data });
    } catch {}
  },
  logout: async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));

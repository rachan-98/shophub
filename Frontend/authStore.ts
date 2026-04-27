import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
          email,
          password,
        });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
      },

      register: async (name, email, password) => {
        const { data } = await api.post<{ token: string; user: User }>('/auth/register', {
          name,
          email,
          password,
        });
        localStorage.setItem('token', data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);

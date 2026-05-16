import { create } from 'zustand';
import { UserProfile } from '@workspace/api-client-react/src/generated/api.schemas';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('ytsave_token'),
  user: null, // Will be populated by the me query
  setAuth: (token, user) => {
    localStorage.setItem('ytsave_token', token);
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('ytsave_token');
    set({ token: null, user: null });
  },
  setUser: (user) => set({ user }),
}));

export function getAuthHeaders() {
  const token = localStorage.getItem('ytsave_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

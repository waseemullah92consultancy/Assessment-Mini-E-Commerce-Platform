import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (accessToken, user) => {
        set({ user, accessToken, isAuthenticated: true });
        // Lightweight session cookie so middleware can gate protected routes
        if (typeof document !== 'undefined') {
          document.cookie = `auth-session=1; path=/; SameSite=Lax; max-age=${7 * 24 * 3600}`;
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        if (typeof document !== 'undefined') {
          document.cookie =
            'auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
    }),
    { name: 'noir-auth' },
  ),
);

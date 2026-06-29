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
        if (typeof document !== 'undefined') {
          const maxAge = 7 * 24 * 3600;
          document.cookie = `auth-session=1; path=/; SameSite=Lax; max-age=${maxAge}`;
          if (user.role === 'admin') {
            document.cookie = `admin-session=1; path=/; SameSite=Lax; max-age=${maxAge}`;
          }
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        if (typeof document !== 'undefined') {
          const expired = 'path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = `auth-session=; ${expired}`;
          document.cookie = `admin-session=; ${expired}`;
        }
      },
    }),
    { name: 'noir-auth' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';
import { AuthUser, LoginRequest, RegisterRequest, AuthTokens } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<AuthTokens>('/auth/login', credentials);
          const data = (response as any).data || response;

          Cookies.set('accessToken', data.accessToken, {
            secure: true,
            sameSite: 'strict',
            expires: 1, // 1 day
          });
          Cookies.set('refreshToken', data.refreshToken, {
            secure: true,
            sameSite: 'strict',
            expires: 7,
          });

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<AuthTokens>('/auth/register', data);
          const result = (response as any).data || response;

          Cookies.set('accessToken', result.accessToken, {
            secure: true,
            sameSite: 'strict',
            expires: 1,
          });
          Cookies.set('refreshToken', result.refreshToken, {
            secure: true,
            sameSite: 'strict',
            expires: 7,
          });

          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Error al registrarse';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignore error on logout
        } finally {
          api.cancelAll();
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      refreshAuth: async () => {
        const token = Cookies.get('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const decoded = jwtDecode<any>(token);
          const now = Date.now() / 1000;

          if (decoded.exp && decoded.exp < now) {
            // Token expired, try refresh
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const response = await api.post<AuthTokens>('/auth/refresh', {
                refreshToken,
              });
              const data = (response as any).data || response;
              Cookies.set('accessToken', data.accessToken, {
                secure: true,
                sameSite: 'strict',
              });
              Cookies.set('refreshToken', data.refreshToken, {
                secure: true,
                sameSite: 'strict',
              });
              set({ user: data.user, isAuthenticated: true });
            } else {
              set({ user: null, isAuthenticated: false });
            }
          } else {
            // Token still valid
            if (!get().user) {
              const response = await api.get<any>('/auth/me');
              const user = (response as any).data || response;
              set({ user, isAuthenticated: true });
            }
          }
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const token = Cookies.get('accessToken');
        return !!token;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

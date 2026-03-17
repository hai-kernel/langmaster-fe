import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole, LoginCredentials } from '@/types/auth';
import { API_BASE_URL } from '@/services/baseUrl';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
  updateTokens: (tokens: AuthTokens) => void;
  checkPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      // LOGIN: gọi BE /v1/auth/login, nhận LoginResponse (user + token + refreshToken)
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => null);
            const message = body?.message || 'Đăng nhập thất bại';
            throw new Error(message);
          }

          const body = await res.json();
          const data = body.data as {
            user: any;
            token: string;
            refreshToken: string;
          };

          const backendRole = (data.user.role ?? '').toString().toLowerCase();
          const normalizedRole = (['student', 'teacher', 'admin'].includes(backendRole)
            ? backendRole
            : 'student') as UserRole;

          const mappedUser: AuthUser = {
            id: data.user.id?.toString() ?? '',
            name: data.user.fullName ?? data.user.name ?? data.user.email,
            email: data.user.email,
            avatar: data.user.avatarUrl ?? undefined,
            role: normalizedRole,
            permissions: Array.isArray(data.user.permissions) && data.user.permissions.length > 0
              ? data.user.permissions
              : ['view:lessons'],
          };

          set({
            user: mappedUser,
            tokens: {
              accessToken: data.token,
              refreshToken: data.refreshToken,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // LOGOUT: gọi BE (nếu có token) rồi xoá user + token trên FE
      logout: () => {
        const { tokens } = get();

        if (tokens?.accessToken) {
          // Fire-and-forget, không chặn UI
          fetch(`${API_BASE_URL}/v1/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }).catch(() => {
            // Bỏ qua lỗi logout phía BE, FE vẫn xoá state
          });
        }

        set({ user: null, tokens: null, isAuthenticated: false });
      },

      // REGISTER: gọi /v1/auth/register/local, sau đó tự động login lại bằng email/password
      register: async (name, email, password, role) => {
        console.log('--- AuthStore: register start ---', { name, email, role });
        set({ isLoading: true });
        try {
          const payload = {
            fullName: name,
            email,
            password,
            role: role.toUpperCase(), // STUDENT / TEACHER
          };
          console.log('--- AuthStore: Sending request to:', `${API_BASE_URL}/v1/auth/register/local`);
          console.log('--- AuthStore: Payload:', payload);

          const res = await fetch(`${API_BASE_URL}/v1/auth/register/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          console.log('--- AuthStore: Response status:', res.status);

          if (!res.ok) {
            const body = await res.json().catch(() => null);
            console.error('--- AuthStore: Register error body:', body);
            const message = body?.message || 'Đăng ký thất bại';
            throw new Error(message);
          }

          console.log('--- AuthStore: Register success, now logging in...');
          // Đăng ký xong → tự động login để UX mượt hơn
          await get().login({ email, password });
          set({ isLoading: false });
        } catch (error) {
          console.error('--- AuthStore: Register exception:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      updateTokens: (tokens) => {
        set({ tokens });
      },

      checkPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        if (user.permissions.includes('*')) return true;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
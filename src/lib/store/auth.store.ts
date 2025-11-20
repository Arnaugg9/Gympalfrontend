import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearTokens, saveTokens } from '@/lib/utils/auth';
import { setAuthToken as setApiAuthToken } from '@/lib/api/client';
import { setAuthTokens as setSupabaseAuthTokens, clearAuthTokens as clearSupabaseAuthTokens } from '@/lib/supabase/client';

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true, // Start as loading to wait for hydration
      error: null,

      setUser: (user: User | null) => set({ user }),
      setTokens: (accessToken: string | null, refreshToken?: string | null) => {
        if (accessToken) {
          // persist cookies/localStorage
          saveTokens({ accessToken, refreshToken: refreshToken || undefined });
          // set API axios default header
          setApiAuthToken(accessToken);
          // set supabase client session (best-effort)
          void setSupabaseAuthTokens(accessToken, refreshToken ?? null);
        } else {
          // clear API and supabase session when tokens are null
          setApiAuthToken(null);
          void clearSupabaseAuthTokens();
        }
        set({ accessToken, refreshToken: refreshToken || null });
      },
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      logout: () => {
        clearTokens(); // Clear tokens from localStorage and cookies
        setApiAuthToken(null);
        void clearSupabaseAuthTokens();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state: any) => {
        // When the persisted store is rehydrated, ensure API and Supabase clients
        // pick up the access token automatically.
        if (state?.accessToken) {
          setApiAuthToken(state.accessToken as string);
          void setSupabaseAuthTokens(state.accessToken as string, state.refreshToken as string | null);
        }
        return state;
      },
      // Don't serialize isLoading - let it always start as true
    }
  )
);

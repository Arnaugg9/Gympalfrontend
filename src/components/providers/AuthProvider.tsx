'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { getAccessToken, getRefreshToken } from '@/lib/utils/auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { me } from '@/features/auth/api/api';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, setTokens, setLoading } = useAuthStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    setTokens: state.setTokens,
    setLoading: state.setLoading,
  }));
  const [isHydrated, setIsHydrated] = useState(false);

  // Check if we're on a public route
  const isPublicRoute = pathname.startsWith('/login') ||
                        pathname.startsWith('/register') ||
                        pathname.startsWith('/forgot-password') ||
                        pathname.startsWith('/reset-password') ||
                        pathname === '/' ||
                        pathname === '/onboarding';

  useEffect(() => {
    // Perform auth initialization
    const initializeAuth = async () => {
      try {
        // Get tokens from localStorage
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        // If already have user in store, we're good
        if (user) {
          setLoading(false);
          return;
        }

        // If no tokens, redirect to login
        if (!accessToken) {
          if (!isPublicRoute) {
            router.push('/login');
          }
          setLoading(false);
          return;
        }
        // Restore tokens in the store
        setTokens(accessToken, refreshToken);

        // Try to get user profile to verify token is still valid
        try {
          const userData = await me();
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              username: userData.username,
              full_name: userData.fullName || userData.full_name,
              avatarUrl: userData.avatarUrl,
              emailVerified: userData.emailVerified ?? false,
            });
          }
        } catch (error: any) {
          // If 401, token expired or invalid
          if (error?.response?.status === 401 || error?.message?.includes('401')) {
            setUser(null);
            setTokens(null, null);
            if (!isPublicRoute) {
              router.push('/login');
            }
          }
          // For other errors (network, etc.), keep the user logged in if we have tokens
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    // Ensure Zustand has hydrated, then initialize auth
    const initializationTimer = setTimeout(() => {
      setIsHydrated(true);
      initializeAuth();
    }, 50);

    return () => {
      clearTimeout(initializationTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If we're still loading auth, show spinner (unless on public route)
  // For public routes, always allow rendering immediately
  if (!isHydrated) {
    if (isPublicRoute) {
      // On public routes, render children immediately without waiting
      return <>{children}</>;
    }
    // On protected routes, show loading spinner
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LoadingSpinner size="lg" variant="dumbbell" />
        <p className="text-slate-400 text-sm">Initializing session...</p>
      </div>
    );
  }

  // Check auth status for protected routes
  if (!isPublicRoute && !user && !getAccessToken()) {
    // Don't render anything, router will redirect
    return null;
  }

  return <>{children}</>;
}

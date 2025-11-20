'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { getAccessToken, getRefreshToken } from '@/lib/utils/auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
          const response = await fetch('/api/v1/auth/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              setUser({
                id: data.data.id,
                email: data.data.email,
                username: data.data.username,
                full_name: data.data.full_name,
                avatarUrl: data.data.avatar_url,
                emailVerified: data.data.email_verified,
              });
            }
          } else if (response.status === 401) {
            // Token expired or invalid
            setUser(null);
            setTokens(null, null);
            if (!isPublicRoute) {
              router.push('/login');
            }
          }
        } catch (error) {
          // If network error, keep the user logged in
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
  if (!isHydrated && !isPublicRoute) {
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

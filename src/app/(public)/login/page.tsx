'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AuthContainer } from '@/components/shared';
import { LoginForm } from '@/features/auth';
import { getAccessToken } from '@/lib/utils/auth';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    // Check for valid token and redirect if authenticated
    const checkAuth = () => {
      try {
        // Check localStorage first (most up-to-date after login)
        const token = getAccessToken();

        // Also check cookies as fallback (for SSR/middleware compatibility)
        let cookieToken: string | null = null;
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split('; ');
          const accessTokenCookie = cookies.find(row => row.startsWith('access_token='));
          const sbTokenCookie = cookies.find(row => row.startsWith('sb-access-token='));
          cookieToken = accessTokenCookie?.split('=')[1] || sbTokenCookie?.split('=')[1] || null;
        }

        // If we have a valid token (from localStorage or cookies), redirect to dashboard
        if (token || cookieToken) {
          router.replace('/dashboard');
          router.refresh();
        } else {
          // Ensure clean slate if not authenticated
          // This fixes issues where stale tokens might prevent correct navigation
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
      } catch (err) {
        // If token check fails, stay on login page
      }
    };

    checkAuth();
  }, [router]);

  return (
    <AuthContainer
      title={t('auth.signIn', { defaultValue: 'Sign In' })}
      description={t('auth.welcomeBack', { defaultValue: 'Welcome back to GymPal' })}
      footerText={t('auth.dontHaveAccount', { defaultValue: 'Don\'t have an account?' })}
      footerLink={{ text: t('auth.signUpLink', { defaultValue: 'Sign up' }), href: '/register' }}
    >
      <LoginForm />
    </AuthContainer>
  );
}

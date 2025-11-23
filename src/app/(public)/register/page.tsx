'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { AuthContainer } from '@/components/shared';
import { RegisterForm } from '@/features/auth';
import { getAccessToken } from '@/lib/utils/auth';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAccessToken();
        let cookieToken: string | null = null;
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split('; ');
          const accessTokenCookie = cookies.find(row => row.startsWith('access_token='));
          cookieToken = accessTokenCookie?.split('=')[1] || null;
        }

        if (token || cookieToken) {
          router.replace('/dashboard');
          router.refresh();
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
      } catch (err) { }
    };
    checkAuth();
  }, [router]);

  return (
    <AuthContainer
      title={t('auth.createAccount', { defaultValue: 'Create Account' })}
      description={t('auth.joinCommunity', { defaultValue: 'Join the GymPal community' })}
      footerText={t('auth.alreadyHaveAccount', { defaultValue: 'Already have an account?' })}
      footerLink={{ text: t('auth.signInLink', { defaultValue: 'Sign in' }), href: '/login' }}
    >
      <RegisterForm />
    </AuthContainer>
  );
}

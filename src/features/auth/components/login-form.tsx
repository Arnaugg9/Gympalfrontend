'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/shared/input-with-icon';
import { PasswordInput } from '@/components/shared/password-input';
import { login } from '../api/api';
import { useAuthStore } from '@/lib/store/auth.store';

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.email.includes('@')) {
      return t('auth.validEmailRequired');
    }
    if (!formData.password || formData.password.length < 6) {
      return t('auth.passwordRequired');
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await login(formData);

      if (res?.accessToken) {
        // Save tokens to store and localStorage
        setTokens(res.accessToken, res.refreshToken);

        // Save user to store
        if (res?.user) {
          setUser({
            id: res.user.id,
            email: res.user.email,
            username: res.user.username,
            full_name: res.user.fullName,
            avatarUrl: res.user.avatarUrl,
            emailVerified: res.user.emailVerified,
          });
        }

        // Small delay to ensure state is persisted before redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        setError(t('auth.noTokenReceived'));
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.error?.message || err?.message || t('auth.errorSigningIn');

      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setError(t('auth.verifyEmailBeforeLogin'));
      } else if (errorCode === 'INVALID_CREDENTIALS') {
        setError(t('auth.invalidCredentials'));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <InputWithIcon
        icon={Mail}
        label={t('auth.emailAddress')}
        placeholder={t('auth.emailPlaceholder')}
        type="email"
        required={false}
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <PasswordInput
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        required={false}
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-medium py-2" disabled={loading}>
        {loading ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </form>
  );
}

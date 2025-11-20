/**
 * Auth API client
 *
 * This module provides the high-level auth operations used by the UI:
 * - `login`, `register` : handles authentication flows and token storage
 * - `me`, `logout` : session-related helpers
 * - `refreshToken`, `changePassword`, `resetPassword`, `deleteAccount` : auxiliary operations
 *
 * Design notes:
 * - Responses from the backend follow the `ApiResponse<T>` envelope. This
 *   file unwraps `data` and applies `transformers` to convert snake_case
 *   backend fields into camelCase frontend models.
 * - Token storage is coordinated with `lib/utils/auth` and an optional
 *   `auth` store. We attempt to update both so legacy and modern paths work.
 */
import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import { saveTokens, clearTokens } from '@/lib/utils/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import type { LoginRequest, RegisterRequest, ApiResponse } from '../types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

function extractTokens(res: any): { access?: string; refresh?: string } {
  // After transformation, tokens are in camelCase
  return {
    access: res.accessToken,
    refresh: res.refreshToken,
  };
}

export async function login(body: LoginRequest) {
  apiLogger.info({ endpoint: '/api/v1/auth/login' }, 'Auth login request');
  try {
    // Backend returns ApiResponse<AuthResponse>
    const wrappedRes = await http.post<ApiResponse<Unified.AuthResponse>>('/api/v1/auth/login', body);
    const rawData = wrappedRes?.data;

    if (!rawData) {
      throw new Error('No auth data in response');
    }

    // Transform the response from snake_case to camelCase
    const authData = transformers.authTransformers.transformAuthResponse(rawData);

    const { access } = extractTokens(authData);

    // Backend login returns access token
    if (access) {
      // Use the auth store action so axios and supabase clients are updated
      try {
        useAuthStore.getState().setTokens(access, undefined);
      } catch (e) {
        // Fallback to legacy helper
        saveTokens({ accessToken: access });
      }
      apiLogger.info({ hasAccess: true }, 'Auth login success');
    } else {
      apiLogger.warn({}, 'Auth login succeeded but no access token returned');
    }

    return authData;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/login' });
    throw err;
  }
}

export async function register(body: RegisterRequest) {
  apiLogger.info({ endpoint: '/api/v1/auth/register' }, 'Auth register request');
  try {
    // Backend returns ApiResponse<AuthResponse>
    const wrappedRes = await http.post<ApiResponse<Unified.AuthResponse>>('/api/v1/auth/register', body);
    const rawData = wrappedRes?.data;

    if (!rawData) {
      throw new Error('No auth data in response');
    }

    // Transform the response from snake_case to camelCase
    const authData = transformers.authTransformers.transformAuthResponse(rawData);

    // Backend register doesn't return a token, only user info and emailConfirmationRequired flag
    // User must verify email before they can login
    apiLogger.info(
      { emailConfirmationRequired: authData.emailConfirmationRequired },
      'Auth register success'
    );

    return authData;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/register' });
    throw err;
  }
}

export async function me() {
  apiLogger.debug({ endpoint: '/api/v1/auth/me' }, 'Auth me request');
  try {
    const wrappedRes = await http.get<ApiResponse<Unified.AuthUser>>('/api/v1/auth/me');
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No user data in response');

    // Transform the user data
    return transformers.authTransformers.transformUser(rawData);
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/me' });
    throw err;
  }
}

export async function logout() {
  apiLogger.info({ endpoint: '/api/v1/auth/logout' }, 'Auth logout request');
  try {
    await http.post<ApiResponse<any>>('/api/v1/auth/logout');
    // Use auth store logout action if available
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      clearTokens();
    }
    apiLogger.info({}, 'Auth logout success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/logout' });
    clearTokens(); // Clear tokens even if logout fails
    throw err;
  }
}

export async function refreshToken(refreshToken: string) {
  apiLogger.info({ endpoint: '/api/v1/auth/refresh' }, 'Token refresh request');
  try {
    const wrappedRes = await http.post<ApiResponse<Unified.AuthResponse>>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    const rawData = wrappedRes?.data;

    if (!rawData?.access_token) {
      throw new Error('No token in refresh response');
    }

    const authData = transformers.authTransformers.transformAuthResponse(rawData);

    try {
      useAuthStore.getState().setTokens(authData.accessToken, authData.refreshToken ?? undefined);
    } catch (e) {
      saveTokens({ accessToken: authData.accessToken, refreshToken: authData.refreshToken });
    }
    apiLogger.info({}, 'Token refresh success');
    return authData;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/refresh' });
    throw err;
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  apiLogger.info({ endpoint: '/api/v1/auth/change-password/:id' }, 'Change password request');
  try {
    await http.put<ApiResponse<any>>(`/api/v1/auth/change-password/${userId}`, {
      currentPassword,
      newPassword,
    });
    apiLogger.info({}, 'Password change success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/change-password' });
    throw err;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  apiLogger.info({ endpoint: '/api/v1/auth/reset-password' }, 'Reset password request');
  try {
    await http.post<ApiResponse<any>>('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    apiLogger.info({}, 'Password reset success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/reset-password' });
    throw err;
  }
}

export async function deleteAccount(userId: string) {
  apiLogger.info({ endpoint: '/api/v1/auth/delete-account/:id' }, 'Delete account request');
  try {
    await http.delete<ApiResponse<any>>(`/api/v1/auth/delete-account/${userId}`);
    clearTokens();
    apiLogger.info({}, 'Account deletion success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/delete-account' });
    throw err;
  }
}

// Export types for use in other modules
export type { LoginRequest, RegisterRequest, ApiResponse };
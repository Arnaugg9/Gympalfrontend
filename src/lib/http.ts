/**
 * HTTP Client
 *
 * Lightweight fetch wrapper used across the frontend to call backend APIs.
 * Responsibilities:
 * - Build absolute URLs from `config.apiBaseUrl` and provided paths
 * - Attach `Authorization: Bearer <token>` when access token present
 * - Attempt a refresh when receiving 401 and retry once with new token
 * - Parse JSON responses and attempt to provide structured error objects
 * - Preserve FormData handling for file uploads (no JSON content-type)
 *
 * Important security notes:
 * - Access and refresh tokens are read from `localStorage`/cookies by
 *   `lib/utils/auth.ts`. Keep that code in sync with server cookie policies.
 * - Refresh flow should be fault-tolerant: if refresh fails, tokens are
 *   cleared to avoid infinite retry loops.
 */
import { config } from '../config';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './utils/auth';
import { apiLogger, logError } from './logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const startedAt = Date.now();
    apiLogger.debug({ path: '/api/v1/auth/refresh' }, 'Refreshing access token');
    const res = await fetch(joinUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      apiLogger.warn({ status: res.status }, 'Refresh token request failed');
      return null;
    }
    const response = await res.json().catch(() => null);
    // Backend wraps auth response in ApiResponse.data and uses snake_case fields
    // Support multiple possible shapes for compatibility:
    // - { data: { access_token, refresh_token } }
    // - { data: { accessToken, refreshToken } }
    // - { access_token, refresh_token }
    const authData = response?.data ?? response;
    const accessToken = authData?.access_token ?? authData?.accessToken ?? authData?.token;
    const refreshToken = authData?.refresh_token ?? authData?.refreshToken ?? refresh;
    if (accessToken) {
      // Save new tokens from refresh response
      saveTokens({
        accessToken: accessToken as string,
        refreshToken: refreshToken as string,
      });
      apiLogger.info({ durationMs: Date.now() - startedAt }, 'Access token refreshed');
      return accessToken as string;
    }
    apiLogger.warn('No token found in refresh response');
    return null;
  } catch (err) {
    logError(err as Error, { action: 'refreshAccessToken' });
    return null;
  }
}

function joinUrl(path: string) {
  const baseUrl = config.apiBaseUrl?.replace(/\/$/, '') || '';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = joinUrl(path);
  let token = getAccessToken();
  // Don't set Content-Type for FormData - browser will set it with correct boundary
  const headers: HeadersInit = {
    ...(!( options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const method = (options.method || 'GET') as HttpMethod;
  const startedAt = Date.now();
  apiLogger.debug({ method, path, url }, 'HTTP request start');
  let res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      apiLogger.debug({ path, url }, 'Retrying request with refreshed token');
      res = await fetch(url, { ...options, headers: { ...headers, Authorization: `Bearer ${newToken}` }, credentials: 'include' });
    } else {
      clearTokens();
    }
  }
  if (!res.ok) {
    // Try to parse a JSON error body for better client-side handling
    let parsed: any = null;
    const text = await res.text().catch(() => '');
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (e) {
      parsed = null;
    }

    const message = parsed?.error?.message || parsed?.message || text || `HTTP ${res.status}`;
    const error = new Error(message);
    (error as any).response = { data: parsed, status: res.status };
    logError(error as Error, { method, path, status: res.status, durationMs: Date.now() - startedAt });
    throw error;
  }
  const contentType = res.headers.get('content-type') || '';
  apiLogger.info({ method, path, status: res.status, durationMs: Date.now() - startedAt }, 'HTTP request success');
  if (contentType.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const http = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) => {
    // If body is FormData, don't JSON.stringify it - send it as-is
    const finalBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return request<T>(path, { ...init, method: 'POST', body: finalBody });
  },
  put: <T>(path: string, body?: unknown, init?: RequestInit) => {
    const finalBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return request<T>(path, { ...init, method: 'PUT', body: finalBody });
  },
  patch: <T>(path: string, body?: unknown, init?: RequestInit) => {
    const finalBody = body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined);
    return request<T>(path, { ...init, method: 'PATCH', body: finalBody });
  },
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};



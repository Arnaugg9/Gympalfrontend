/**
 * Client-side token helpers
 *
 * This module centralizes access to authentication tokens used by the
 * frontend. Tokens are stored in both `localStorage` and as cookies so that
 * both browser XHR/fetch requests and server-side helpers (if any) can read
 * values when required.
 *
 * Security note: Storing tokens in localStorage has XSS risk. If you later
 * migrate to httpOnly cookies, update `lib/http.ts` and token refresh
 * strategies accordingly.
 */
export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

function setCookie(name: string, value: string, seconds = 60 * 60 * 24, path = '/') {
  try {
    const expires = new Date(Date.now() + seconds * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; Expires=${expires}; SameSite=Lax`;
  } catch (e) {
    // Intentionally swallow cookie errors in environments that block cookies
    // (e.g., strict browser privacy modes). Token storage in localStorage
    // remains the primary mechanism.
    void e;
  }
}

function deleteCookie(name: string, path = '/') {
  try {

    document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (e) {
    void e;
  }
}

/**
 * Persist tokens for subsequent requests.
 * Stores both in `localStorage` and as cookies to maximize compatibility.
 */
export function saveTokens(tokens: AuthTokens) {
  try {
    localStorage.setItem(ACCESS, tokens.accessToken);
    setCookie(ACCESS, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH, tokens.refreshToken);
      setCookie(REFRESH, tokens.refreshToken);
    }
  } catch (e) {
    void e;
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS);
  } catch (e) {
    void e;
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH);
  } catch (e) {
    void e;
    return null;
  }
}

/**
 * Clear stored tokens from both localStorage and cookies.
 */
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    deleteCookie(ACCESS);
    deleteCookie(REFRESH);
  } catch (e) {
    void e;
  }
}



const SESSION_TOKEN_KEY = 'tfr-admin-session-token';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStoredAdminSessionToken(): string | null {
  return getStorage()?.getItem(SESSION_TOKEN_KEY) ?? null;
}

export function writeStoredAdminSessionToken(sessionToken: string): void {
  getStorage()?.setItem(SESSION_TOKEN_KEY, sessionToken);
}

export function clearStoredAdminSessionToken(): void {
  getStorage()?.removeItem(SESSION_TOKEN_KEY);
}

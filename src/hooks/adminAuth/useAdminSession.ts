import { useCallback, useEffect, useState } from 'react';
import { adminAuthenticationService } from '@/services/adminAuth';
import { readStoredAdminSessionToken } from './adminAuthStorage';
import type { AdminSession } from '@/types/adminAuth';

interface AdminSessionState {
  session: AdminSession | null;
  loading: boolean;
  error: unknown;
}

/**
 * Read-only session lookup: restores the current session (if any) from the
 * stored session token and exposes a refresh() for re-checking it. Sign-in
 * and sign-out live on useAdminAuthentication; this hook only looks up
 * session state through adminAuthenticationService.getSession.
 */
export function useAdminSession() {
  const [state, setState] = useState<AdminSessionState>({ session: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const token = readStoredAdminSessionToken();
      const session = token ? await adminAuthenticationService.getSession(token) : null;
      setState({ session, loading: false, error: null });
      return session;
    } catch (error) {
      setState({ session: null, loading: false, error });
      throw error;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = readStoredAdminSessionToken();
      const session = token ? await adminAuthenticationService.getSession(token) : null;
      if (!cancelled) setState({ session, loading: false, error: null });
    })();
    return () => { cancelled = true; };
  }, []);

  return { ...state, refresh };
}

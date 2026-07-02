import { useCallback, useEffect, useRef, useState } from 'react';
import { adminAuthenticationService } from '@/services/adminAuth';
import { clearStoredAdminSessionToken, readStoredAdminSessionToken, writeStoredAdminSessionToken } from './adminAuthStorage';
import type { AdminSession, AuthenticationStatus } from '@/types/adminAuth';

interface AdminAuthenticationState {
  status: AuthenticationStatus;
  session: AdminSession | null;
  demoUsers: Awaited<ReturnType<typeof adminAuthenticationService.listDemoUsers>>;
  error: unknown;
}

let requestCounter = 0;
function nextRequestId(): string {
  requestCounter += 1;
  return `admin-auth-request-${requestCounter}`;
}

/**
 * Owns the demo administrator sign-in/sign-out lifecycle, including
 * restoring a previously issued session token from the browser on mount.
 * Never contacts an external identity provider — every action delegates to
 * adminAuthenticationService, which is bound to the mock adapter.
 */
export function useAdminAuthentication() {
  const [state, setState] = useState<AdminAuthenticationState>({
    status: 'idle',
    session: null,
    demoUsers: [],
    error: null,
  });
  const active = useRef(true);
  useEffect(() => () => { active.current = false; }, []);

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      const demoUsers = await adminAuthenticationService.listDemoUsers();
      const storedToken = readStoredAdminSessionToken();
      if (!storedToken) {
        if (!cancelled && active.current) setState((current) => ({ ...current, status: 'unauthenticated', demoUsers }));
        return;
      }
      const session = await adminAuthenticationService.getSession(storedToken);
      if (cancelled || !active.current) return;
      if (!session) {
        clearStoredAdminSessionToken();
        setState((current) => ({ ...current, status: 'unauthenticated', session: null, demoUsers }));
        return;
      }
      setState({ status: 'authenticated', session, demoUsers, error: null });
    }
    restore();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (demoUserId: string) => {
    setState((current) => ({ ...current, status: 'authenticating', error: null }));
    const result = await adminAuthenticationService.signIn({ demoUserId, requestId: nextRequestId() });
    if (!active.current) return result;

    if (result.status !== 'authenticated' || !result.session) {
      setState((current) => ({ ...current, status: 'error', session: null, error: result.error }));
      return result;
    }

    writeStoredAdminSessionToken(result.session.sessionToken);
    setState((current) => ({ ...current, status: 'authenticated', session: result.session, error: null }));
    return result;
  }, []);

  const signOut = useCallback(async () => {
    const token = state.session?.sessionToken ?? readStoredAdminSessionToken();
    if (token) await adminAuthenticationService.signOut(token);
    clearStoredAdminSessionToken();
    if (!active.current) return;
    setState((current) => ({ ...current, status: 'unauthenticated', session: null, error: null }));
  }, [state.session]);

  return { ...state, signIn, signOut };
}

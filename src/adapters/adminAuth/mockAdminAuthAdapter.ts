import type { AdminAuthAdapter } from './adminAuthAdapter';
import { mockAdminAuthUsers } from './mockAdminAuthUsers';
import type { AdminSession, AdminSignInRequest, AdminSignInResult, AdminUser } from '@/types/adminAuth';

const fallbackNow = '2026-07-02T00:00:00.000Z';

/**
 * In-memory, per-instance simulation only. It never calls a real identity
 * provider, issues a real token, or persists sessions past the lifetime of
 * the adapter instance that created it.
 */
export function createMockAdminAuthAdapter(users: AdminUser[] = mockAdminAuthUsers): AdminAuthAdapter {
  const sessions = new Map<string, AdminSession>();
  let sessionCounter = 0;

  return {
    async listDemoUsers() {
      return users.map((user) => ({ ...user }));
    },

    async signIn(request: AdminSignInRequest): Promise<AdminSignInResult> {
      const user = users.find((candidate) => candidate.id === request.demoUserId);
      if (!user) {
        return {
          status: 'failed',
          session: null,
          error: {
            code: 'unknown-demo-user',
            message: `No demo administrator "${request.demoUserId}" is registered in the mock adapter.`,
            retryable: false,
          },
        };
      }

      sessionCounter += 1;
      const sessionToken = `mock-admin-session-${user.id}-${sessionCounter}`;
      const session: AdminSession = {
        sessionToken,
        user: { ...user },
        issuedAt: fallbackNow,
        expiresAt: null,
        metadata: { source: 'mock-admin-auth-adapter', attributes: { requestId: request.requestId } },
      };
      sessions.set(sessionToken, session);

      return { status: 'authenticated', session, error: null };
    },

    async signOut(sessionToken: string) {
      sessions.delete(sessionToken);
    },

    async getSession(sessionToken: string) {
      return sessions.get(sessionToken) ?? null;
    },
  };
}

export const mockAdminAuthAdapter = createMockAdminAuthAdapter();

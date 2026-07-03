import type { AdminAuthAdapter } from './adminAuthAdapter';

export const unavailableAdminAuthAdapter: AdminAuthAdapter = {
  async listDemoUsers() {
    return [];
  },
  async signIn() {
    return {
      status: 'adapter-unavailable',
      session: null,
      error: {
        code: 'adapter-unavailable',
        message: 'Admin authentication adapter is not connected; no demo identities are available.',
        retryable: true,
      },
    };
  },
  async signOut() {
    // No session store exists; nothing to clear.
  },
  async getSession() {
    return null;
  },
};

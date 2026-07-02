import { mockAdminAuthAdapter, unavailableAdminAuthAdapter, type AdminAuthAdapter } from '@/adapters/adminAuth';
import { adminSignInRequestSchema, adminSignInResultSchema } from '@/schemas/adminAuth.schema';
import type { AdminPermission, AdminRole, AdminSession, AdminSignInRequest, AdminSignInResult, AdminUser } from '@/types/adminAuth';

export interface AdminAuthenticationService {
  listDemoUsers(): Promise<AdminUser[]>;
  signIn(request: AdminSignInRequest): Promise<AdminSignInResult>;
  signOut(sessionToken: string): Promise<void>;
  getSession(sessionToken: string): Promise<AdminSession | null>;
  hasPermission(session: AdminSession | null, permission: AdminPermission): boolean;
  hasRole(session: AdminSession | null, role: AdminRole): boolean;
}

/**
 * Never calls an external identity provider. Every method delegates to the
 * injected AdminAuthAdapter boundary; this service only validates requests,
 * normalizes adapter output through the shared schemas, and evaluates
 * permission/role checks against an already-issued session.
 */
export function createAdminAuthenticationService(adapter: AdminAuthAdapter = unavailableAdminAuthAdapter): AdminAuthenticationService {
  async function listDemoUsers(): Promise<AdminUser[]> {
    return adapter.listDemoUsers();
  }

  async function signIn(request: AdminSignInRequest): Promise<AdminSignInResult> {
    const validated = adminSignInRequestSchema.parse(request);
    const result = await adapter.signIn(validated);
    return adminSignInResultSchema.parse(result);
  }

  async function signOut(sessionToken: string): Promise<void> {
    await adapter.signOut(sessionToken);
  }

  async function getSession(sessionToken: string): Promise<AdminSession | null> {
    if (!sessionToken) return null;
    return adapter.getSession(sessionToken);
  }

  function hasPermission(session: AdminSession | null, permission: AdminPermission): boolean {
    return session?.user.permissions.includes(permission) ?? false;
  }

  function hasRole(session: AdminSession | null, role: AdminRole): boolean {
    return session?.user.role === role;
  }

  return { listDemoUsers, signIn, signOut, getSession, hasPermission, hasRole };
}

export const adminAuthenticationService = createAdminAuthenticationService(mockAdminAuthAdapter);

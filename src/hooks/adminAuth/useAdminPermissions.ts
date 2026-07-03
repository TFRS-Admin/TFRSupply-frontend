import { useCallback } from 'react';
import { adminAuthenticationService } from '@/services/adminAuth';
import { useAdminSession } from './useAdminSession';
import type { AdminPermission, AdminRole } from '@/types/adminAuth';

/**
 * Formats the current session's role/permissions into render-ready checks.
 * Delegates evaluation to adminAuthenticationService.hasPermission/hasRole;
 * this hook contains no permission decision logic of its own.
 */
export function useAdminPermissions() {
  const { session, loading, error } = useAdminSession();

  const hasPermission = useCallback(
    (permission: AdminPermission) => adminAuthenticationService.hasPermission(session, permission),
    [session],
  );

  const hasRole = useCallback(
    (role: AdminRole) => adminAuthenticationService.hasRole(session, role),
    [session],
  );

  return {
    role: session?.user.role ?? null,
    permissions: session?.user.permissions ?? [],
    hasPermission,
    hasRole,
    loading,
    error,
  };
}

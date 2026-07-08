/**
 * services/adminAccessService.ts
 * Sprint 9 — Lightweight prototype admin access gate.
 *
 * IMPORTANT: This is NOT a real security boundary.
 * It is a UX guard to prevent accidental access during prototype review.
 *
 * Base44 removed: this now returns a stubbed authorized mock identity,
 * matching the mock user in AuthContext, until real Shopify-backed admin
 * auth replaces this gate.
 */

export interface AdminAccessResult {
  authorized: boolean;
  email: string | null;
  reason: string | null;
}

export async function checkAdminAccess(): Promise<AdminAccessResult> {
  return { authorized: true, email: 'demo@tfrsupply.com', reason: null };
}

/**
 * services/adminAccessService.js
 * Sprint 9 — Lightweight prototype admin access gate.
 *
 * IMPORTANT: This is NOT a real security boundary.
 * It is a UX guard to prevent accidental access during prototype review.
 *
 * Base44 (the prior identity source) has been removed. Until a replacement
 * identity provider is wired up, this always reports unauthenticated —
 * matching the outcome every anonymous visitor already got.
 *
 * Returns: { authorized: boolean, email: string | null, reason: string }
 */

export async function checkAdminAccess() {
  return { authorized: false, email: null, reason: 'Could not verify identity. Please log in.' };
}
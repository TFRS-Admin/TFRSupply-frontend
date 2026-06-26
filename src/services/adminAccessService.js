/**
 * services/adminAccessService.js
 * Sprint 9 — Lightweight prototype admin access gate.
 *
 * IMPORTANT: This is NOT a real security boundary.
 * It is a UX guard to prevent accidental access during prototype review.
 *
 * Approach: check Base44 current user's email against appConfig.adminEmails allowlist.
 * For production: replace with user.role === 'admin' check + server-side enforcement.
 *
 * Returns: { authorized: boolean, email: string | null, reason: string }
 */

import { base44 } from '@/api/base44Client';
import appConfig from '@/config/appConfig';

export async function checkAdminAccess() {
  try {
    const user = await base44.auth.me();
    if (!user || !user.email) {
      return { authorized: false, email: null, reason: 'Not authenticated.' };
    }
    const allowed = appConfig.adminEmails || [];
    // Also allow any user with role === 'admin' as a Base44-native fallback
    if (user.role === 'admin' || allowed.includes(user.email)) {
      return { authorized: true, email: user.email, reason: null };
    }
    return {
      authorized: false,
      email: user.email,
      reason: `Access restricted. ${user.email} is not on the admin allowlist.`,
    };
  } catch {
    return { authorized: false, email: null, reason: 'Could not verify identity. Please log in.' };
  }
}
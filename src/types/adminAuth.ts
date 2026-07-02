import type { Metadata } from './common';

export type AdminRole = 'super-admin' | 'ops-admin' | 'sales-admin' | 'viewer';

export type AdminPermission =
  | 'admin.shopify-sync.view'
  | 'admin.quote-builder.view'
  | 'admin.quotes.view'
  | 'admin.pricing-imports.view';

export type AuthenticationStatus = 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated' | 'error';

export type AdminAuthErrorCode =
  | 'unknown-demo-user'
  | 'session-not-found'
  | 'session-expired'
  | 'adapter-unavailable'
  | 'validation-error'
  | 'unknown';

export interface AdminUser {
  id: string;
  label: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  description?: string;
  metadata?: Metadata;
}

export interface AdminSession {
  sessionToken: string;
  user: AdminUser;
  issuedAt: string;
  expiresAt: string | null;
  metadata?: Metadata;
}

export interface AdminSignInRequest {
  demoUserId: string;
  requestId: string;
}

export interface AdminAuthError {
  code: AdminAuthErrorCode;
  message: string;
  retryable: boolean;
}

export interface AdminSignInResult {
  status: 'authenticated' | 'failed' | 'adapter-unavailable';
  session: AdminSession | null;
  error: AdminAuthError | null;
}

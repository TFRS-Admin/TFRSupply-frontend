import type { AdminSession, AdminSignInRequest, AdminSignInResult, AdminUser } from '@/types/adminAuth';

export interface AdminAuthAdapter {
  listDemoUsers(): Promise<AdminUser[]>;
  signIn(request: AdminSignInRequest): Promise<AdminSignInResult>;
  signOut(sessionToken: string): Promise<void>;
  getSession(sessionToken: string): Promise<AdminSession | null>;
}

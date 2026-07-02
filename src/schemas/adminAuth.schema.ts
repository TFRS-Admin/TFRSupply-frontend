import { z } from 'zod';
import { metadataSchema } from './common.schema';
import type {
  AdminAuthError,
  AdminAuthErrorCode,
  AdminPermission,
  AdminRole,
  AdminSession,
  AdminSignInRequest,
  AdminSignInResult,
  AdminUser,
  AuthenticationStatus,
} from '@/types/adminAuth';

const nonEmptyString = z.string().min(1);

export const adminRoleSchema = z.enum(['super-admin', 'ops-admin', 'sales-admin', 'viewer']) satisfies z.ZodType<AdminRole>;

export const adminPermissionSchema = z.enum([
  'admin.shopify-sync.view',
  'admin.quote-builder.view',
  'admin.quotes.view',
  'admin.pricing-imports.view',
]) satisfies z.ZodType<AdminPermission>;

export const authenticationStatusSchema = z.enum([
  'idle',
  'authenticating',
  'authenticated',
  'unauthenticated',
  'error',
]) satisfies z.ZodType<AuthenticationStatus>;

export const adminAuthErrorCodeSchema = z.enum([
  'unknown-demo-user',
  'session-not-found',
  'session-expired',
  'adapter-unavailable',
  'validation-error',
  'unknown',
]) satisfies z.ZodType<AdminAuthErrorCode>;

export const adminUserSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  email: nonEmptyString.email(),
  role: adminRoleSchema,
  permissions: z.array(adminPermissionSchema),
  description: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<AdminUser>;

export const adminSessionSchema = z.object({
  sessionToken: nonEmptyString,
  user: adminUserSchema,
  issuedAt: nonEmptyString,
  expiresAt: z.string().nullable(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<AdminSession>;

export const adminSignInRequestSchema = z.object({
  demoUserId: nonEmptyString,
  requestId: nonEmptyString,
}) as z.ZodType<AdminSignInRequest>;

export const adminAuthErrorSchema = z.object({
  code: adminAuthErrorCodeSchema,
  message: nonEmptyString,
  retryable: z.boolean(),
}) as z.ZodType<AdminAuthError>;

export const adminSignInResultSchema = z.object({
  status: z.enum(['authenticated', 'failed', 'adapter-unavailable']),
  session: adminSessionSchema.nullable(),
  error: adminAuthErrorSchema.nullable(),
}) as z.ZodType<AdminSignInResult>;

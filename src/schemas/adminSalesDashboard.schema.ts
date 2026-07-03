import { z } from 'zod';
import type {
  AdminSalesDashboardActivityEntry,
  AdminSalesDashboardData,
  AdminSalesDashboardMetrics,
  AdminSalesDashboardPlatformStatus,
  AdminSalesDashboardQuickAction,
  AdminSalesDashboardSystemHealth,
} from '@/types/adminSalesDashboard';

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();

export const adminPlatformComponentStatusSchema = z.enum(['operational', 'degraded', 'unavailable']);

export const adminSalesDashboardQuickActionSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  description: nonEmptyString,
  href: nonEmptyString,
  icon: nonEmptyString,
  available: z.boolean(),
}) as z.ZodType<AdminSalesDashboardQuickAction>;

export const adminSalesDashboardPlatformStatusSchema = z.object({
  authentication: adminPlatformComponentStatusSchema,
  sync: adminPlatformComponentStatusSchema,
  pricingEngine: adminPlatformComponentStatusSchema,
  quoteEngine: adminPlatformComponentStatusSchema,
  imports: adminPlatformComponentStatusSchema,
}) as z.ZodType<AdminSalesDashboardPlatformStatus>;

export const adminSalesDashboardActivityKindSchema = z.enum(['quote-edit', 'pricing-import', 'sync-job']);

export const adminSalesDashboardActivityEntrySchema = z.object({
  id: nonEmptyString,
  kind: adminSalesDashboardActivityKindSchema,
  label: nonEmptyString,
  detail: nonEmptyString,
  actor: nonEmptyString,
  occurredAt: nonEmptyString,
}) as z.ZodType<AdminSalesDashboardActivityEntry>;

export const adminSalesDashboardMetricsSchema = z.object({
  quotesCreated: nonNegativeInt,
  importsProcessed: nonNegativeInt,
  syncJobsRun: nonNegativeInt,
  validationStatus: z.enum(['passing', 'failing']),
  testEnvironmentStatus: z.enum(['ready', 'unavailable']),
}) as z.ZodType<AdminSalesDashboardMetrics>;

export const adminSalesDashboardSystemHealthSchema = z.object({
  buildStatus: z.enum(['passing', 'failing']),
  validationStatus: z.enum(['passing', 'failing']),
  mockServicesAvailable: z.boolean(),
  adaptersAvailable: z.boolean(),
}) as z.ZodType<AdminSalesDashboardSystemHealth>;

export const adminSalesDashboardDataSchema = z.object({
  generatedAt: nonEmptyString,
  quickActions: z.array(adminSalesDashboardQuickActionSchema),
  platformStatus: adminSalesDashboardPlatformStatusSchema,
  recentActivity: z.array(adminSalesDashboardActivityEntrySchema),
  metrics: adminSalesDashboardMetricsSchema,
  systemHealth: adminSalesDashboardSystemHealthSchema,
}) as z.ZodType<AdminSalesDashboardData>;

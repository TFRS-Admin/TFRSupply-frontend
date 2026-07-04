import { z } from 'zod';
import type {
  ShopifyStorefrontRuntimeCapabilityRow,
  ShopifyStorefrontRuntimeDiagnostic,
  ShopifyStorefrontRuntimeDiagnosticCode,
  ShopifyStorefrontRuntimeDiagnosticLevel,
  ShopifyStorefrontRuntimeFeatureFlag,
  ShopifyStorefrontRuntimeMode,
  ShopifyStorefrontRuntimeStatus,
} from '@/types';
import { metadataSchema } from './common.schema';
import { shopifyStorefrontAdapterModeSchema } from './shopifyStorefront.schema';
import { shopifyStorefrontCapabilitySummarySchema } from './shopifyStorefrontConfig.schema';

const nonEmptyString = z.string().min(1);

export const shopifyStorefrontRuntimeModeSchema = z.enum(['mock', 'unavailable', 'live', 'mixed']) satisfies z.ZodType<ShopifyStorefrontRuntimeMode>;
export const shopifyStorefrontRuntimeDiagnosticLevelSchema = z.enum(['info', 'warning', 'error']) satisfies z.ZodType<ShopifyStorefrontRuntimeDiagnosticLevel>;
export const shopifyStorefrontRuntimeDiagnosticCodeSchema = z.enum(['env-mode', 'missing-env-var', 'storefront-disabled', 'live-adapter-not-ready']) satisfies z.ZodType<ShopifyStorefrontRuntimeDiagnosticCode>;

export const shopifyStorefrontRuntimeDiagnosticSchema = z.object({
  code: shopifyStorefrontRuntimeDiagnosticCodeSchema,
  level: shopifyStorefrontRuntimeDiagnosticLevelSchema,
  message: nonEmptyString,
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontRuntimeDiagnostic>;

export const shopifyStorefrontRuntimeCapabilityRowSchema = z.object({
  foundation: nonEmptyString,
  adapterMode: shopifyStorefrontAdapterModeSchema,
  dryRunOnly: z.boolean(),
  liveCallsEnabled: z.boolean(),
  notes: z.string().optional(),
}) as z.ZodType<ShopifyStorefrontRuntimeCapabilityRow>;

export const shopifyStorefrontRuntimeFeatureFlagSchema = z.object({
  key: nonEmptyString,
  label: nonEmptyString,
  enabled: z.boolean(),
  description: nonEmptyString,
}) as z.ZodType<ShopifyStorefrontRuntimeFeatureFlag>;

export const shopifyStorefrontRuntimeStatusSchema = z.object({
  runtimeMode: shopifyStorefrontRuntimeModeSchema,
  capabilitySummary: shopifyStorefrontCapabilitySummarySchema,
  capabilityMatrix: z.array(shopifyStorefrontRuntimeCapabilityRowSchema),
  featureFlags: z.array(shopifyStorefrontRuntimeFeatureFlagSchema),
  diagnostics: z.array(shopifyStorefrontRuntimeDiagnosticSchema),
  readinessSummary: nonEmptyString,
  checkedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontRuntimeStatus>;

import { z } from 'zod';
import type { ShopifyInventorySyncPayload, ShopifyPricingReferenceSyncPayload, ShopifyProductSyncPayload, ShopifySyncDirection, ShopifySyncEntityType, ShopifySyncError, ShopifySyncErrorCode, ShopifySyncPayload, ShopifySyncRequest, ShopifySyncResult, ShopifySyncRetryMetadata, ShopifySyncStatus, ShopifySyncSubject, ShopifyVariantSyncPayload } from '@/types';
import { metadataSchema } from './common.schema';
import { inventoryStatusSchema, priceSchema, shopifyProductSchema, shopifyVariantSchema, variantMappingSchema } from './commerce.schema';

export const shopifySyncEntityTypeSchema = z.enum(['product', 'variant', 'inventory', 'pricing-reference', 'metadata']) satisfies z.ZodType<ShopifySyncEntityType>;
export const shopifySyncDirectionSchema = z.enum(['push', 'pull', 'reconcile']) satisfies z.ZodType<ShopifySyncDirection>;
export const shopifySyncStatusSchema = z.enum(['pending', 'validated', 'skipped', 'succeeded', 'failed', 'retryable']) satisfies z.ZodType<ShopifySyncStatus>;
export const shopifySyncErrorCodeSchema = z.enum(['validation-error', 'adapter-unavailable', 'not-found', 'conflict', 'rate-limited', 'unknown']) satisfies z.ZodType<ShopifySyncErrorCode>;

export const shopifySyncRetryMetadataSchema = z.object({
  attempt: z.number().int().min(0),
  maxAttempts: z.number().int().min(0),
  nextRetryAt: z.string().optional(),
  lastAttemptAt: z.string().optional(),
  backoffSeconds: z.number().min(0).optional(),
}) as z.ZodType<ShopifySyncRetryMetadata>;

export const shopifySyncErrorSchema = z.object({
  code: shopifySyncErrorCodeSchema,
  message: z.string(),
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifySyncError>;

export const shopifySyncSubjectSchema = z.object({
  entityType: shopifySyncEntityTypeSchema,
  productId: z.string().optional(),
  sku: z.string().optional(),
  shopifyProductId: z.string().optional(),
  shopifyVariantId: z.string().optional(),
}) as z.ZodType<ShopifySyncSubject>;

export const shopifyProductSyncPayloadSchema = z.object({ product: shopifyProductSchema, metadata: metadataSchema.optional() }) as z.ZodType<ShopifyProductSyncPayload>;
export const shopifyVariantSyncPayloadSchema = z.object({ variant: shopifyVariantSchema, variantMapping: variantMappingSchema.optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyVariantSyncPayload>;
export const shopifyInventorySyncPayloadSchema = z.object({ sku: z.string(), inventoryStatus: inventoryStatusSchema, shopifyVariantId: z.string().optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyInventorySyncPayload>;
export const shopifyPricingReferenceSyncPayloadSchema = z.object({ sku: z.string(), price: priceSchema, shopifyVariantId: z.string().optional(), source: z.string().optional(), metadata: metadataSchema.optional() }) as z.ZodType<ShopifyPricingReferenceSyncPayload>;
export const shopifySyncPayloadSchema = z.union([shopifyProductSyncPayloadSchema, shopifyVariantSyncPayloadSchema, shopifyInventorySyncPayloadSchema, shopifyPricingReferenceSyncPayloadSchema]) as z.ZodType<ShopifySyncPayload>;

export const shopifySyncRequestSchema = z.object({
  requestId: z.string(),
  direction: shopifySyncDirectionSchema,
  subject: shopifySyncSubjectSchema,
  payload: shopifySyncPayloadSchema,
  dryRun: z.literal(true),
  requestedAt: z.string().optional(),
  retry: shopifySyncRetryMetadataSchema.optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifySyncRequest>;

export const shopifySyncResultSchema = z.object({
  requestId: z.string(),
  status: shopifySyncStatusSchema,
  subject: shopifySyncSubjectSchema,
  payload: shopifySyncPayloadSchema.optional(),
  errors: z.array(shopifySyncErrorSchema),
  retry: shopifySyncRetryMetadataSchema.optional(),
  syncedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifySyncResult>;

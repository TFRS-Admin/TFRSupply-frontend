import { z } from 'zod';
import type {
  ShopifyStorefrontCollectionAdapterMode,
  ShopifyStorefrontCollectionError,
  ShopifyStorefrontCollectionErrorCode,
  ShopifyStorefrontCollectionMapping,
  ShopifyStorefrontCollectionPreview,
  ShopifyStorefrontCollectionRequest,
  ShopifyStorefrontCollectionResult,
  ShopifyStorefrontCollectionStatus,
} from '@/types';
import { metadataSchema } from './common.schema';

const nonEmptyString = z.string().min(1);

export const shopifyStorefrontCollectionAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<ShopifyStorefrontCollectionAdapterMode>;
export const shopifyStorefrontCollectionStatusSchema = z.enum(['not-started', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyStorefrontCollectionStatus>;
export const shopifyStorefrontCollectionErrorCodeSchema = z.enum(['validation-error', 'unmapped-category', 'adapter-unavailable', 'live-calls-disabled', 'unknown']) satisfies z.ZodType<ShopifyStorefrontCollectionErrorCode>;

const shopifyStorefrontCollectionConfigSchema = z.object({
  storeDomain: z.string().optional(),
  apiVersion: z.string().optional(),
  storefrontAccessToken: z.string().optional(),
  languageCode: z.string().optional(),
  countryCode: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export const shopifyStorefrontCollectionMappingSchema = z.object({
  categoryId: nonEmptyString,
  verticalId: nonEmptyString,
  handle: nonEmptyString,
  shopifyCollectionId: z.string().nullable(),
  shopifyCollectionGid: z.string().nullable(),
  mapped: z.boolean(),
  productCount: z.number().int().nonnegative(),
}) as z.ZodType<ShopifyStorefrontCollectionMapping>;

export const shopifyStorefrontCollectionPreviewSchema = z.object({
  operationName: nonEmptyString,
  query: nonEmptyString,
  variables: z.record(z.unknown()),
}) as z.ZodType<ShopifyStorefrontCollectionPreview>;

export const shopifyStorefrontCollectionErrorSchema = z.object({
  code: shopifyStorefrontCollectionErrorCodeSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCollectionError>;

export const shopifyStorefrontCollectionRequestSchema = z.object({
  requestId: nonEmptyString,
  dryRun: z.literal(true),
  categoryId: nonEmptyString,
  config: shopifyStorefrontCollectionConfigSchema.partial().optional(),
  requestedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCollectionRequest>;

export const shopifyStorefrontCollectionResultSchema = z.object({
  requestId: nonEmptyString,
  status: shopifyStorefrontCollectionStatusSchema,
  categoryId: nonEmptyString,
  mapping: shopifyStorefrontCollectionMappingSchema.nullable(),
  preview: shopifyStorefrontCollectionPreviewSchema.nullable(),
  errors: z.array(shopifyStorefrontCollectionErrorSchema),
  respondedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCollectionResult>;

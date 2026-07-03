import { z } from 'zod';
import type {
  ShopifyStorefrontProductAdapterMode,
  ShopifyStorefrontProductError,
  ShopifyStorefrontProductErrorCode,
  ShopifyStorefrontProductMapping,
  ShopifyStorefrontProductPreview,
  ShopifyStorefrontProductRequest,
  ShopifyStorefrontProductResult,
  ShopifyStorefrontProductStatus,
} from '@/types';
import { metadataSchema } from './common.schema';

const nonEmptyString = z.string().min(1);

export const shopifyStorefrontProductAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<ShopifyStorefrontProductAdapterMode>;
export const shopifyStorefrontProductStatusSchema = z.enum(['not-started', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyStorefrontProductStatus>;
export const shopifyStorefrontProductErrorCodeSchema = z.enum(['validation-error', 'unmapped-product', 'adapter-unavailable', 'live-calls-disabled', 'unknown']) satisfies z.ZodType<ShopifyStorefrontProductErrorCode>;

const shopifyStorefrontProductConfigSchema = z.object({
  storeDomain: z.string().optional(),
  apiVersion: z.string().optional(),
  storefrontAccessToken: z.string().optional(),
  languageCode: z.string().optional(),
  countryCode: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export const shopifyStorefrontProductMappingSchema = z.object({
  productId: nonEmptyString,
  sku: z.string().optional(),
  handle: nonEmptyString,
  shopifyProductId: z.string().nullable(),
  shopifyProductGid: z.string().nullable(),
  mapped: z.boolean(),
  variantCount: z.number().int().nonnegative(),
  mediaCount: z.number().int().nonnegative(),
}) as z.ZodType<ShopifyStorefrontProductMapping>;

export const shopifyStorefrontProductPreviewSchema = z.object({
  operationName: nonEmptyString,
  query: nonEmptyString,
  variables: z.record(z.unknown()),
}) as z.ZodType<ShopifyStorefrontProductPreview>;

export const shopifyStorefrontProductErrorSchema = z.object({
  code: shopifyStorefrontProductErrorCodeSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontProductError>;

export const shopifyStorefrontProductRequestSchema = z.object({
  requestId: nonEmptyString,
  dryRun: z.literal(true),
  productId: nonEmptyString,
  config: shopifyStorefrontProductConfigSchema.partial().optional(),
  requestedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontProductRequest>;

export const shopifyStorefrontProductResultSchema = z.object({
  requestId: nonEmptyString,
  status: shopifyStorefrontProductStatusSchema,
  productId: nonEmptyString,
  mapping: shopifyStorefrontProductMappingSchema.nullable(),
  preview: shopifyStorefrontProductPreviewSchema.nullable(),
  errors: z.array(shopifyStorefrontProductErrorSchema),
  respondedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontProductResult>;

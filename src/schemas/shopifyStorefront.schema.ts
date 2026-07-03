import { z } from 'zod';
import type { ShopifyStorefrontAdapterMode, ShopifyStorefrontAvailability, ShopifyStorefrontClientConfig, ShopifyStorefrontError, ShopifyStorefrontErrorCode, ShopifyStorefrontOperation, ShopifyStorefrontOperationType, ShopifyStorefrontRequest, ShopifyStorefrontResponse, ShopifyStorefrontResponseStatus } from '@/types';
import { metadataSchema } from './common.schema';

const nonEmptyString = z.string().min(1);

export const shopifyStorefrontOperationTypeSchema = z.enum(['shop-query', 'product-query', 'product-list-query', 'collection-query', 'cart-query']) satisfies z.ZodType<ShopifyStorefrontOperationType>;
export const shopifyStorefrontAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<ShopifyStorefrontAdapterMode>;
export const shopifyStorefrontResponseStatusSchema = z.enum(['not-started', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyStorefrontResponseStatus>;
export const shopifyStorefrontErrorCodeSchema = z.enum(['validation-error', 'unsupported-operation', 'configuration-error', 'adapter-unavailable', 'live-calls-disabled', 'unknown']) satisfies z.ZodType<ShopifyStorefrontErrorCode>;

const shopifyStorefrontClientConfigObjectSchema = z.object({
  storeDomain: nonEmptyString,
  apiVersion: nonEmptyString,
  storefrontAccessToken: z.string().optional(),
  languageCode: z.string().optional(),
  countryCode: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
});
export const shopifyStorefrontClientConfigSchema = shopifyStorefrontClientConfigObjectSchema as z.ZodType<ShopifyStorefrontClientConfig>;

export const shopifyStorefrontOperationSchema = z.object({
  operationType: shopifyStorefrontOperationTypeSchema,
  operationName: nonEmptyString,
  query: nonEmptyString,
  variables: z.record(z.unknown()).optional(),
}) as z.ZodType<ShopifyStorefrontOperation>;

export const shopifyStorefrontRequestSchema = z.object({
  requestId: nonEmptyString,
  dryRun: z.literal(true),
  operation: shopifyStorefrontOperationSchema,
  config: shopifyStorefrontClientConfigObjectSchema.partial().optional(),
  requestedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontRequest>;

export const shopifyStorefrontErrorSchema = z.object({
  code: shopifyStorefrontErrorCodeSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontError>;

export const shopifyStorefrontResponseSchema = z.object({
  requestId: nonEmptyString,
  status: shopifyStorefrontResponseStatusSchema,
  operationType: shopifyStorefrontOperationTypeSchema.nullable(),
  data: z.record(z.unknown()).nullable(),
  errors: z.array(shopifyStorefrontErrorSchema),
  respondedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontResponse>;

export const shopifyStorefrontAvailabilitySchema = z.object({
  available: z.boolean(),
  configured: z.boolean(),
  adapterMode: shopifyStorefrontAdapterModeSchema,
  reason: z.string().optional(),
  checkedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontAvailability>;

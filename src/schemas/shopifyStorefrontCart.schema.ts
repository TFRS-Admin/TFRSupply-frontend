import { z } from 'zod';
import type {
  ShopifyStorefrontCartAdapterMode,
  ShopifyStorefrontCartError,
  ShopifyStorefrontCartErrorCode,
  ShopifyStorefrontCartLine,
  ShopifyStorefrontCartMutationPreview,
  ShopifyStorefrontCartRequest,
  ShopifyStorefrontCartResult,
  ShopifyStorefrontCartStatus,
  ShopifyStorefrontCheckoutPreview,
} from '@/types';
import { cartLineItemSchema } from './cartWorkspace.schema';
import { metadataSchema, moneySchema } from './common.schema';

const nonEmptyString = z.string().min(1);

export const shopifyStorefrontCartAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<ShopifyStorefrontCartAdapterMode>;
export const shopifyStorefrontCartStatusSchema = z.enum(['not-started', 'dry-run', 'succeeded', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyStorefrontCartStatus>;
export const shopifyStorefrontCartErrorCodeSchema = z.enum([
  'validation-error',
  'unmapped-line',
  'adapter-unavailable',
  'live-calls-disabled',
  'configuration-error',
  'network-error',
  'shopify-error',
  'unknown',
]) satisfies z.ZodType<ShopifyStorefrontCartErrorCode>;

const shopifyStorefrontCartConfigSchema = z.object({
  storeDomain: z.string().optional(),
  apiVersion: z.string().optional(),
  storefrontAccessToken: z.string().optional(),
  languageCode: z.string().optional(),
  countryCode: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export const shopifyStorefrontCartLineSchema = z.object({
  cartLineId: nonEmptyString,
  sku: nonEmptyString,
  quantity: z.number().int().positive(),
  merchandiseId: z.string().nullable(),
  merchandiseAvailable: z.boolean(),
  attributes: z.record(z.string()).optional(),
}) as z.ZodType<ShopifyStorefrontCartLine>;

export const shopifyStorefrontCartMutationPreviewSchema = z.object({
  operationName: nonEmptyString,
  query: nonEmptyString,
  variables: z.record(z.unknown()),
}) as z.ZodType<ShopifyStorefrontCartMutationPreview>;

export const shopifyStorefrontCheckoutPreviewSchema = z.object({
  checkoutUrlPreview: z.string().nullable(),
  cartId: z.string().nullable(),
  currencyCode: nonEmptyString,
  estimatedTotal: moneySchema,
  lineCount: z.number().int().nonnegative(),
  ready: z.boolean(),
}) as z.ZodType<ShopifyStorefrontCheckoutPreview>;

export const shopifyStorefrontCartErrorSchema = z.object({
  code: shopifyStorefrontCartErrorCodeSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCartError>;

export const shopifyStorefrontCartRequestSchema = z.object({
  requestId: nonEmptyString,
  dryRun: z.literal(true),
  lines: z.array(cartLineItemSchema),
  config: shopifyStorefrontCartConfigSchema.partial().optional(),
  requestedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCartRequest>;

export const shopifyStorefrontCartResultSchema = z.object({
  requestId: nonEmptyString,
  status: shopifyStorefrontCartStatusSchema,
  cartLines: z.array(shopifyStorefrontCartLineSchema),
  lineCount: z.number().int().nonnegative(),
  mutationPreview: shopifyStorefrontCartMutationPreviewSchema.nullable(),
  checkoutPreview: shopifyStorefrontCheckoutPreviewSchema.nullable(),
  errors: z.array(shopifyStorefrontCartErrorSchema),
  respondedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyStorefrontCartResult>;

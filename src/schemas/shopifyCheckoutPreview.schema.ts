import { z } from 'zod';
import type {
  ShopifyCheckoutPreviewAdapterMode,
  ShopifyCheckoutPreviewBlocker,
  ShopifyCheckoutPreviewError,
  ShopifyCheckoutPreviewErrorCode,
  ShopifyCheckoutPreviewIssueCategory,
  ShopifyCheckoutPreviewRequest,
  ShopifyCheckoutPreviewResult,
  ShopifyCheckoutPreviewStatus,
  ShopifyCheckoutPreviewWarning,
  ShopifyCheckoutUrlPreview,
} from '@/types';
import { cartLineItemSchema } from './cartWorkspace.schema';
import { checkoutIssueCategorySchema } from './checkoutPreparation.schema';
import { metadataSchema, moneySchema } from './common.schema';

const nonEmptyString = z.string().min(1);

export const shopifyCheckoutPreviewAdapterModeSchema = z.enum(['mock', 'unavailable', 'live']) satisfies z.ZodType<ShopifyCheckoutPreviewAdapterMode>;
export const shopifyCheckoutPreviewStatusSchema = z.enum(['not-started', 'preview-ready', 'blocked', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyCheckoutPreviewStatus>;
export const shopifyCheckoutPreviewErrorCodeSchema = z.enum(['validation-error', 'adapter-unavailable', 'live-calls-disabled', 'unknown']) satisfies z.ZodType<ShopifyCheckoutPreviewErrorCode>;

export const shopifyCheckoutPreviewIssueCategorySchema = z.union([
  checkoutIssueCategorySchema,
  z.literal('storefront'),
]) satisfies z.ZodType<ShopifyCheckoutPreviewIssueCategory>;

const shopifyCheckoutPreviewConfigSchema = z.object({
  storeDomain: z.string().optional(),
  apiVersion: z.string().optional(),
  storefrontAccessToken: z.string().optional(),
  languageCode: z.string().optional(),
  countryCode: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export const shopifyCheckoutPreviewBlockerSchema = z.object({
  code: nonEmptyString,
  category: shopifyCheckoutPreviewIssueCategorySchema,
  message: nonEmptyString,
  lineId: z.string().optional(),
}) as z.ZodType<ShopifyCheckoutPreviewBlocker>;

export const shopifyCheckoutPreviewWarningSchema = z.object({
  code: nonEmptyString,
  category: shopifyCheckoutPreviewIssueCategorySchema,
  message: nonEmptyString,
  lineId: z.string().optional(),
}) as z.ZodType<ShopifyCheckoutPreviewWarning>;

export const shopifyCheckoutPreviewErrorSchema = z.object({
  code: shopifyCheckoutPreviewErrorCodeSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyCheckoutPreviewError>;

export const shopifyCheckoutUrlPreviewSchema = z.object({
  checkoutUrlPreview: z.string().nullable(),
  cartId: z.string().nullable(),
  currencyCode: nonEmptyString,
  estimatedTotal: moneySchema,
  lineCount: z.number().int().nonnegative(),
  ready: z.boolean(),
}) as z.ZodType<ShopifyCheckoutUrlPreview>;

export const shopifyCheckoutPreviewRequestSchema = z.object({
  requestId: nonEmptyString,
  lines: z.array(cartLineItemSchema).optional(),
  config: shopifyCheckoutPreviewConfigSchema.partial().optional(),
  requestedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyCheckoutPreviewRequest>;

export const shopifyCheckoutPreviewResultSchema = z.object({
  requestId: nonEmptyString,
  status: shopifyCheckoutPreviewStatusSchema,
  adapterMode: shopifyCheckoutPreviewAdapterModeSchema,
  urlPreview: shopifyCheckoutUrlPreviewSchema.nullable(),
  blockers: z.array(shopifyCheckoutPreviewBlockerSchema),
  warnings: z.array(shopifyCheckoutPreviewWarningSchema),
  errors: z.array(shopifyCheckoutPreviewErrorSchema),
  checkoutRedirectDisabled: z.literal(true),
  respondedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyCheckoutPreviewResult>;

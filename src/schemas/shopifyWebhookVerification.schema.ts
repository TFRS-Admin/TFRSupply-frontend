import { z } from 'zod';
import { metadataSchema } from './common.schema';
import { shopifyWebhookTopicSchema } from './shopifyWebhook.schema';
import type { ShopifyWebhookVerificationError, ShopifyWebhookVerificationFailure, ShopifyWebhookVerificationRequest, ShopifyWebhookVerificationResult, ShopifyWebhookVerificationStatus } from '@/types/shopifyWebhookVerification';

const nonEmptyString = z.string().min(1);

export const shopifyWebhookVerificationStatusSchema = z.enum(['verified', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyWebhookVerificationStatus>;

export const shopifyWebhookVerificationErrorSchema = z.enum([
  'missing-hmac-header',
  'invalid-hmac-header',
  'missing-raw-payload',
  'missing-secret-reference',
  'signature-mismatch',
  'timestamp-invalid',
  'adapter-unavailable',
  'validation-error',
  'unknown',
]) satisfies z.ZodType<ShopifyWebhookVerificationError>;

export const shopifyWebhookVerificationRequestSchema = z.object({
  requestId: nonEmptyString,
  rawBody: z.string(),
  hmacHeader: z.string(),
  secretReference: z.string(),
  shopDomain: z.string().optional(),
  topic: shopifyWebhookTopicSchema.optional(),
  receivedAt: z.string().optional(),
  triggeredAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookVerificationRequest>;

export const shopifyWebhookVerificationFailureSchema = z.object({
  code: shopifyWebhookVerificationErrorSchema,
  message: nonEmptyString,
  fieldPath: z.string().optional(),
  retryable: z.boolean(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookVerificationFailure>;

export const shopifyWebhookVerificationResultSchema = z.object({
  requestId: nonEmptyString,
  status: shopifyWebhookVerificationStatusSchema,
  verified: z.boolean(),
  reason: shopifyWebhookVerificationErrorSchema.nullable(),
  failures: z.array(shopifyWebhookVerificationFailureSchema),
  receivedAt: z.string().optional(),
  triggeredAt: z.string().optional(),
  verifiedAt: z.string().optional(),
  metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookVerificationResult>;

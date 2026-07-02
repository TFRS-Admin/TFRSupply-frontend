import { z } from 'zod';
import type { ShopifyWebhookDomain, ShopifyWebhookError, ShopifyWebhookErrorCode, ShopifyWebhookEvent, ShopifyWebhookHeaders, ShopifyWebhookRequest, ShopifyWebhookResult, ShopifyWebhookStatus, ShopifyWebhookTopic } from '@/types/shopifyWebhook';
import { metadataSchema } from './common.schema';

const nonEmptyString = z.string().min(1);

export const shopifyWebhookTopicSchema = z.enum([
  'orders/create', 'orders/updated', 'orders/cancelled', 'orders/fulfilled',
  'customers/create', 'customers/update', 'customers/delete',
  'products/create', 'products/update', 'products/delete',
  'inventory_levels/update', 'inventory_items/update',
  'metafields/create', 'metafields/update', 'metafields/delete',
  'fulfillments/create', 'fulfillments/update',
]) satisfies z.ZodType<ShopifyWebhookTopic>;

export const shopifyWebhookDomainSchema = z.enum(['orders', 'customers', 'products', 'inventory', 'pricing', 'fulfillments']) satisfies z.ZodType<ShopifyWebhookDomain>;

export const shopifyWebhookStatusSchema = z.enum(['received', 'validated', 'normalized', 'routed', 'ignored', 'failed', 'adapter-unavailable']) satisfies z.ZodType<ShopifyWebhookStatus>;

export const shopifyWebhookErrorCodeSchema = z.enum(['validation-error', 'unsupported-topic', 'malformed-payload', 'routing-error', 'adapter-unavailable', 'unknown']) satisfies z.ZodType<ShopifyWebhookErrorCode>;

export const shopifyWebhookHeadersSchema = z.object({
  topic: shopifyWebhookTopicSchema, shopDomain: nonEmptyString, webhookId: nonEmptyString, apiVersion: z.string().optional(), triggeredAt: z.string().optional(), hmacSignature: z.string().optional(),
}) as z.ZodType<ShopifyWebhookHeaders>;

export const shopifyWebhookRequestSchema = z.object({
  requestId: nonEmptyString, headers: shopifyWebhookHeadersSchema, rawBody: z.string(), receivedAt: z.string().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookRequest>;

export const shopifyWebhookEventSchema = z.object({
  id: nonEmptyString, topic: shopifyWebhookTopicSchema, domain: shopifyWebhookDomainSchema, shopDomain: nonEmptyString, webhookId: nonEmptyString, payload: z.record(z.unknown()), receivedAt: nonEmptyString, metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookEvent>;

export const shopifyWebhookErrorSchema = z.object({
  code: shopifyWebhookErrorCodeSchema, message: nonEmptyString, fieldPath: z.string().optional(), retryable: z.boolean(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookError>;

export const shopifyWebhookResultSchema = z.object({
  requestId: nonEmptyString, status: shopifyWebhookStatusSchema, topic: shopifyWebhookTopicSchema.nullable(), domain: shopifyWebhookDomainSchema.nullable(), event: shopifyWebhookEventSchema.nullable(), errors: z.array(shopifyWebhookErrorSchema), processedAt: z.string().optional(), metadata: metadataSchema.optional(),
}) as z.ZodType<ShopifyWebhookResult>;

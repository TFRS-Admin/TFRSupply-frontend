import type { Metadata } from './common';

export type ShopifyWebhookDomain = 'orders' | 'customers' | 'products' | 'inventory' | 'pricing' | 'fulfillments';

export type ShopifyWebhookTopic =
  | 'orders/create'
  | 'orders/updated'
  | 'orders/cancelled'
  | 'orders/fulfilled'
  | 'customers/create'
  | 'customers/update'
  | 'customers/delete'
  | 'products/create'
  | 'products/update'
  | 'products/delete'
  | 'inventory_levels/update'
  | 'inventory_items/update'
  | 'metafields/create'
  | 'metafields/update'
  | 'metafields/delete'
  | 'fulfillments/create'
  | 'fulfillments/update';

export type ShopifyWebhookStatus = 'received' | 'validated' | 'normalized' | 'routed' | 'ignored' | 'failed' | 'adapter-unavailable';
export type ShopifyWebhookErrorCode = 'validation-error' | 'unsupported-topic' | 'malformed-payload' | 'routing-error' | 'adapter-unavailable' | 'unknown';

export interface ShopifyWebhookHeaders {
  topic: ShopifyWebhookTopic;
  shopDomain: string;
  webhookId: string;
  apiVersion?: string;
  triggeredAt?: string;
  hmacSignature?: string;
}

export interface ShopifyWebhookRequest {
  requestId: string;
  headers: ShopifyWebhookHeaders;
  rawBody: string;
  receivedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyWebhookEvent {
  id: string;
  topic: ShopifyWebhookTopic;
  domain: ShopifyWebhookDomain;
  shopDomain: string;
  webhookId: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  metadata?: Metadata;
}

export interface ShopifyWebhookError {
  code: ShopifyWebhookErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyWebhookResult {
  requestId: string;
  status: ShopifyWebhookStatus;
  topic: ShopifyWebhookTopic | null;
  domain: ShopifyWebhookDomain | null;
  event: ShopifyWebhookEvent | null;
  errors: ShopifyWebhookError[];
  processedAt?: string;
  metadata?: Metadata;
}

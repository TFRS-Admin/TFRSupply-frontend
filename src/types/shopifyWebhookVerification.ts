import type { Metadata } from './common';
import type { ShopifyWebhookTopic } from './shopifyWebhook';

export type ShopifyWebhookVerificationStatus = 'verified' | 'failed' | 'adapter-unavailable';

export type ShopifyWebhookVerificationError =
  | 'missing-hmac-header'
  | 'invalid-hmac-header'
  | 'missing-raw-payload'
  | 'missing-secret-reference'
  | 'signature-mismatch'
  | 'timestamp-invalid'
  | 'adapter-unavailable'
  | 'validation-error'
  | 'unknown';

export interface ShopifyWebhookVerificationRequest {
  requestId: string;
  rawBody: string;
  hmacHeader: string;
  secretReference: string;
  shopDomain?: string;
  topic?: ShopifyWebhookTopic;
  receivedAt?: string;
  triggeredAt?: string;
  metadata?: Metadata;
}

export interface ShopifyWebhookVerificationFailure {
  code: ShopifyWebhookVerificationError;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyWebhookVerificationResult {
  requestId: string;
  status: ShopifyWebhookVerificationStatus;
  verified: boolean;
  reason: ShopifyWebhookVerificationError | null;
  failures: ShopifyWebhookVerificationFailure[];
  receivedAt?: string;
  triggeredAt?: string;
  verifiedAt?: string;
  metadata?: Metadata;
}

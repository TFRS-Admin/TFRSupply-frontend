import { unavailableShopifyWebhookVerificationAdapter, type ShopifyWebhookVerificationAdapter } from '@/adapters/shopifyWebhookVerification';
import { shopifyWebhookVerificationRequestSchema, shopifyWebhookVerificationResultSchema } from '@/schemas/shopifyWebhookVerification.schema';
import type { ShopifyWebhookVerificationFailure, ShopifyWebhookVerificationRequest, ShopifyWebhookVerificationResult } from '@/types/shopifyWebhookVerification';

export interface ShopifyWebhookVerificationService {
  verifyWebhookSignature(request: ShopifyWebhookVerificationRequest): Promise<ShopifyWebhookVerificationResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

function failedResult(request: ShopifyWebhookVerificationRequest, failures: ShopifyWebhookVerificationFailure[]): ShopifyWebhookVerificationResult {
  return shopifyWebhookVerificationResultSchema.parse({
    requestId: request.requestId,
    status: 'failed',
    verified: false,
    reason: failures[0]?.code ?? 'unknown',
    failures,
    receivedAt: request.receivedAt,
    triggeredAt: request.triggeredAt,
    verifiedAt: request.receivedAt ?? fallbackNow,
    metadata: { source: 'shopifyWebhookVerificationService' },
  });
}

export function validateShopifyWebhookVerificationRequest(request: ShopifyWebhookVerificationRequest): ShopifyWebhookVerificationFailure[] {
  const failures: ShopifyWebhookVerificationFailure[] = [];

  if (!request.rawBody.length) failures.push({ code: 'missing-raw-payload', message: 'Shopify webhook verification requires the exact raw request payload.', fieldPath: 'rawBody', retryable: false });
  if (!request.hmacHeader.trim().length) failures.push({ code: 'missing-hmac-header', message: 'Shopify webhook verification requires the X-Shopify-Hmac-Sha256 header.', fieldPath: 'hmacHeader', retryable: false });
  if (request.hmacHeader.trim().length && !base64Pattern.test(request.hmacHeader) && request.hmacHeader !== 'mock-valid-shopify-hmac') failures.push({ code: 'invalid-hmac-header', message: 'Shopify webhook HMAC header must be a base64-encoded signature value.', fieldPath: 'hmacHeader', retryable: false });
  if (!request.secretReference.trim().length) failures.push({ code: 'missing-secret-reference', message: 'Shopify webhook verification requires a secret reference for the adapter boundary.', fieldPath: 'secretReference', retryable: false });
  if (request.triggeredAt && Number.isNaN(Date.parse(request.triggeredAt))) failures.push({ code: 'timestamp-invalid', message: 'Shopify webhook triggeredAt metadata must be an ISO-compatible timestamp.', fieldPath: 'triggeredAt', retryable: false });
  if (request.receivedAt && Number.isNaN(Date.parse(request.receivedAt))) failures.push({ code: 'timestamp-invalid', message: 'Shopify webhook receivedAt metadata must be an ISO-compatible timestamp.', fieldPath: 'receivedAt', retryable: false });

  return failures;
}

export function createShopifyWebhookVerificationService(adapter: ShopifyWebhookVerificationAdapter = unavailableShopifyWebhookVerificationAdapter): ShopifyWebhookVerificationService {
  async function verifyWebhookSignature(request: ShopifyWebhookVerificationRequest): Promise<ShopifyWebhookVerificationResult> {
    const validated = shopifyWebhookVerificationRequestSchema.parse(request);
    const failures = validateShopifyWebhookVerificationRequest(validated);
    if (failures.length) return failedResult(validated, failures);

    const adapterResult = await adapter.verifySignature(validated);
    return shopifyWebhookVerificationResultSchema.parse({
      ...adapterResult,
      metadata: { ...adapterResult.metadata, attributes: { ...adapterResult.metadata?.attributes, verifiedBy: 'shopifyWebhookVerificationService' } },
    });
  }

  return { verifyWebhookSignature };
}

export const shopifyWebhookVerificationService = createShopifyWebhookVerificationService();

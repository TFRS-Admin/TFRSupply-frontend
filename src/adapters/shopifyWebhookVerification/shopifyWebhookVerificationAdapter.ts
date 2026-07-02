import type { ShopifyWebhookVerificationFailure, ShopifyWebhookVerificationRequest, ShopifyWebhookVerificationResult } from '@/types/shopifyWebhookVerification';

export interface ShopifyWebhookVerificationAdapter {
  verifySignature(request: ShopifyWebhookVerificationRequest): Promise<ShopifyWebhookVerificationResult>;
}

const fallbackNow = '2026-07-02T00:00:00.000Z';
const mockValidHmacHeader = 'mock-valid-shopify-hmac';

function failure(request: ShopifyWebhookVerificationRequest, item: ShopifyWebhookVerificationFailure, status: ShopifyWebhookVerificationResult['status'] = 'failed'): ShopifyWebhookVerificationResult {
  return {
    requestId: request.requestId,
    status,
    verified: false,
    reason: item.code,
    failures: [item],
    receivedAt: request.receivedAt,
    triggeredAt: request.triggeredAt,
    verifiedAt: request.receivedAt ?? fallbackNow,
    metadata: { source: status === 'adapter-unavailable' ? 'unavailable-shopify-webhook-verification-adapter' : 'mock-shopify-webhook-verification-adapter' },
  };
}

export const unavailableShopifyWebhookVerificationAdapter: ShopifyWebhookVerificationAdapter = {
  async verifySignature(request) {
    return failure(request, {
      code: 'adapter-unavailable',
      message: 'Shopify webhook HMAC verification adapter is not connected; no cryptographic verification was performed.',
      retryable: true,
    }, 'adapter-unavailable');
  },
};

export const mockShopifyWebhookVerificationAdapter: ShopifyWebhookVerificationAdapter = {
  async verifySignature(request) {
    if (request.hmacHeader !== mockValidHmacHeader) {
      return failure(request, {
        code: 'signature-mismatch',
        message: 'Shopify webhook HMAC header did not match the mock adapter expectation.',
        fieldPath: 'hmacHeader',
        retryable: false,
      });
    }

    return {
      requestId: request.requestId,
      status: 'verified',
      verified: true,
      reason: null,
      failures: [],
      receivedAt: request.receivedAt,
      triggeredAt: request.triggeredAt,
      verifiedAt: request.receivedAt ?? fallbackNow,
      metadata: { source: 'mock-shopify-webhook-verification-adapter', attributes: { cryptoBoundary: 'mock', rawPayloadBytes: String(new TextEncoder().encode(request.rawBody).byteLength) } },
    };
  },
};

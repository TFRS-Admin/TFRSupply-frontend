import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const request = (overrides = {}) => ({
  requestId: 'shopify-webhook-verification-001',
  rawBody: JSON.stringify({ id: 123, status: 'paid' }),
  hmacHeader: 'mock-valid-shopify-hmac',
  secretReference: 'shopify-webhook-secret-ref',
  shopDomain: 'tfrsupply.myshopify.com',
  topic: 'orders/create',
  receivedAt: '2026-07-02T00:00:00.000Z',
  triggeredAt: '2026-07-02T00:00:00.000Z',
  ...overrides,
});

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyWebhookVerification/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyWebhookVerification/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyWebhookVerification.schema.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify webhook HMAC verification foundation', () => {
  it('validates verification request and result contracts with timestamp metadata', () => {
    const parsed = modules.schemas.shopifyWebhookVerificationRequestSchema.parse(request());
    assert.equal(parsed.topic, 'orders/create');
    assert.equal(parsed.triggeredAt, '2026-07-02T00:00:00.000Z');

    const result = modules.schemas.shopifyWebhookVerificationResultSchema.parse({
      requestId: parsed.requestId,
      status: 'verified',
      verified: true,
      reason: null,
      failures: [],
      receivedAt: parsed.receivedAt,
      triggeredAt: parsed.triggeredAt,
      verifiedAt: parsed.receivedAt,
    });
    assert.equal(result.verified, true);
  });

  it('pre-validates raw payload, HMAC header, secret reference, and timestamps before adapter delegation', async () => {
    const svc = modules.service.createShopifyWebhookVerificationService(modules.adapters.mockShopifyWebhookVerificationAdapter);
    const result = await svc.verifyWebhookSignature(request({ rawBody: '', hmacHeader: '', secretReference: '', triggeredAt: 'not-a-date' }));
    assert.equal(result.status, 'failed');
    assert.equal(result.verified, false);
    assert.deepEqual(result.failures.map((failure) => failure.code), ['missing-raw-payload', 'missing-hmac-header', 'missing-secret-reference', 'timestamp-invalid']);
  });

  it('returns deterministic verified results through the mock crypto adapter boundary', async () => {
    const svc = modules.service.createShopifyWebhookVerificationService(modules.adapters.mockShopifyWebhookVerificationAdapter);
    const result = await svc.verifyWebhookSignature(request());
    assert.equal(result.status, 'verified');
    assert.equal(result.verified, true);
    assert.equal(result.reason, null);
    assert.equal(result.metadata.attributes.cryptoBoundary, 'mock');
    assert.equal(result.metadata.attributes.verifiedBy, 'shopifyWebhookVerificationService');
  });

  it('surfaces signature mismatch as an explicit verification failure reason', async () => {
    const svc = modules.service.createShopifyWebhookVerificationService(modules.adapters.mockShopifyWebhookVerificationAdapter);
    const result = await svc.verifyWebhookSignature(request({ hmacHeader: 'ZmFrZS1zaWduYXR1cmU=' }));
    assert.equal(result.status, 'failed');
    assert.equal(result.reason, 'signature-mismatch');
    assert.equal(result.failures[0].fieldPath, 'hmacHeader');
  });

  it('returns unavailable adapter behavior without live Shopify calls or secret access', async () => {
    const svc = modules.service.createShopifyWebhookVerificationService(modules.adapters.unavailableShopifyWebhookVerificationAdapter);
    const result = await svc.verifyWebhookSignature(request());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.verified, false);
    assert.equal(result.reason, 'adapter-unavailable');
    assert.equal(result.failures[0].retryable, true);
  });
});

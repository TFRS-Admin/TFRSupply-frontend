import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const headers = (overrides = {}) => ({ topic: 'orders/create', shopDomain: 'tfrsupply.myshopify.com', webhookId: 'webhook-001', apiVersion: '2025-01', triggeredAt: '2026-07-02T00:00:00.000Z', ...overrides });
const request = (overrides = {}) => ({ requestId: 'shopify-webhook-request-001', headers: headers(overrides.headers), rawBody: JSON.stringify({ id: 12345, email: 'jane@example.com' }), receivedAt: '2026-07-02T00:00:00.000Z', ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyWebhook/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyWebhook/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyWebhook.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyWebhook/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify webhook foundation', () => {
  it('validates well-formed webhook requests and rejects unsupported topics', () => {
    const parsed = modules.schemas.shopifyWebhookRequestSchema.parse(request());
    assert.equal(parsed.headers.topic, 'orders/create');
    assert.throws(() => modules.schemas.shopifyWebhookRequestSchema.parse(request({ headers: { topic: 'not-a-real-topic' } })));
  });

  it('maps every supported topic to a domain', () => {
    assert.equal(modules.service.SHOPIFY_WEBHOOK_TOPIC_DOMAINS['orders/create'], 'orders');
    assert.equal(modules.service.SHOPIFY_WEBHOOK_TOPIC_DOMAINS['customers/delete'], 'customers');
    assert.equal(modules.service.SHOPIFY_WEBHOOK_TOPIC_DOMAINS['products/update'], 'products');
    assert.equal(modules.service.SHOPIFY_WEBHOOK_TOPIC_DOMAINS['inventory_levels/update'], 'inventory');
    assert.equal(modules.service.SHOPIFY_WEBHOOK_TOPIC_DOMAINS['metafields/update'], 'pricing');
    assert.equal(modules.service.SHOPIFY_WEBHOOK_TOPIC_DOMAINS['fulfillments/create'], 'fulfillments');
  });

  it('normalizes a webhook request into a typed event', () => {
    const event = modules.service.normalizeShopifyWebhookRequest(request());
    assert.equal(event.topic, 'orders/create');
    assert.equal(event.domain, 'orders');
    assert.equal(event.shopDomain, 'tfrsupply.myshopify.com');
    assert.equal(event.payload.email, 'jane@example.com');
    assert.equal(event.id, 'shopify-webhook-event-webhook-001');
  });

  it('throws a normalization error for malformed JSON bodies', () => {
    assert.throws(() => modules.service.normalizeShopifyWebhookRequest(request({ rawBody: '{not-json' })), modules.service.ShopifyWebhookNormalizationError);
  });

  it('returns a failed result with a malformed-payload error instead of throwing from receiveWebhook', async () => {
    const svc = modules.service.createShopifyWebhookService(modules.adapters.mockShopifyWebhookAdapter);
    const result = await svc.receiveWebhook(request({ rawBody: '{not-json' }));
    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'malformed-payload');
    assert.equal(result.event, null);
  });

  it('returns deterministic mock adapter results through receiveWebhook orchestration', async () => {
    const svc = modules.service.createShopifyWebhookService(modules.adapters.mockShopifyWebhookAdapter);
    const result = await svc.receiveWebhook(request());
    assert.equal(result.status, 'validated');
    assert.equal(result.domain, 'orders');
    assert.equal(result.event.payload.email, 'jane@example.com');
    assert.equal(result.metadata.attributes.normalizedBy, 'shopifyWebhookService');
  });

  it('returns explicit unavailable adapter behavior without live verification', async () => {
    const svc = modules.service.createShopifyWebhookService(modules.adapters.unavailableShopifyWebhookAdapter);
    const result = await svc.receiveWebhook(request());
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
  });

  it('routes a normalized event through the mock adapter', async () => {
    const svc = modules.service.createShopifyWebhookService(modules.adapters.mockShopifyWebhookAdapter);
    const event = modules.service.normalizeShopifyWebhookRequest(request());
    const result = await svc.routeWebhookEvent(event);
    assert.equal(result.status, 'routed');
    assert.equal(result.metadata.attributes.routedTo, 'orders-handler-placeholder');
    assert.equal(result.metadata.attributes.routedBy, 'shopifyWebhookService');
  });

  it('returns explicit unavailable behavior when routing has no live target', async () => {
    const svc = modules.service.createShopifyWebhookService(modules.adapters.unavailableShopifyWebhookAdapter);
    const event = modules.service.normalizeShopifyWebhookRequest(request());
    const result = await svc.routeWebhookEvent(event);
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.event.id, event.id);
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyWebhook, 'function');
    assert.equal(typeof modules.hooks.useShopifyWebhookRouting, 'function');
  });
});

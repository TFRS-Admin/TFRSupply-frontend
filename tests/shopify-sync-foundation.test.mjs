import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifySync/shopifySyncService.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifySync.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

function productRequest(overrides = {}) {
  return {
    requestId: 'sync-product-navigator',
    direction: 'push',
    dryRun: true,
    subject: { entityType: 'product', productId: 'navigator', shopifyProductId: 'gid://shopify/Product/1' },
    payload: {
      product: {
        id: 'navigator',
        label: 'Navigator Lightbar',
        title: 'Navigator Lightbar',
        handle: 'navigator-lightbar',
        cartEligible: false,
        storefrontAvailable: false,
      },
    },
    ...overrides,
  };
}

describe('shopify sync schemas', () => {
  it('validates product sync requests and retry metadata without calling Shopify', () => {
    const { shopifySyncRequestSchema } = modules.schemas;
    const parsed = shopifySyncRequestSchema.parse(productRequest({ retry: { attempt: 1, maxAttempts: 3, backoffSeconds: 30 } }));

    assert.equal(parsed.dryRun, true);
    assert.equal(parsed.subject.entityType, 'product');
    assert.equal(parsed.retry.attempt, 1);
  });

  it('rejects non-dry-run synchronization requests at the contract boundary', () => {
    const { shopifySyncRequestSchema } = modules.schemas;

    assert.throws(() => shopifySyncRequestSchema.parse(productRequest({ dryRun: false })), /Invalid literal value/);
  });
});

describe('shopifySyncService', () => {
  it('returns pending adapter-unavailable results from the default inert adapter', async () => {
    const { shopifySyncService } = modules.service;
    const result = await shopifySyncService.syncProduct(productRequest());

    assert.equal(result.status, 'pending');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.subject.productId, 'navigator');
  });

  it('validates adapter results before returning them', async () => {
    const { createShopifySyncService } = modules.service;
    const service = createShopifySyncService({
      async syncProduct(request) {
        return { requestId: request.requestId, status: 'succeeded', subject: request.subject, payload: request.payload, errors: [] };
      },
      async syncVariant(request) { return { requestId: request.requestId, status: 'succeeded', subject: request.subject, payload: request.payload, errors: [] }; },
      async syncInventory(request) { return { requestId: request.requestId, status: 'succeeded', subject: request.subject, payload: request.payload, errors: [] }; },
      async syncPricingReference(request) { return { requestId: request.requestId, status: 'succeeded', subject: request.subject, payload: request.payload, errors: [] }; },
      async getSyncStatus(request) { return { requestId: request.requestId, status: 'succeeded', subject: request.subject, payload: request.payload, errors: [] }; },
    });

    const result = await service.syncProduct(productRequest());
    assert.equal(result.status, 'succeeded');
  });
});

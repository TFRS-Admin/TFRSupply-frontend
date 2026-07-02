import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const quote = () => ({
  id: 'quote-order-001',
  label: 'Order Quote 001',
  status: 'approved',
  customerId: 'customer-1',
  customer: { customerId: 'customer-1', agencyName: 'Example PD', contactEmail: 'buyer@example.com', contactPhone: '555-0100' },
  workflow: { status: 'approved', approvalStatus: 'approved' },
  lines: [{ id: 'line-1', sku: 'NVG-SKU', productId: 'navigator', label: 'Navigator', quantity: 2, price: { amount: 100, currencyCode: 'USD', taxable: true }, subtotal: { amount: 200, currencyCode: 'USD' }, lineType: 'product' }],
  total: { amount: 200, currencyCode: 'USD' },
});
const request = (overrides = {}) => ({ requestId: 'shopify-order-request-001', quote: quote(), dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyOrder/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyOrder/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyOrder.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyOrder/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify order integration foundation', () => {
  it('validates dry-run order requests and rejects live requests', () => {
    const parsed = modules.schemas.shopifyOrderRequestSchema.parse(request());
    assert.equal(parsed.dryRun, true);
    assert.throws(() => modules.schemas.shopifyOrderRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
  });

  it('maps quotes to deterministic Shopify order payloads and metadata', () => {
    const { order, mapping } = modules.service.mapQuoteToShopifyOrder(quote(), request());
    assert.equal(order.id, 'shopify-order-draft-quote-order-001');
    assert.equal(order.lines[0].id, 'shopify-order-line-line-1');
    assert.equal(order.customer.company, 'Example PD');
    assert.equal(mapping.lineMappings[0].quoteLineId, 'line-1');
  });

  it('orchestrates validation, mapping, mock adapter delegation, and result parsing', async () => {
    const svc = modules.service.createShopifyOrderService(modules.adapters.mockShopifyOrderAdapter);
    const result = await svc.createOrder(request());
    assert.equal(result.status, 'accepted');
    assert.equal(result.syncStatus, 'dry-run');
    assert.equal(result.order.quoteId, 'quote-order-001');
    assert.equal(result.mapping.orderId, 'shopify-order-draft-quote-order-001');
  });

  it('returns explicit unavailable adapter results without live Shopify calls', async () => {
    const svc = modules.service.createShopifyOrderService(modules.adapters.unavailableShopifyOrderAdapter);
    const result = await svc.createOrder(request());
    assert.equal(result.syncStatus, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.order.quoteId, 'quote-order-001');
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyOrder, 'function');
    assert.equal(typeof modules.hooks.useShopifyOrderSync, 'function');
  });
});

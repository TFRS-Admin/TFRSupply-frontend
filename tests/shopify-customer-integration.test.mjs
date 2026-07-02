import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const quote = () => ({
  id: 'quote-customer-001',
  label: 'Customer Quote 001',
  status: 'approved',
  customerId: 'customer-1',
  customer: { customerId: 'customer-1', agencyName: 'Example Fire', contactName: 'Jordan Buyer', contactEmail: 'buyer@example.com', contactPhone: '555-0100' },
  workflow: { status: 'approved', approvalStatus: 'approved' },
  lines: [{ id: 'line-1', sku: 'NVG-SKU', productId: 'navigator', label: 'Navigator', quantity: 1, price: { amount: 100, currencyCode: 'USD' }, lineType: 'product' }],
});
const request = (overrides = {}) => ({ requestId: 'shopify-customer-request-001', quote: quote(), dryRun: true, requestedAt: '2026-07-02T00:00:00.000Z', ...overrides });

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    service: await server.ssrLoadModule('/src/services/shopifyCustomer/index.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/shopifyCustomer/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyCustomer.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyCustomer/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify customer integration foundation', () => {
  it('validates dry-run customer requests and rejects live or empty requests', () => {
    assert.equal(modules.schemas.shopifyCustomerRequestSchema.parse(request()).dryRun, true);
    assert.throws(() => modules.schemas.shopifyCustomerRequestSchema.parse(request({ dryRun: false })), /Invalid literal value/);
    assert.throws(() => modules.schemas.shopifyCustomerRequestSchema.parse({ requestId: 'missing', dryRun: true }), /requires platform customer/);
  });

  it('maps quote customer metadata to deterministic Shopify customer payloads', () => {
    const { customer, mapping } = modules.service.mapQuoteCustomerToShopifyCustomer(request());
    assert.equal(customer.id, 'shopify-customer-draft-customer-1');
    assert.equal(customer.company, 'Example Fire');
    assert.equal(customer.firstName, 'Jordan');
    assert.equal(customer.lastName, 'Buyer');
    assert.equal(mapping.platformCustomerId, 'customer-1');
    assert.equal(mapping.source, 'quote-customer');
  });

  it('orchestrates validation, mapping, mock adapter delegation, and result parsing', async () => {
    const svc = modules.service.createShopifyCustomerService(modules.adapters.mockShopifyCustomerAdapter);
    const result = await svc.createCustomer(request());
    assert.equal(result.status, 'accepted');
    assert.equal(result.syncStatus, 'dry-run');
    assert.equal(result.customer.quoteId, 'quote-customer-001');
    assert.equal(result.mapping.shopifyCustomerId, 'shopify-customer-draft-customer-1');
    assert.equal(result.metadata.source, 'shopifyCustomerService');
  });

  it('returns explicit unavailable adapter results without live Shopify calls while preserving sync metadata', async () => {
    const svc = modules.service.createShopifyCustomerService(modules.adapters.unavailableShopifyCustomerAdapter);
    const result = await svc.getCustomerSyncStatus(request());
    assert.equal(result.syncStatus, 'adapter-unavailable');
    assert.equal(result.errors[0].code, 'adapter-unavailable');
    assert.equal(result.customer.platformCustomerId, 'customer-1');
    assert.equal(result.mapping.mappedAt, '2026-07-02T00:00:00.000Z');
  });

  it('supports explicit platform customer requests and exposes typed hook entry points', () => {
    const explicit = request({ quote: undefined, customer: { customerId: 'platform-2', agencyName: 'Example EMS', contactEmail: 'ems@example.com' } });
    const { customer, mapping } = modules.service.mapQuoteCustomerToShopifyCustomer(explicit);
    assert.equal(customer.id, 'shopify-customer-draft-platform-2');
    assert.equal(mapping.source, 'platform-customer');
    assert.equal(typeof modules.hooks.useShopifyCustomer, 'function');
    assert.equal(typeof modules.hooks.useShopifyCustomerSync, 'function');
  });
});

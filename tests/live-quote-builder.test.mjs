import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/liveQuoteBuilder/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

const request = {
  draftId: 'quote-live-001',
  customer: { customerId: 'customer-1', agencyName: 'Example Police Department', contactEmail: 'buyer@example.gov' },
  verticalId: 'police',
  vehicle: {
    id: 'veh-1',
    label: '2026 Ford Police Interceptor Utility',
    make: { id: 'make-ford', label: 'Ford', slug: 'ford' },
    model: { id: 'model-piu', label: 'Police Interceptor Utility', makeId: 'make-ford', slug: 'police-interceptor-utility' },
    year: { value: 2026, label: '2026' },
  },
  lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 2, sku: 'NAV-SKU', productId: 'navigator' }],
  packages: [{ packageId: 'pkg-warning' }],
  pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1' },
};

function draft(overrides = {}) {
  return {
    id: 'quote-live-001',
    label: 'Live Quote 001',
    customer: request.customer,
    verticalId: request.verticalId,
    vehicle: request.vehicle,
    lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 2, sku: 'NAV-SKU', productId: 'navigator' }],
    packageReferences: [{ packageId: 'pkg-warning', packageName: 'Warning Package' }],
    pricingReference: { status: 'priced' },
    workflow: { status: 'assembling', approvalStatus: 'draft', reviewFlags: [] },
    ...overrides,
  };
}

const source = { id: 'source-1', label: 'Contract', sourceType: 'dealer-contract', priority: 1, currencyCode: 'USD' };
const pricing = {
  status: 'priced',
  data: {
    quoteId: 'quote-live-001',
    source,
    lines: [{ id: 'line-1', sku: 'NAV-SKU', productId: 'navigator', quantity: 2, sellingPrice: { amount: 1800, currencyCode: 'USD' } }],
    subtotal: { amount: 1800, currencyCode: 'USD' },
  },
};

function createService({ pipelineResult, validationFlags = [] }) {
  const { createLiveQuoteBuilderService } = modules.service;
  return createLiveQuoteBuilderService({
    quoteBuilder: {
      getDraft: async () => null,
      saveDraft: async (input) => input,
      assembleQuote: async () => ({ status: 'assembled', draft: draft(), reviewFlags: [] }),
      validateQuote: async () => ({ valid: validationFlags.length === 0, reviewFlags: validationFlags }),
    },
    quotePipeline: {
      assembleQuote: async () => pipelineResult,
    },
  });
}

describe('Live Quote Builder orchestration', () => {
  it('validates requests and materializes a fully priced quote for PDF handoff', async () => {
    const pipelineResult = {
      status: 'assembled',
      quote: { status: 'assembled', draft: draft(), reviewFlags: [] },
      packageReferences: [{ packageId: 'pkg-warning', packageName: 'Warning Package' }],
      pricing,
      commerceReferences: [{ sku: 'NAV-SKU', productId: 'navigator' }],
      reviewFlags: [{ code: 'fitment-reviewed', severity: 'info', message: 'Vehicle fitment checked.', source: 'unknown' }],
    };
    const result = await createService({ pipelineResult }).generateQuote(request);

    assert.equal(result.status, 'priced');
    assert.equal(result.quote.status, 'priced');
    assert.equal(result.quote.total.amount, 1800);
    assert.equal(result.quote.lines[0].price.amount, 900);
    assert.equal(result.quote.lines[0].subtotal.amount, 1800);
    assert.equal(result.packageReferences[0].packageId, 'pkg-warning');
    assert.equal(result.pdfReady, true);
    assert.equal(modules.schemas.liveQuoteBuilderResultSchema.parse(result).quote.total.amount, 1800);
  });

  it('returns an invalid typed result when dependency review flags include errors', async () => {
    const pipelineResult = {
      status: 'invalid',
      quote: { status: 'assembled', draft: draft(), reviewFlags: [] },
      packageReferences: [],
      pricing,
      commerceReferences: [],
      reviewFlags: [{ code: 'product-fitment-incompatible', severity: 'error', message: 'Not compatible.', source: 'unknown', fieldPath: 'vehicle' }],
    };
    const result = await createService({ pipelineResult }).generateQuote(request);

    assert.equal(result.status, 'invalid');
    assert.equal(result.quote.status, 'invalid');
    assert.equal(result.reviewFlags[0].code, 'product-fitment-incompatible');
  });

  it('rejects malformed live quote requests at runtime', async () => {
    const pipelineResult = {
      status: 'assembled',
      quote: { status: 'assembled', draft: draft(), reviewFlags: [] },
      packageReferences: [],
      pricing,
      commerceReferences: [],
      reviewFlags: [],
    };
    await assert.rejects(() => createService({ pipelineResult }).generateQuote({ ...request, lines: [] }), /at least 1 element/);
  });
});

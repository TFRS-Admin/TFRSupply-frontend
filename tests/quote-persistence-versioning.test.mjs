import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/quotePersistence/index.ts'),
    adapter: await server.ssrLoadModule('/src/adapters/quotePersistence/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

function quote(overrides = {}) {
  return {
    id: 'quote-persist-001',
    label: 'Persistent Quote 001',
    customerId: 'customer-1',
    customer: { customerId: 'customer-1', agencyName: 'Example Police Department', contactEmail: 'buyer@example.gov' },
    verticalId: 'police',
    status: 'priced',
    approvalStatus: 'draft',
    workflow: { status: 'ready-for-review', approvalStatus: 'draft', reviewFlags: [] },
    lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 1, sku: 'NAV-SKU', productId: 'navigator' }],
    total: { amount: 900, currencyCode: 'USD' },
    ...overrides,
  };
}

function createService() {
  const repository = modules.adapter.createInMemoryQuoteRepository();
  return modules.service.createQuotePersistenceService(repository);
}

describe('Quote persistence and optimistic versioning', () => {
  it('saves a quote with version 1 and validates the result contract', async () => {
    const service = createService();
    const result = await service.saveQuote({ quote: quote(), revision: { savedAt: '2026-07-02T00:00:00.000Z', savedBy: 'agent', source: 'test' } });

    assert.equal(result.status, 'saved');
    assert.equal(result.record.revision.version, 1);
    assert.equal(result.record.history.length, 1);
    assert.equal(modules.schemas.quoteSaveResultSchema.parse(result).record.quote.id, 'quote-persist-001');
  });

  it('loads a saved quote by ID and returns not-found for missing quotes', async () => {
    const service = createService();
    await service.saveQuote({ quote: quote(), revision: { savedAt: '2026-07-02T00:00:00.000Z' } });

    const found = await service.loadQuote('quote-persist-001');
    const missing = await service.loadQuote('missing-quote');

    assert.equal(found.status, 'found');
    assert.equal(found.record.quote.label, 'Persistent Quote 001');
    assert.equal(missing.status, 'not-found');
    assert.equal(missing.record, undefined);
  });

  it('updates a quote when the expected version matches and increments the version', async () => {
    const service = createService();
    await service.saveQuote({ quote: quote(), revision: { savedAt: '2026-07-02T00:00:00.000Z' } });

    const result = await service.updateQuote({
      quoteId: 'quote-persist-001',
      expectedVersion: 1,
      quote: quote({ status: 'submitted', total: { amount: 1200, currencyCode: 'USD' } }),
      revision: { savedAt: '2026-07-02T00:05:00.000Z', note: 'Customer added accessory.' },
    });

    assert.equal(result.status, 'updated');
    assert.equal(result.currentVersion, 2);
    assert.equal(result.record.revision.version, 2);
    assert.equal(result.record.quote.status, 'submitted');
    assert.equal(result.record.history.length, 2);
  });

  it('detects optimistic version conflicts without overwriting the current quote', async () => {
    const service = createService();
    await service.saveQuote({ quote: quote(), revision: { savedAt: '2026-07-02T00:00:00.000Z' } });
    await service.updateQuote({ quoteId: 'quote-persist-001', expectedVersion: 1, quote: quote({ status: 'submitted' }), revision: { savedAt: '2026-07-02T00:05:00.000Z' } });

    const conflict = await service.updateQuote({ quoteId: 'quote-persist-001', expectedVersion: 1, quote: quote({ status: 'cancelled' }), revision: { savedAt: '2026-07-02T00:10:00.000Z' } });

    assert.equal(conflict.status, 'conflict');
    assert.equal(conflict.expectedVersion, 1);
    assert.equal(conflict.currentVersion, 2);
    assert.equal(conflict.record.quote.status, 'submitted');
  });

  it('returns immutable quote history snapshots', async () => {
    const service = createService();
    await service.saveQuote({ quote: quote(), revision: { savedAt: '2026-07-02T00:00:00.000Z' } });
    await service.updateQuote({ quoteId: 'quote-persist-001', expectedVersion: 1, quote: quote({ label: 'Persistent Quote Revised' }), revision: { savedAt: '2026-07-02T00:05:00.000Z' } });

    const history = await service.getQuoteHistory('quote-persist-001');

    assert.equal(history.status, 'found');
    assert.deepEqual(history.history.map((snapshot) => snapshot.revision.version), [1, 2]);
    assert.deepEqual(history.history.map((snapshot) => snapshot.quote.label), ['Persistent Quote 001', 'Persistent Quote Revised']);
    assert.equal(modules.schemas.quoteHistoryResultSchema.parse(history).history.length, 2);
  });
});

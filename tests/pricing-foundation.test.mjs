import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/pricing/pricingService.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/pricing/usePricing.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/pricing.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

const context = { pricingDate: '2026-07-01', currencyCode: 'USD', dealerId: 'dealer-1' };
const subject = { sku: 'NVG-SKU', productId: 'navigator' };

function renderHookProbe(useHook, ...args) {
  function HookProbe() {
    const state = useHook(...args);
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-has-data': String(Boolean(state.data)),
      'data-has-result': String(Boolean(state.result)),
      'data-has-error': String(Boolean(state.error)),
    });
  }
  return renderToString(React.createElement(HookProbe));
}

describe('pricing foundation service', () => {
  it('returns pending pricing resolutions until live pricing is connected', async () => {
    const { pricingService } = modules.service;

    const listPrice = await pricingService.getListPrice(subject, context);
    const dealerCost = await pricingService.getDealerCost(subject, context);
    const contractPrice = await pricingService.getContractPrice(subject, context);
    const bundle = await pricingService.priceBundle({ id: 'bundle-1', label: 'Bundle 1', context, items: [{ ...subject, quantity: 2 }] });
    const quote = await pricingService.priceQuote({ quoteId: 'quote-1', context, lines: [{ ...subject, quantity: 1 }] });

    assert.equal(listPrice.status, 'pending');
    assert.equal(dealerCost.status, 'pending');
    assert.equal(contractPrice.status, 'pending');
    assert.equal(bundle.status, 'pending');
    assert.equal(quote.status, 'pending');
    assert.equal(quote.data, null);
  });

  it('validates inputs before invoking injected pricing adapters', async () => {
    const { createPricingService } = modules.service;
    const service = createPricingService({
      async getListPrice() { return { status: 'not-found', data: null }; },
      async getDealerCost() { return { status: 'not-found', data: null }; },
      async getContractPrice() { return { status: 'not-found', data: null }; },
      async priceBundle(input) { return { status: 'priced', data: { id: input.id, items: input.items } }; },
      async priceQuote() { return { status: 'pending', data: null }; },
    });

    assert.throws(() => service.priceBundle({ id: 'bad', label: 'Bad Bundle', context, items: [{ ...subject, quantity: 0 }] }), /Number must be greater than 0/);
    const result = await service.priceBundle({ id: 'bundle-2', label: 'Bundle 2', context, items: [{ ...subject, quantity: 3 }] });
    assert.equal(result.status, 'priced');
    assert.equal(result.data?.items[0].quantity, 3);
  });
});

describe('pricing schemas and hooks', () => {
  it('validates MSRP, dealer cost, contract windows, quantity breaks, and warnings', () => {
    const { contractPriceSchema } = modules.schemas;
    const source = { id: 'source-msrp', label: 'MSRP Source', sourceType: 'dealer-contract', priority: 1, currencyCode: 'USD' };

    const parsed = contractPriceSchema.parse({
      id: 'contract-line-1',
      label: 'Contract Line 1',
      sku: 'NVG-SKU',
      productId: 'navigator',
      contractId: 'contract-1',
      sellingPrice: { amount: 1000, currencyCode: 'USD' },
      listPrice: { id: 'msrp-1', label: 'MSRP 1', sku: 'NVG-SKU', price: { amount: 1200, currencyCode: 'USD' }, source },
      dealerCost: { id: 'cost-1', label: 'Cost 1', sku: 'NVG-SKU', cost: { amount: 800, currencyCode: 'USD' }, source: { ...source, id: 'source-cost', label: 'Cost Source', sourceType: 'dealer-cost' } },
      quantityBreaks: [{ id: 'qty-1', label: 'Quantity Break 1', minQuantity: 5, unitPrice: { amount: 950, currencyCode: 'USD' }, discountPercent: 5 }],
      window: { id: 'window-1', label: 'Contract Window 1', startsAt: '2026-01-01', endsAt: '2026-12-31', expirationAlertDays: 30 },
    });

    assert.equal(parsed.quantityBreaks?.[0].minQuantity, 5);
    assert.equal(parsed.window?.expirationAlertDays, 30);
  });

  it('exposes typed pricing hooks without requiring live pricing data', () => {
    const { useListPrice, useDealerCost, useContractPrice, useBundlePricing, useQuotePricing } = modules.hooks;

    assert.match(renderHookProbe(useListPrice, null, context), /data-loading="false"/);
    assert.match(renderHookProbe(useDealerCost, subject, null), /data-has-data="false"/);
    assert.match(renderHookProbe(useContractPrice, null, null), /data-has-result="false"/);
    assert.match(renderHookProbe(useBundlePricing, null), /data-has-error="false"/);
    assert.match(renderHookProbe(useQuotePricing, null), /data-loading="false"/);
  });
});

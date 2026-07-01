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
    domain: await server.ssrLoadModule('/src/domain/dealerContractResolution/index.ts'),
    service: await server.ssrLoadModule('/src/services/dealerContractResolution/dealerContractResolutionService.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/dealerContractResolution/useDealerContractResolution.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/dealerContractResolution.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

const context = { pricingDate: '2026-07-01', currencyCode: 'USD', dealerId: 'dealer-1' };
const subject = { sku: 'NVG-SKU', productId: 'navigator' };

const lowPrioritySource = { id: 'source-low', label: 'Contract A Source', sourceType: 'dealer-contract', priority: 3, currencyCode: 'USD' };
const highPrioritySource = { id: 'source-high', label: 'Contract B Source', sourceType: 'dealer-contract', priority: 8, currencyCode: 'USD' };

const contractA = {
  id: 'contract-a',
  label: 'Contract A',
  dealerId: 'dealer-1',
  source: lowPrioritySource,
  window: { id: 'window-a', label: 'Window A', startsAt: '2026-01-01', endsAt: '2026-12-31' },
  prices: [
    {
      id: 'price-a',
      label: 'Price A',
      sku: 'NVG-SKU',
      productId: 'navigator',
      contractId: 'contract-a',
      sellingPrice: { amount: 900, currencyCode: 'USD' },
      quantityBreaks: [
        { id: 'qb-1', label: 'QB1', minQuantity: 5, unitPrice: { amount: 850, currencyCode: 'USD' } },
        { id: 'qb-2', label: 'QB2', minQuantity: 10, unitPrice: { amount: 800, currencyCode: 'USD' } },
      ],
    },
  ],
};

const contractB = {
  id: 'contract-b',
  label: 'Contract B',
  dealerId: 'dealer-1',
  source: highPrioritySource,
  window: { id: 'window-b', label: 'Window B', startsAt: '2026-01-01', endsAt: '2026-12-31' },
  prices: [
    {
      id: 'price-b',
      label: 'Price B',
      sku: 'NVG-SKU',
      productId: 'navigator',
      contractId: 'contract-b',
      sellingPrice: { amount: 875, currencyCode: 'USD' },
    },
  ],
};

const expiredContract = {
  id: 'contract-expired',
  label: 'Expired Contract',
  dealerId: 'dealer-1',
  source: lowPrioritySource,
  window: { id: 'window-expired', label: 'Expired Window', startsAt: '2024-01-01', endsAt: '2024-12-31' },
  prices: [
    { id: 'price-expired', label: 'Price Expired', sku: 'NVG-SKU', contractId: 'contract-expired', sellingPrice: { amount: 700, currencyCode: 'USD' } },
  ],
};

const bundle = {
  id: 'bundle-1',
  label: 'Summer Bundle',
  items: [{ sku: 'NVG-SKU', quantity: 1 }],
  promotionCode: 'SUMMER26',
  window: { id: 'window-bundle', label: 'Bundle Window', startsAt: '2026-01-01', endsAt: '2026-12-31' },
};

function renderHookProbe(useHook, ...args) {
  function HookProbe() {
    const state = useHook(...args);
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-has-result': String(Boolean(state.result)),
      'data-has-error': String(Boolean(state.error)),
    });
  }
  return renderToString(React.createElement(HookProbe));
}

describe('contract window evaluation', () => {
  it('classifies active, upcoming, expired, and expiring-soon windows', () => {
    const { evaluateContractWindow } = modules.domain;

    const active = evaluateContractWindow({ id: 'w1', label: 'W1', startsAt: '2026-01-01', endsAt: '2026-12-31' }, '2026-06-01');
    assert.equal(active.status, 'active');

    const upcoming = evaluateContractWindow({ id: 'w2', label: 'W2', startsAt: '2027-01-01', endsAt: '2027-12-31' }, '2026-06-01');
    assert.equal(upcoming.status, 'upcoming');
    assert.ok(upcoming.daysUntilStart > 0);

    const expired = evaluateContractWindow({ id: 'w3', label: 'W3', startsAt: '2024-01-01', endsAt: '2024-12-31' }, '2026-06-01');
    assert.equal(expired.status, 'expired');

    const expiringSoon = evaluateContractWindow(
      { id: 'w4', label: 'W4', startsAt: '2026-01-01', endsAt: '2026-07-10', expirationAlertDays: 30 },
      '2026-07-01',
    );
    assert.equal(expiringSoon.status, 'expiring-soon');
    assert.equal(expiringSoon.daysUntilExpiration, 9);
  });
});

describe('quantity break selection', () => {
  it('selects the highest eligible quantity break for a requested quantity', () => {
    const { selectQuantityBreak } = modules.domain;
    const breaks = [
      { id: 'qb-1', label: 'QB1', minQuantity: 5, unitPrice: { amount: 850, currencyCode: 'USD' } },
      { id: 'qb-2', label: 'QB2', minQuantity: 10, unitPrice: { amount: 800, currencyCode: 'USD' } },
    ];

    const belowThreshold = selectQuantityBreak(breaks, 3);
    assert.equal(belowThreshold.applied, null);
    assert.equal(belowThreshold.eligibleBreaks.length, 0);

    const midThreshold = selectQuantityBreak(breaks, 7);
    assert.equal(midThreshold.applied?.id, 'qb-1');

    const topThreshold = selectQuantityBreak(breaks, 12);
    assert.equal(topThreshold.applied?.id, 'qb-2');
  });
});

describe('promotional bundle resolution', () => {
  it('resolves an active bundle matching the promotion code and SKU', () => {
    const { resolvePromotionalBundle } = modules.domain;
    const resolved = resolvePromotionalBundle([bundle], subject, { ...context, promotionCodes: ['SUMMER26'] });
    assert.equal(resolved.status, 'resolved');
    assert.equal(resolved.bundle?.id, 'bundle-1');
  });

  it('returns not-eligible when the promotion code is missing', () => {
    const { resolvePromotionalBundle } = modules.domain;
    const result = resolvePromotionalBundle([bundle], subject, context);
    assert.equal(result.status, 'not-eligible');
    assert.equal(result.bundle, null);
  });

  it('returns no-match when no bundle includes the requested SKU', () => {
    const { resolvePromotionalBundle } = modules.domain;
    const result = resolvePromotionalBundle([bundle], { sku: 'OTHER-SKU' }, { ...context, promotionCodes: ['SUMMER26'] });
    assert.equal(result.status, 'no-match');
  });

  it('returns expired when the bundle window has passed', () => {
    const { resolvePromotionalBundle } = modules.domain;
    const expiredBundle = { ...bundle, window: { id: 'window-expired-bundle', label: 'Expired', startsAt: '2024-01-01', endsAt: '2024-12-31' } };
    const result = resolvePromotionalBundle([expiredBundle], subject, { ...context, promotionCodes: ['SUMMER26'] });
    assert.equal(result.status, 'expired');
  });
});

describe('dealer contract selection', () => {
  it('selects the highest-priority active contract price for a SKU', () => {
    const { selectDealerContract } = modules.domain;
    const selection = selectDealerContract([contractA, contractB], subject, context);
    assert.equal(selection.contract?.id, 'contract-b');
    assert.equal(selection.contractPrice?.sellingPrice.amount, 875);
  });

  it('excludes expired contracts from selection', () => {
    const { selectDealerContract } = modules.domain;
    const selection = selectDealerContract([expiredContract], subject, context);
    assert.equal(selection.contract, null);
    assert.equal(selection.contractPrice, null);
  });
});

describe('dealer contract resolution service', () => {
  it('resolves the applicable contract, quantity break, and bundle for a pricing request', async () => {
    const { dealerContractResolutionService } = modules.service;
    const result = await dealerContractResolutionService.resolve({
      ...subject,
      quantity: 12,
      context: { ...context, promotionCodes: ['SUMMER26'] },
      candidateContracts: [contractA, contractB],
      candidateBundles: [bundle],
    });

    assert.equal(result.status, 'resolved');
    assert.equal(result.contractSelection.contract?.id, 'contract-b');
    assert.equal(result.bundleResolution?.bundle?.id, 'bundle-1');
    assert.equal(result.quantityBreakSelection.applied, null);
  });

  it('returns no-match with a warning when no contract price is found', async () => {
    const { dealerContractResolutionService } = modules.service;
    const result = await dealerContractResolutionService.resolve({
      sku: 'UNKNOWN-SKU',
      quantity: 1,
      context,
      candidateContracts: [contractA, contractB],
    });

    assert.equal(result.status, 'no-match');
    assert.equal(result.contractSelection.contract, null);
    assert.ok(result.warnings.some((warning) => warning.code === 'dealer-contract-resolution.no-contract-match'));
  });

  it('does not perform pricing arithmetic on the resolved contract price', async () => {
    const { dealerContractResolutionService } = modules.service;
    const result = await dealerContractResolutionService.resolve({
      ...subject,
      quantity: 7,
      context,
      candidateContracts: [contractA],
    });

    assert.equal(result.contractSelection.contractPrice?.sellingPrice.amount, 900);
    assert.equal(result.quantityBreakSelection.applied?.unitPrice.amount, 850);
    assert.equal(typeof result.quantityBreakSelection.applied?.discountPercent, 'undefined');
  });
});

describe('dealer contract resolution schemas', () => {
  it('validates requests and rejects invalid quantities', () => {
    const { dealerContractResolutionRequestSchema } = modules.schemas;
    assert.throws(() => dealerContractResolutionRequestSchema.parse({ sku: 'NVG-SKU', quantity: 0, context }));
    const parsed = dealerContractResolutionRequestSchema.parse({ sku: 'NVG-SKU', quantity: 2, context });
    assert.equal(parsed.quantity, 2);
  });

  it('validates resolution results', () => {
    const { dealerContractResolutionResultSchema } = modules.schemas;
    const parsed = dealerContractResolutionResultSchema.parse({
      status: 'no-match',
      sku: 'NVG-SKU',
      quantity: 1,
      contractSelection: { contract: null, contractPrice: null },
      quantityBreakSelection: { quantity: 1, applied: null, eligibleBreaks: [] },
      bundleResolution: null,
      warnings: [],
    });
    assert.equal(parsed.status, 'no-match');
  });
});

describe('dealer contract resolution hook', () => {
  it('exposes typed resolution state without requiring a request', () => {
    const { useDealerContractResolution } = modules.hooks;
    assert.match(renderHookProbe(useDealerContractResolution, null), /data-loading="false"/);
    assert.match(renderHookProbe(useDealerContractResolution, undefined), /data-has-result="false"/);
  });
});

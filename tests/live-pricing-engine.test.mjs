import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/pricing/pricingService.ts'),
    adapter: await server.ssrLoadModule('/src/adapters/pricing/livePricingAdapter.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/pricing.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

const source = { id: 'src-1', label: 'Price Book', sourceType: 'federal-signal-msrp', priority: 1, currencyCode: 'USD' };
const contractSource = { id: 'contract-source-1', label: 'Dealer Contract', sourceType: 'dealer-contract', priority: 10, currencyCode: 'USD' };
const context = { pricingDate: '2026-07-01', currencyCode: 'USD', dealerId: 'dealer-1', promotionCodes: ['PROMO10'] };
const listPrice = { id: 'list-1', label: 'List NVG', sku: 'NVG-SKU', productId: 'navigator', price: { amount: 1200, currencyCode: 'USD' }, source };
const dealerCost = { id: 'cost-1', label: 'Cost NVG', sku: 'NVG-SKU', productId: 'navigator', cost: { amount: 700, currencyCode: 'USD' }, source: { ...source, id: 'cost-source', label: 'Cost Book', sourceType: 'dealer-cost' } };
const contractPrice = {
  id: 'contract-price-1',
  label: 'Contract NVG',
  sku: 'NVG-SKU',
  productId: 'navigator',
  contractId: 'contract-1',
  sellingPrice: { amount: 1000, currencyCode: 'USD' },
  listPrice,
  dealerCost,
  quantityBreaks: [
    { id: 'qb-1', label: '5+', minQuantity: 5, unitPrice: { amount: 950, currencyCode: 'USD' }, discountPercent: 5 },
    { id: 'qb-2', label: '10+', minQuantity: 10, unitPrice: { amount: 900, currencyCode: 'USD' }, discountPercent: 10 },
  ],
};
const dealerContract = {
  id: 'contract-1',
  label: 'Dealer Contract 1',
  dealerId: 'dealer-1',
  source: contractSource,
  window: { id: 'window-1', label: '2026 Contract Window', startsAt: '2026-01-01', endsAt: '2026-12-31', expirationAlertDays: 30 },
  prices: [contractPrice],
};
const promotionalBundle = {
  id: 'bundle-1',
  label: 'Promo Bundle',
  promotionCode: 'PROMO10',
  items: [{ sku: 'NVG-SKU', productId: 'navigator', quantity: 2, listPrice, dealerCost, contractPrice }],
  sellingPrice: { amount: 1800, currencyCode: 'USD' },
  dealerCost: { amount: 1400, currencyCode: 'USD' },
  source: { ...contractSource, id: 'promo-source', label: 'Promo Source', sourceType: 'promotional-bundle' },
  window: { id: 'promo-window', label: 'Promo Window', startsAt: '2026-06-01', endsAt: '2026-07-31' },
};

function createService() {
  const { createPricingService } = modules.service;
  const { createLivePricingAdapter } = modules.adapter;
  return createPricingService(createLivePricingAdapter({ listPrices: [listPrice], dealerCosts: [dealerCost], dealerContracts: [dealerContract], promotionalBundles: [promotionalBundle] }));
}

describe('live pricing engine', () => {
  it('calculates MSRP/list price, dealer cost, and contract selling price from typed records', async () => {
    const service = createService();
    assert.equal((await service.getListPrice({ sku: 'NVG-SKU', productId: 'navigator' }, context)).data.price.amount, 1200);
    assert.equal((await service.getDealerCost({ sku: 'NVG-SKU', productId: 'navigator' }, context)).data.cost.amount, 700);
    assert.equal((await service.getContractPrice({ sku: 'NVG-SKU', productId: 'navigator' }, context)).data.sellingPrice.amount, 1000);
  });

  it('selects the best quantity break and calculates quote line pricing, subtotal, gross profit, and margin', async () => {
    const service = createService();
    const result = await service.priceQuote({ quoteId: 'quote-029', context, lines: [{ sku: 'NVG-SKU', productId: 'navigator', quantity: 10 }] });

    assert.equal(result.status, 'priced');
    assert.equal(result.data.lines[0].appliedQuantityBreak.id, 'qb-2');
    assert.equal(result.data.lines[0].sellingPrice.amount, 9000);
    assert.equal(result.data.subtotal.amount, 9000);
    assert.equal(result.data.margin.grossProfit.amount, 2000);
    assert.equal(result.data.margin.grossMarginPercent, 22.22);
  });

  it('prices promotional bundles and validates quote pricing results at runtime', async () => {
    const service = createService();
    const bundle = await service.priceBundle({ id: 'bundle-input-1', label: 'Bundle Input', promotionCode: 'PROMO10', context, items: [{ sku: 'NVG-SKU', productId: 'navigator', quantity: 2 }] });
    assert.equal(bundle.status, 'priced');
    assert.equal(bundle.data.sellingPrice.amount, 1800);
    assert.equal(bundle.data.margin.grossProfit.amount, 400);

    const quote = await service.priceQuote({ quoteId: 'quote-validation', context, lines: [{ sku: 'NVG-SKU', productId: 'navigator', quantity: 1, requestedUnitPrice: { amount: 1100, currencyCode: 'USD' } }] });
    const parsed = modules.schemas.quotePricingResultSchema.parse(quote.data);
    assert.equal(parsed.lines[0].sellingPrice.amount, 1100);
  });
});

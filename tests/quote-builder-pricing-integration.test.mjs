import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;
let scenarios;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    workspace: await server.ssrLoadModule('/src/services/quoteBuilderWorkspace/index.ts'),
    fixtures: await server.ssrLoadModule('/src/adapters/quoteBuilderWorkspace/index.ts'),
    pricingService: await server.ssrLoadModule('/src/services/pricing/index.ts'),
    livePricingAdapter: await server.ssrLoadModule('/src/adapters/pricing/livePricingAdapter.ts'),
    quoteSchema: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
  };
  const results = await modules.workspace.quoteBuilderWorkspaceService.loadScenarios();
  scenarios = Object.fromEntries(results.map((entry) => [entry.id, entry]));
});

after(async () => {
  await server?.close();
});

function findLine(quote, sku) {
  return quote.lines.find((line) => line.sku === sku);
}

describe('Quote Builder / Live Pricing Engine integration', () => {
  it('prices a single-line quote using the resolved dealer contract price', () => {
    const { result } = scenarios['single-line'];
    modules.quoteSchema.liveQuoteBuilderResultSchema.parse(result);

    const line = findLine(result.quote, 'NAV-SKU');
    assert.equal(line.quantity, 3);
    assert.equal(line.listPrice.amount, 1200);
    assert.equal(line.dealerCost.amount, 700);
    assert.equal(line.price.amount, 1000);
    assert.equal(line.subtotal.amount, 3000);
    assert.equal(line.margin.grossProfit.amount, 900);
    assert.equal(line.margin.grossMarginPercent, 30);
    assert.equal(line.appliedQuantityBreak, undefined);

    assert.equal(result.pricingSummary.status, 'valid');
    assert.equal(result.pricingSummary.subtotal.amount, 3000);
    assert.equal(result.pricingSummary.totalQuantity, 3);
  });

  it('prices a multi-line quote mixing contract pricing and MSRP fallback', () => {
    const { result } = scenarios['multi-line'];
    modules.quoteSchema.liveQuoteBuilderResultSchema.parse(result);

    assert.equal(result.quote.lines.length, 3);
    assert.equal(findLine(result.quote, 'NAV-SKU').subtotal.amount, 2000);
    assert.equal(findLine(result.quote, 'SIREN-SKU').subtotal.amount, 2250);
    assert.equal(findLine(result.quote, 'MOUNT-SKU').subtotal.amount, 150);

    assert.equal(result.pricingSummary.subtotal.amount, 4400);
    assert.equal(result.pricingSummary.totalCost.amount, 2780);
    assert.equal(result.pricingSummary.grossProfit.amount, 1620);
    assert.equal(result.pricingSummary.totalQuantity, 8);
    assert.equal(result.pricingSummary.lineCount, 3);
  });

  it('selects the highest eligible quantity break once the order quantity crosses it', () => {
    const { result } = scenarios['quantity-break'];
    const line = findLine(result.quote, 'NAV-SKU');

    assert.equal(line.quantity, 12);
    assert.equal(line.appliedQuantityBreak.id, 'qb-nav-10');
    assert.equal(line.price.amount, 900);
    assert.equal(line.subtotal.amount, 10800);
    assert.equal(result.pricingSummary.subtotal.amount, 10800);
  });

  it('applies promotional bundle pricing to an eligible quote line', () => {
    const { result } = scenarios['promotional-bundle'];
    const line = findLine(result.quote, 'MOUNT-SKU');

    assert.equal(line.price.amount, 110);
    assert.equal(line.dealerCost.amount, 70);
    assert.equal(line.subtotal.amount, 220);
    assert.equal(line.margin.grossProfit.amount, 80);
    assert.equal(result.pricingSummary.subtotal.amount, 220);
  });

  it('applies promotional bundle pricing directly through pricingService.priceQuote (not just priceBundle)', async () => {
    const { createPricingService } = modules.pricingService;
    const { createLivePricingAdapter } = modules.livePricingAdapter;
    const { listPrices, dealerCosts, dealerContracts, promotionalBundles } = modules.fixtures;

    const service = createPricingService(createLivePricingAdapter({ listPrices, dealerCosts, dealerContracts, promotionalBundles }));
    const result = await service.priceQuote({
      quoteId: 'direct-bundle-check',
      context: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1', promotionCodes: ['SPRING25'] },
      lines: [{ sku: 'MOUNT-SKU', quantity: 2 }],
    });

    assert.equal(result.status, 'priced');
    assert.equal(result.data.lines[0].sellingPrice.amount, 220);
    assert.equal(result.data.lines[0].contractPrice.contractId, 'bundle-mount-promo');
  });

  it('prices a mixed-contract quote where one line matches its contract and another falls back to MSRP', () => {
    const { result } = scenarios['mixed-contract'];

    const navLine = findLine(result.quote, 'NAV-SKU');
    const sirenLine = findLine(result.quote, 'SIREN-SKU');

    assert.equal(navLine.price.amount, 1000, 'NAV-SKU should use the dealer-1 contract price');
    assert.equal(sirenLine.price.amount, 450, 'SIREN-SKU should fall back to MSRP since its contract is dealer-2 only');

    assert.equal(result.pricingSummary.subtotal.amount, 5350);
    assert.equal(result.pricingSummary.totalCost.amount, 3580);
    assert.equal(result.pricingSummary.grossProfit.amount, 1770);
    assert.equal(result.pricingSummary.grossMarginPercent, 33.08);
    assert.equal(result.pricingSummary.status, 'warning');
  });

  it('calculates margin percent and quote totals consistently across scenarios', () => {
    const singleLine = scenarios['single-line'].result;
    assert.equal(singleLine.pricingSummary.grossMarginPercent, 30);

    const quantityBreak = scenarios['quantity-break'].result;
    assert.equal(quantityBreak.pricingSummary.totalCost.amount, 8400);
    assert.equal(quantityBreak.pricingSummary.grossProfit.amount, 2400);
    assert.equal(quantityBreak.pricingSummary.grossMarginPercent, 22.22);
  });

  it('flags a quote line as invalid when no list price, dealer cost, or contract match exists', () => {
    const { result } = scenarios['invalid-pricing'];
    const line = findLine(result.quote, 'UNKNOWN-SKU');

    assert.equal(line.listPrice, undefined);
    assert.equal(line.dealerCost, undefined);
    assert.equal(line.subtotal.amount, 0);
    assert.equal(result.pricingSummary.status, 'invalid');
    assert.equal(result.status, 'priced', 'pipeline still assembles the quote; pricing status carries the invalid signal');
  });
});

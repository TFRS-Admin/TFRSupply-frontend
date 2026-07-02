import type { DealerContract, DealerCost, ListPrice, LiveQuoteBuilderRequest, PromotionalBundle } from '@/types';

/**
 * Deterministic in-memory pricing records for the Quote Builder workspace demo.
 * No file uploads, network calls, or persistence occur here — this is fixture
 * data for exercising liveQuoteBuilderService against the live pricing adapter.
 */

const msrpSource = { id: 'src-msrp', label: 'Federal Signal MSRP Book', sourceType: 'federal-signal-msrp' as const, priority: 1, currencyCode: 'USD' };
const costSource = { id: 'src-dealer-cost', label: 'Dealer Cost Book', sourceType: 'dealer-cost' as const, priority: 1, currencyCode: 'USD' };
const dealerOneSource = { id: 'src-dealer-1', label: 'Dealer Contract — Metro Fleet', sourceType: 'dealer-contract' as const, priority: 10, currencyCode: 'USD' };
const dealerTwoSource = { id: 'src-dealer-2', label: 'Dealer Contract — Statewide Fleet', sourceType: 'dealer-contract' as const, priority: 10, currencyCode: 'USD' };
const bundleSource = { id: 'src-bundle-spring25', label: 'Spring Mounting Promotion', sourceType: 'promotional-bundle' as const, priority: 20, currencyCode: 'USD' };

export const navigatorListPrice: ListPrice = { id: 'list-nav', label: 'Navigator Lightbar MSRP', sku: 'NAV-SKU', price: { amount: 1200, currencyCode: 'USD' }, source: msrpSource };
export const navigatorDealerCost: DealerCost = { id: 'cost-nav', label: 'Navigator Lightbar Dealer Cost', sku: 'NAV-SKU', cost: { amount: 700, currencyCode: 'USD' }, source: costSource };

export const sirenListPrice: ListPrice = { id: 'list-siren', label: 'Siren Speaker MSRP', sku: 'SIREN-SKU', price: { amount: 450, currencyCode: 'USD' }, source: msrpSource };
export const sirenDealerCost: DealerCost = { id: 'cost-siren', label: 'Siren Speaker Dealer Cost', sku: 'SIREN-SKU', cost: { amount: 260, currencyCode: 'USD' }, source: costSource };

export const mountListPrice: ListPrice = { id: 'list-mount', label: 'Mounting Bracket MSRP', sku: 'MOUNT-SKU', price: { amount: 150, currencyCode: 'USD' }, source: msrpSource };
export const mountDealerCost: DealerCost = { id: 'cost-mount', label: 'Mounting Bracket Dealer Cost', sku: 'MOUNT-SKU', cost: { amount: 80, currencyCode: 'USD' }, source: costSource };

export const listPrices: ListPrice[] = [navigatorListPrice, sirenListPrice, mountListPrice];
export const dealerCosts: DealerCost[] = [navigatorDealerCost, sirenDealerCost, mountDealerCost];

const contractWindow = { id: 'window-2026', label: '2026 Contract Window', startsAt: '2026-01-01', endsAt: '2026-12-31', expirationAlertDays: 30 };

export const dealerOneContract: DealerContract = {
  id: 'contract-dealer-1',
  label: 'Metro Fleet Dealer Contract',
  dealerId: 'dealer-1',
  source: dealerOneSource,
  window: contractWindow,
  prices: [{
    id: 'contract-price-nav',
    label: 'Navigator Lightbar — Metro Fleet Contract',
    sku: 'NAV-SKU',
    contractId: 'contract-dealer-1',
    sellingPrice: { amount: 1000, currencyCode: 'USD' },
    listPrice: navigatorListPrice,
    dealerCost: navigatorDealerCost,
    quantityBreaks: [
      { id: 'qb-nav-5', label: '5+ units', minQuantity: 5, unitPrice: { amount: 950, currencyCode: 'USD' }, discountPercent: 5 },
      { id: 'qb-nav-10', label: '10+ units', minQuantity: 10, unitPrice: { amount: 900, currencyCode: 'USD' }, discountPercent: 10 },
    ],
  }],
};

export const dealerTwoContract: DealerContract = {
  id: 'contract-dealer-2',
  label: 'Statewide Fleet Dealer Contract',
  dealerId: 'dealer-2',
  source: dealerTwoSource,
  window: contractWindow,
  prices: [{
    id: 'contract-price-siren',
    label: 'Siren Speaker — Statewide Fleet Contract',
    sku: 'SIREN-SKU',
    contractId: 'contract-dealer-2',
    sellingPrice: { amount: 400, currencyCode: 'USD' },
    listPrice: sirenListPrice,
    dealerCost: sirenDealerCost,
  }],
};

export const dealerContracts: DealerContract[] = [dealerOneContract, dealerTwoContract];

export const springMountingBundle: PromotionalBundle = {
  id: 'bundle-mount-promo',
  label: 'Spring Mounting Bracket Promotion',
  promotionCode: 'SPRING25',
  items: [{ sku: 'MOUNT-SKU', quantity: 2, listPrice: mountListPrice, dealerCost: mountDealerCost }],
  sellingPrice: { amount: 220, currencyCode: 'USD' },
  dealerCost: { amount: 140, currencyCode: 'USD' },
  source: bundleSource,
  window: { id: 'window-spring25', label: 'Spring 2026 Promotion', startsAt: '2026-01-01', endsAt: '2026-12-31' },
};

export const promotionalBundles: PromotionalBundle[] = [springMountingBundle];

export interface QuoteBuilderWorkspaceScenarioDefinition {
  id: string;
  label: string;
  description: string;
  request: LiveQuoteBuilderRequest;
}

const customer = { customerId: 'customer-metro-pd', agencyName: 'Metro Police Department', contactEmail: 'fleet@metropd.example.gov' };

export const quoteBuilderWorkspaceScenarios: QuoteBuilderWorkspaceScenarioDefinition[] = [
  {
    id: 'single-line',
    label: 'Single Line Quote',
    description: 'One contract-priced line below any quantity break.',
    request: {
      draftId: 'quote-workspace-single-line',
      customer,
      verticalId: 'police',
      lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 3, sku: 'NAV-SKU' }],
      pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1' },
    },
  },
  {
    id: 'multi-line',
    label: 'Multi-Line Quote',
    description: 'Several lines mixing contract pricing and MSRP fallback.',
    request: {
      draftId: 'quote-workspace-multi-line',
      customer,
      verticalId: 'police',
      lines: [
        { id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 2, sku: 'NAV-SKU' },
        { id: 'line-2', lineType: 'product', label: 'Siren Speaker', quantity: 5, sku: 'SIREN-SKU' },
        { id: 'line-3', lineType: 'product', label: 'Mounting Bracket', quantity: 1, sku: 'MOUNT-SKU' },
      ],
      pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1' },
    },
  },
  {
    id: 'quantity-break',
    label: 'Quantity Break Pricing',
    description: 'Order quantity crosses the 10-unit contract break.',
    request: {
      draftId: 'quote-workspace-quantity-break',
      customer,
      verticalId: 'police',
      lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 12, sku: 'NAV-SKU' }],
      pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1' },
    },
  },
  {
    id: 'promotional-bundle',
    label: 'Promotional Bundle Pricing',
    description: 'Mounting brackets priced under an active SPRING25 promotion.',
    request: {
      draftId: 'quote-workspace-promotional-bundle',
      customer,
      verticalId: 'police',
      lines: [{ id: 'line-1', lineType: 'product', label: 'Mounting Bracket', quantity: 2, sku: 'MOUNT-SKU' }],
      pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1', promotionCodes: ['SPRING25'] },
    },
  },
  {
    id: 'mixed-contract',
    label: 'Mixed Contract Scenario',
    description: 'One line matches the active dealer contract, another falls back to MSRP.',
    request: {
      draftId: 'quote-workspace-mixed-contract',
      customer,
      verticalId: 'police',
      lines: [
        { id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 4, sku: 'NAV-SKU' },
        { id: 'line-2', lineType: 'product', label: 'Siren Speaker', quantity: 3, sku: 'SIREN-SKU' },
      ],
      pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-1' },
    },
  },
  {
    id: 'invalid-pricing',
    label: 'Invalid Pricing Scenario',
    description: 'Requested SKU has no list price, dealer cost, or contract match.',
    request: {
      draftId: 'quote-workspace-invalid-pricing',
      customer,
      verticalId: 'police',
      lines: [{ id: 'line-1', lineType: 'product', label: 'Unlisted Accessory', quantity: 2, sku: 'UNKNOWN-SKU' }],
      pricingContext: { pricingDate: '2026-07-02', currencyCode: 'USD', dealerId: 'dealer-9' },
    },
  },
];

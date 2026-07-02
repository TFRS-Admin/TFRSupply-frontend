import type { ShopifyPricingSyncRequest, ShopifyPricingSyncResult } from '@/types/shopifyPricing';

export interface ShopifyPricingAdapter {
  syncPricing(request: ShopifyPricingSyncRequest): Promise<ShopifyPricingSyncResult>;
  getPricingSyncStatus(request: ShopifyPricingSyncRequest): Promise<ShopifyPricingSyncResult>;
}

function unavailableResult(request: ShopifyPricingSyncRequest): ShopifyPricingSyncResult {
  return { requestId: request.requestId, status: 'adapter-unavailable', items: [], mappings: [], errors: [{ code: 'adapter-unavailable', message: 'Shopify pricing adapter is not connected; no live Shopify call was made.', retryable: true }], syncedAt: request.requestedAt, metadata: { source: 'unavailable-shopify-pricing-adapter' } };
}

export const unavailableShopifyPricingAdapter: ShopifyPricingAdapter = {
  async syncPricing(request) { return unavailableResult(request); },
  async getPricingSyncStatus(request) { return unavailableResult(request); },
};

export const mockShopifyPricingAdapter: ShopifyPricingAdapter = {
  async syncPricing(request) { return { requestId: request.requestId, status: 'dry-run', items: [], mappings: [], errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-pricing-adapter' } }; },
  async getPricingSyncStatus(request) { return { requestId: request.requestId, status: 'validated', items: [], mappings: [], errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-pricing-adapter' } }; },
};

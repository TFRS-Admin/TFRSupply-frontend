import type { ShopifyStorefrontAvailability, ShopifyStorefrontResponse } from '@/types';
import type { ShopifyStorefrontAdapter } from './shopifyStorefrontAdapter';

/**
 * Deterministic in-memory adapter for tests and local development, matching
 * the mockShopifyCustomerAdapter / mockShopifyOrderAdapter pattern. It
 * performs no I/O and calls no Storefront API — every operation resolves as
 * a successful dry run with an empty data payload.
 */
export const mockShopifyStorefrontAdapter: ShopifyStorefrontAdapter = {
  async execute(request): Promise<ShopifyStorefrontResponse> {
    return {
      requestId: request.requestId,
      status: 'dry-run',
      operationType: request.operation.operationType,
      data: {},
      errors: [],
      respondedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z',
      metadata: { source: 'mock-shopify-storefront-adapter' },
    };
  },
  async getAvailability(config): Promise<ShopifyStorefrontAvailability> {
    return {
      available: true,
      configured: Boolean(config?.storeDomain),
      adapterMode: 'mock',
      reason: 'Mock Shopify Storefront adapter reports dry-run availability only.',
      metadata: { source: 'mock-shopify-storefront-adapter' },
    };
  },
};

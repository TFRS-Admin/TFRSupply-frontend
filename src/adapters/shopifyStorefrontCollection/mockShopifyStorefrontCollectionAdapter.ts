import type { ShopifyStorefrontCollectionResult } from '@/types';
import type { ShopifyStorefrontCollectionAdapter } from './shopifyStorefrontCollectionAdapter';

/**
 * Deterministic in-memory adapter, matching the
 * mockShopifyStorefrontProductAdapter pattern. It performs no I/O and calls
 * no Storefront API — every request resolves as a successful dry run,
 * passing the already-computed mapping and preview through unchanged.
 */
export const mockShopifyStorefrontCollectionAdapter: ShopifyStorefrontCollectionAdapter = {
  async execute(input): Promise<ShopifyStorefrontCollectionResult> {
    return {
      requestId: input.requestId,
      status: 'dry-run',
      categoryId: input.categoryId,
      mapping: input.mapping,
      preview: input.preview,
      errors: [],
      respondedAt: '2026-07-03T00:00:00.000Z',
      metadata: { source: 'mock-shopify-storefront-collection-adapter' },
    };
  },
};

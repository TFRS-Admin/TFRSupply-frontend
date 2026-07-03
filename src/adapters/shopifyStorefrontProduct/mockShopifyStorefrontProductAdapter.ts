import type { ShopifyStorefrontProductResult } from '@/types';
import type { ShopifyStorefrontProductAdapter } from './shopifyStorefrontProductAdapter';

/**
 * Deterministic in-memory adapter, matching the
 * mockShopifyStorefrontAdapter / mockShopifyStorefrontCartAdapter pattern.
 * It performs no I/O and calls no Storefront API — every request resolves
 * as a successful dry run, passing the already-computed mapping and
 * preview through unchanged.
 */
export const mockShopifyStorefrontProductAdapter: ShopifyStorefrontProductAdapter = {
  async execute(input): Promise<ShopifyStorefrontProductResult> {
    return {
      requestId: input.requestId,
      status: 'dry-run',
      productId: input.productId,
      mapping: input.mapping,
      preview: input.preview,
      errors: [],
      respondedAt: '2026-07-02T00:00:00.000Z',
      metadata: { source: 'mock-shopify-storefront-product-adapter' },
    };
  },
};

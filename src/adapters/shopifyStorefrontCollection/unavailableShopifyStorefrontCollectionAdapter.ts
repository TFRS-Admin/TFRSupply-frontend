import type { ShopifyStorefrontCollectionResult } from '@/types';
import type { ShopifyStorefrontCollectionAdapter } from './shopifyStorefrontCollectionAdapter';

/**
 * Explicit opt-out adapter, following the
 * unavailableShopifyStorefrontProductAdapter pattern. This is the default
 * adapter used by shopifyStorefrontCollectionService when no adapter is
 * injected — every request reports adapter-unavailable and no Storefront
 * API call is ever made.
 */
export const unavailableShopifyStorefrontCollectionAdapter: ShopifyStorefrontCollectionAdapter = {
  async execute(input): Promise<ShopifyStorefrontCollectionResult> {
    return {
      requestId: input.requestId,
      status: 'adapter-unavailable',
      categoryId: input.categoryId,
      mapping: input.mapping,
      preview: input.preview,
      errors: [{ code: 'adapter-unavailable', message: 'Shopify Storefront collection adapter is not connected; no live Storefront API call was made.', retryable: true }],
      metadata: { source: 'unavailable-shopify-storefront-collection-adapter' },
    };
  },
};

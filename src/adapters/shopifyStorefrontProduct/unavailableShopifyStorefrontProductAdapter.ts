import type { ShopifyStorefrontProductResult } from '@/types';
import type { ShopifyStorefrontProductAdapter } from './shopifyStorefrontProductAdapter';

/**
 * Explicit opt-out adapter, following the unavailableShopifyStorefrontAdapter
 * / unavailableShopifyStorefrontCartAdapter pattern. This is the default
 * adapter used by shopifyStorefrontProductService when no adapter is
 * injected — every request reports adapter-unavailable and no Storefront
 * API call is ever made.
 */
export const unavailableShopifyStorefrontProductAdapter: ShopifyStorefrontProductAdapter = {
  async execute(input): Promise<ShopifyStorefrontProductResult> {
    return {
      requestId: input.requestId,
      status: 'adapter-unavailable',
      productId: input.productId,
      mapping: input.mapping,
      preview: input.preview,
      errors: [{ code: 'adapter-unavailable', message: 'Shopify Storefront product adapter is not connected; no live Storefront API call was made.', retryable: true }],
      metadata: { source: 'unavailable-shopify-storefront-product-adapter' },
    };
  },
};

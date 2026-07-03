import type { ShopifyStorefrontCartResult } from '@/types';
import type { ShopifyStorefrontCartAdapter } from './shopifyStorefrontCartAdapter';

/**
 * Explicit opt-out adapter, following the unavailableShopifyStorefrontAdapter
 * / unavailableCheckoutPreparationAdapter pattern. This is the default
 * adapter used by shopifyStorefrontCartService when no adapter is injected —
 * every request reports adapter-unavailable and no Storefront API call is
 * ever made.
 */
export const unavailableShopifyStorefrontCartAdapter: ShopifyStorefrontCartAdapter = {
  async execute(input): Promise<ShopifyStorefrontCartResult> {
    return {
      requestId: input.requestId,
      status: 'adapter-unavailable',
      cartLines: input.cartLines,
      lineCount: input.cartLines.length,
      mutationPreview: input.mutationPreview,
      checkoutPreview: null,
      errors: [{ code: 'adapter-unavailable', message: 'Shopify Storefront cart adapter is not connected; no live Storefront API call was made.', retryable: true }],
      metadata: { source: 'unavailable-shopify-storefront-cart-adapter' },
    };
  },
};

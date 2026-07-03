import type { ShopifyCheckoutPreviewAdapter, ShopifyCheckoutPreviewAdapterOutput } from './shopifyCheckoutPreviewAdapter';

/**
 * Explicit opt-out adapter, following the unavailableShopifyStorefrontCartAdapter
 * / unavailableCheckoutPreparationAdapter pattern. This is the default
 * adapter used by shopifyCheckoutPreviewService when no adapter is
 * injected — every request reports adapter-unavailable and no checkout URL
 * preview is ever generated.
 */
export const unavailableShopifyCheckoutPreviewAdapter: ShopifyCheckoutPreviewAdapter = {
  async execute(): Promise<ShopifyCheckoutPreviewAdapterOutput> {
    return {
      status: 'adapter-unavailable',
      urlPreview: null,
      errors: [{ code: 'adapter-unavailable', message: 'Shopify Checkout Preview adapter is not connected; no checkout URL preview was generated.', retryable: true }],
      metadata: { source: 'unavailable-shopify-checkout-preview-adapter' },
    };
  },
};

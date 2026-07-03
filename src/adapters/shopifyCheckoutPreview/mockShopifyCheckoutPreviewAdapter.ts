import type { ShopifyCheckoutPreviewAdapter, ShopifyCheckoutPreviewAdapterOutput } from './shopifyCheckoutPreviewAdapter';

/**
 * Deterministic in-memory adapter, matching the mockShopifyStorefrontCartAdapter
 * / mockCheckoutPreparationAdapter pattern. It performs no I/O and calls no
 * Shopify API. When there are no blockers and the Storefront cart preview
 * reports ready, it resolves a deterministic, non-network checkout URL
 * preview built from the already-computed Storefront cart checkout preview;
 * otherwise it reports a blocked preview with no URL.
 */
export const mockShopifyCheckoutPreviewAdapter: ShopifyCheckoutPreviewAdapter = {
  async execute(input): Promise<ShopifyCheckoutPreviewAdapterOutput> {
    const storefrontPreview = input.storefrontCheckoutPreview;

    if (input.hasBlockers || !storefrontPreview || !storefrontPreview.ready) {
      return {
        status: 'blocked',
        urlPreview: null,
        errors: [],
        respondedAt: '2026-07-02T00:00:00.000Z',
        metadata: { source: 'mock-shopify-checkout-preview-adapter' },
      };
    }

    return {
      status: 'preview-ready',
      urlPreview: {
        checkoutUrlPreview: storefrontPreview.checkoutUrlPreview ?? `https://mock-storefront.example/checkout-url-preview/${input.requestId}`,
        cartId: storefrontPreview.cartId,
        currencyCode: storefrontPreview.currencyCode,
        estimatedTotal: storefrontPreview.estimatedTotal,
        lineCount: storefrontPreview.lineCount,
        ready: true,
      },
      errors: [],
      respondedAt: '2026-07-02T00:00:00.000Z',
      metadata: { source: 'mock-shopify-checkout-preview-adapter' },
    };
  },
};

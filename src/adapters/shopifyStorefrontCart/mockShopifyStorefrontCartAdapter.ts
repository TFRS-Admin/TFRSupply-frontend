import type { ShopifyStorefrontCartResult } from '@/types';
import type { ShopifyStorefrontCartAdapter } from './shopifyStorefrontCartAdapter';

/**
 * Deterministic in-memory adapter, matching the mockShopifyStorefrontAdapter
 * / mockCheckoutPreparationAdapter pattern. It performs no I/O and calls no
 * Storefront API — every request resolves as a successful dry run with a
 * placeholder (non-network) checkout URL preview.
 */
export const mockShopifyStorefrontCartAdapter: ShopifyStorefrontCartAdapter = {
  async execute(input): Promise<ShopifyStorefrontCartResult> {
    const ready = input.cartLines.length > 0 && input.cartLines.every((line) => line.merchandiseAvailable);
    return {
      requestId: input.requestId,
      status: 'dry-run',
      cartLines: input.cartLines,
      lineCount: input.cartLines.length,
      mutationPreview: input.mutationPreview,
      checkoutPreview: {
        checkoutUrlPreview: `https://mock-storefront.example/checkout-preview/${input.requestId}`,
        cartId: `mock-cart-${input.requestId}`,
        currencyCode: input.currencyCode,
        estimatedTotal: input.estimatedTotal,
        lineCount: input.cartLines.length,
        ready,
      },
      errors: [],
      respondedAt: '2026-07-02T00:00:00.000Z',
      metadata: { source: 'mock-shopify-storefront-cart-adapter' },
    };
  },
};

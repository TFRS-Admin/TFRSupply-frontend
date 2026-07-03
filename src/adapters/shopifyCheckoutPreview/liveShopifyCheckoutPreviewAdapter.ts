import type { ShopifyStorefrontClientConfig } from '@/types';
import type { ShopifyCheckoutPreviewAdapter, ShopifyCheckoutPreviewAdapterOutput } from './shopifyCheckoutPreviewAdapter';

function isConfigured(config?: Partial<ShopifyStorefrontClientConfig>): boolean {
  return Boolean(config?.storeDomain && config?.storefrontAccessToken);
}

/**
 * Stub-only live adapter, matching the createLiveShopifyStorefrontCartAdapter
 * pattern. It never calls Shopify — every execute() call resolves with
 * status: 'failed' and error code 'live-calls-disabled'. A future issue can
 * replace the body of execute() with real Storefront cart/checkout state
 * (once a live Shopify Storefront cart mutation exists) without changing
 * this adapter's public shape or any caller's contract.
 */
export function createLiveShopifyCheckoutPreviewAdapter(defaultConfig?: Partial<ShopifyStorefrontClientConfig>): ShopifyCheckoutPreviewAdapter {
  return {
    async execute(input): Promise<ShopifyCheckoutPreviewAdapterOutput> {
      const config = { ...defaultConfig, ...input.config };
      return {
        status: 'failed',
        urlPreview: null,
        errors: [{
          code: 'live-calls-disabled',
          message: 'Live Shopify checkout URL previews are disabled in this foundation; a future issue must connect a real Storefront checkout implementation.',
          retryable: false,
        }],
        metadata: { source: 'live-shopify-checkout-preview-adapter', attributes: { configured: isConfigured(config) } },
      };
    },
  };
}

export const liveShopifyCheckoutPreviewAdapter: ShopifyCheckoutPreviewAdapter = createLiveShopifyCheckoutPreviewAdapter();

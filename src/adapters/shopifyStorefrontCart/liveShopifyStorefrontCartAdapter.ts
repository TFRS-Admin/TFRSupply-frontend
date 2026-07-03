import { buildStorefrontFetchRequest } from '@/adapters/shopifyStorefront';
import type { ShopifyStorefrontClientConfig, ShopifyStorefrontCartResult } from '@/types';
import type { ShopifyStorefrontCartAdapter } from './shopifyStorefrontCartAdapter';

function isConfigured(config?: Partial<ShopifyStorefrontClientConfig>): boolean {
  return Boolean(config?.storeDomain && config?.storefrontAccessToken);
}

/**
 * Stub-only live adapter. It reuses buildStorefrontFetchRequest() from the
 * Shopify Storefront API Foundation to build the exact fetch request shape
 * a real cart mutation would send, but it deliberately never calls fetch() —
 * every execute() call returns a live-calls-disabled failure. A future issue
 * can replace the body of execute() with an actual fetch() against the
 * request built here without changing this adapter's public shape or any
 * caller's contract.
 */
export function createLiveShopifyStorefrontCartAdapter(defaultConfig?: Partial<ShopifyStorefrontClientConfig>): ShopifyStorefrontCartAdapter {
  return {
    async execute(input): Promise<ShopifyStorefrontCartResult> {
      const config = { ...defaultConfig, ...input.config };
      const fetchRequest = buildStorefrontFetchRequest(
        { operationName: input.mutationPreview.operationName, query: input.mutationPreview.query, variables: input.mutationPreview.variables },
        config,
      );
      return {
        requestId: input.requestId,
        status: 'failed',
        cartLines: input.cartLines,
        lineCount: input.cartLines.length,
        mutationPreview: input.mutationPreview,
        checkoutPreview: null,
        errors: [{
          code: 'live-calls-disabled',
          message: 'Live Shopify Storefront cart mutations are disabled in this foundation; a future issue must connect a real fetch implementation.',
          retryable: false,
        }],
        metadata: { source: 'live-shopify-storefront-cart-adapter', attributes: { requestUrl: fetchRequest.url, configured: isConfigured(config) } },
      };
    },
  };
}

export const liveShopifyStorefrontCartAdapter: ShopifyStorefrontCartAdapter = createLiveShopifyStorefrontCartAdapter();

import { buildStorefrontFetchRequest } from '@/adapters/shopifyStorefront';
import type { ShopifyStorefrontClientConfig, ShopifyStorefrontCollectionResult } from '@/types';
import type { ShopifyStorefrontCollectionAdapter } from './shopifyStorefrontCollectionAdapter';

function isConfigured(config?: Partial<ShopifyStorefrontClientConfig>): boolean {
  return Boolean(config?.storeDomain && config?.storefrontAccessToken);
}

/**
 * Stub-only live adapter. It reuses buildStorefrontFetchRequest() from the
 * Shopify Storefront API Foundation to build the exact fetch request shape
 * a real collectionByHandle query would send, but it deliberately never
 * calls fetch() — every execute() call returns a live-calls-disabled
 * failure. A future issue can replace the body of execute() with an actual
 * fetch() against the request built here without changing this adapter's
 * public shape or any caller's contract.
 */
export function createLiveShopifyStorefrontCollectionAdapter(defaultConfig?: Partial<ShopifyStorefrontClientConfig>): ShopifyStorefrontCollectionAdapter {
  return {
    async execute(input): Promise<ShopifyStorefrontCollectionResult> {
      const config = { ...defaultConfig, ...input.config };
      const fetchRequest = buildStorefrontFetchRequest(
        { operationName: input.preview.operationName, query: input.preview.query, variables: input.preview.variables },
        config,
      );
      return {
        requestId: input.requestId,
        status: 'failed',
        categoryId: input.categoryId,
        mapping: input.mapping,
        preview: input.preview,
        errors: [{
          code: 'live-calls-disabled',
          message: 'Live Shopify Storefront collection queries are disabled in this foundation; a future issue must connect a real fetch implementation.',
          retryable: false,
        }],
        metadata: { source: 'live-shopify-storefront-collection-adapter', attributes: { requestUrl: fetchRequest.url, configured: isConfigured(config) } },
      };
    },
  };
}

export const liveShopifyStorefrontCollectionAdapter: ShopifyStorefrontCollectionAdapter = createLiveShopifyStorefrontCollectionAdapter();

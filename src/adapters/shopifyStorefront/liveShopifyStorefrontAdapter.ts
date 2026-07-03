import type { ShopifyStorefrontAvailability, ShopifyStorefrontClientConfig, ShopifyStorefrontResponse } from '@/types';
import type { ShopifyStorefrontAdapter } from './shopifyStorefrontAdapter';

const DEFAULT_API_VERSION = '2024-10';

export interface ShopifyStorefrontFetchRequest {
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: string;
}

function isConfigured(config?: Partial<ShopifyStorefrontClientConfig>): boolean {
  return Boolean(config?.storeDomain && config?.storefrontAccessToken);
}

/**
 * Builds the exact fetch request shape (URL, headers, GraphQL body) that a
 * future live implementation would send to Shopify's Storefront API. This
 * function performs no network I/O itself — it only defines the request
 * boundary so a future issue can wire in a real `fetch` call behind the
 * same shape without changing this foundation's contracts.
 */
export function buildStorefrontFetchRequest(operation: { operationName: string; query: string; variables?: Record<string, unknown> }, config?: Partial<ShopifyStorefrontClientConfig>): ShopifyStorefrontFetchRequest {
  const storeDomain = config?.storeDomain ?? '<unconfigured-store-domain>';
  const apiVersion = config?.apiVersion ?? DEFAULT_API_VERSION;
  return {
    url: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config?.storefrontAccessToken ?? '<unconfigured-storefront-access-token>',
    },
    body: JSON.stringify({ query: operation.query, variables: operation.variables ?? {}, operationName: operation.operationName }),
  };
}

/**
 * Stub-only live adapter. It validates configuration and builds the real
 * Storefront API request boundary via buildStorefrontFetchRequest(), but it
 * deliberately never calls fetch() — every execute() call returns a
 * live-calls-disabled failure. A future issue can replace the body of
 * execute() with an actual fetch() against the request built here without
 * changing this adapter's public shape or any caller's contract.
 */
export function createLiveShopifyStorefrontAdapter(defaultConfig?: Partial<ShopifyStorefrontClientConfig>): ShopifyStorefrontAdapter {
  return {
    async execute(request): Promise<ShopifyStorefrontResponse> {
      const config = { ...defaultConfig, ...request.config };
      const fetchRequest = buildStorefrontFetchRequest(request.operation, config);
      return {
        requestId: request.requestId,
        status: 'failed',
        operationType: request.operation.operationType,
        data: null,
        errors: [{
          code: 'live-calls-disabled',
          message: 'Live Shopify Storefront API calls are disabled in this foundation; a future issue must connect a real fetch implementation.',
          retryable: false,
        }],
        metadata: { source: 'live-shopify-storefront-adapter', attributes: { requestUrl: fetchRequest.url, configured: isConfigured(config) } },
      };
    },
    async getAvailability(config): Promise<ShopifyStorefrontAvailability> {
      const merged = { ...defaultConfig, ...config };
      return {
        available: false,
        configured: isConfigured(merged),
        adapterMode: 'live',
        reason: 'Live Shopify Storefront adapter is a request/response boundary stub only; it does not perform network calls.',
        metadata: { source: 'live-shopify-storefront-adapter' },
      };
    },
  };
}

export const liveShopifyStorefrontAdapter: ShopifyStorefrontAdapter = createLiveShopifyStorefrontAdapter();

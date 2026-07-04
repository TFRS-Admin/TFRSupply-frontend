import { buildStorefrontFetchRequest } from '@/adapters/shopifyStorefront/liveShopifyStorefrontAdapter';
import type { CatalogAdapterCollectionsResult, CatalogAdapterError, CatalogAdapterProductsResult, Category, ShopifyStorefrontClientConfig } from '@/types';
import type { CatalogAdapter } from './catalogAdapter';
import {
  buildCollectionListOperation,
  buildProductListOperation,
  mapStorefrontCollectionNode,
  mapStorefrontProductNode,
  type CatalogAdapterCollectionNode,
  type CatalogAdapterProductNode,
} from './shopifyProductMapping';

export type CatalogAdapterFetchImpl = typeof fetch;

function isConfigured(config?: Partial<ShopifyStorefrontClientConfig>): boolean {
  return Boolean(config?.storeDomain && config?.storefrontAccessToken);
}

function notConfiguredError(): CatalogAdapterError {
  return {
    code: 'not-configured',
    message: 'Live Shopify Storefront catalog adapter requires storeDomain and storefrontAccessToken; no fetch was attempted.',
    retryable: false,
  };
}

function toCatalogAdapterError(reason: unknown): CatalogAdapterError {
  const message = reason instanceof Error ? reason.message : 'Unknown network error contacting the Shopify Storefront API.';
  return { code: 'network-error', message, retryable: true };
}

/**
 * The first live-capable Catalog Adapter in this codebase: unlike every
 * prior Shopify Storefront foundation's "live" adapter (API Foundation,
 * Cart Adapter, Product Sync, Collection Sync — all request/response
 * boundary stubs that never call fetch), this adapter performs a real
 * fetch() against the Storefront GraphQL endpoint when configured, reusing
 * `buildStorefrontFetchRequest()` for the request shape and the existing
 * `product-list-query`/`collection-query` operation types.
 *
 * It is never selected automatically from build-time env config — no
 * Storefront access token variable is read from `import.meta.env` anywhere
 * in this codebase (see SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md), so a
 * config carrying a token can only reach this adapter through an explicit,
 * developer-supplied value (the /dev/storefront dashboard's manual
 * credential form). Every failure mode — missing config, network error,
 * non-2xx response, GraphQL errors — resolves to a `failed` or
 * `adapter-unavailable` result instead of throwing, so callers can always
 * fall back to the mock adapter safely.
 */
export function createLiveShopifyStorefrontCatalogAdapter(
  config?: Partial<ShopifyStorefrontClientConfig>,
  fetchImpl: CatalogAdapterFetchImpl = fetch,
): CatalogAdapter {
  return {
    async fetchProducts(existingCategories: Category[]): Promise<CatalogAdapterProductsResult> {
      const fetchedAt = new Date().toISOString();
      if (!isConfigured(config)) {
        return { status: 'adapter-unavailable', products: [], errors: [notConfiguredError()], fetchedAt };
      }

      const operation = buildProductListOperation();
      const fetchRequest = buildStorefrontFetchRequest(operation, config);

      let response: Response;
      try {
        response = await fetchImpl(fetchRequest.url, { method: fetchRequest.method, headers: fetchRequest.headers, body: fetchRequest.body });
      } catch (reason) {
        return { status: 'failed', products: [], errors: [toCatalogAdapterError(reason)], fetchedAt };
      }

      if (!response.ok) {
        return {
          status: 'failed',
          products: [],
          errors: [{ code: 'http-error', message: `Shopify Storefront API responded with HTTP ${response.status}.`, retryable: true }],
          fetchedAt,
        };
      }

      const json = await response.json() as { data?: { products?: { edges?: Array<{ node: CatalogAdapterProductNode }> } }; errors?: Array<{ message: string }> };
      if (json.errors && json.errors.length > 0) {
        return {
          status: 'failed',
          products: [],
          errors: json.errors.map((error) => ({ code: 'graphql-error' as const, message: error.message, retryable: false })),
          fetchedAt,
        };
      }

      const nodes = (json.data?.products?.edges ?? []).map((edge) => edge.node);
      const products = nodes.map((node) => mapStorefrontProductNode(node, existingCategories));
      return { status: 'success', products, errors: [], fetchedAt };
    },

    async fetchCollections(existingCategories: Category[]): Promise<CatalogAdapterCollectionsResult> {
      const fetchedAt = new Date().toISOString();
      if (!isConfigured(config)) {
        return { status: 'adapter-unavailable', categories: [], unmatchedCollectionHandles: [], errors: [notConfiguredError()], fetchedAt };
      }

      const operation = buildCollectionListOperation();
      const fetchRequest = buildStorefrontFetchRequest(operation, config);

      let response: Response;
      try {
        response = await fetchImpl(fetchRequest.url, { method: fetchRequest.method, headers: fetchRequest.headers, body: fetchRequest.body });
      } catch (reason) {
        return { status: 'failed', categories: [], unmatchedCollectionHandles: [], errors: [toCatalogAdapterError(reason)], fetchedAt };
      }

      if (!response.ok) {
        return {
          status: 'failed',
          categories: [],
          unmatchedCollectionHandles: [],
          errors: [{ code: 'http-error', message: `Shopify Storefront API responded with HTTP ${response.status}.`, retryable: true }],
          fetchedAt,
        };
      }

      const json = await response.json() as { data?: { collections?: { edges?: Array<{ node: CatalogAdapterCollectionNode }> } }; errors?: Array<{ message: string }> };
      if (json.errors && json.errors.length > 0) {
        return {
          status: 'failed',
          categories: [],
          unmatchedCollectionHandles: [],
          errors: json.errors.map((error) => ({ code: 'graphql-error' as const, message: error.message, retryable: false })),
          fetchedAt,
        };
      }

      const nodes = (json.data?.collections?.edges ?? []).map((edge) => edge.node);
      const mapped = nodes.map((node) => ({ node, category: mapStorefrontCollectionNode(node, existingCategories) }));
      const categories = mapped.map((entry) => entry.category).filter((category): category is Category => category !== null);
      const unmatchedCollectionHandles = mapped.filter((entry) => entry.category === null).map((entry) => entry.node.handle);

      return { status: 'success', categories, unmatchedCollectionHandles, errors: [], fetchedAt };
    },
  };
}

export const liveShopifyStorefrontCatalogAdapter: CatalogAdapter = createLiveShopifyStorefrontCatalogAdapter();

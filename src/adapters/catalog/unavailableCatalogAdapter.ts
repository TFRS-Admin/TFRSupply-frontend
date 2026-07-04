import type { CatalogAdapter } from './catalogAdapter';

/**
 * Explicit opt-out adapter, matching unavailableShopifyStorefrontAdapter /
 * unavailableShopifyStorefrontProductAdapter. Returns an empty result with
 * a retryable adapter-unavailable error and performs no I/O.
 * catalogAdapterService treats this the same as a failed live sync: the
 * synchronous CatalogService read path falls back to loader-based data.
 */
export const unavailableCatalogAdapter: CatalogAdapter = {
  async fetchProducts() {
    return {
      status: 'adapter-unavailable',
      products: [],
      errors: [{ code: 'adapter-unavailable', message: 'Catalog adapter is not connected; no live Storefront API call was made.', retryable: true }],
      fetchedAt: new Date().toISOString(),
    };
  },
  async fetchCollections() {
    return {
      status: 'adapter-unavailable',
      categories: [],
      unmatchedCollectionHandles: [],
      errors: [{ code: 'adapter-unavailable', message: 'Catalog adapter is not connected; no live Storefront API call was made.', retryable: true }],
      fetchedAt: new Date().toISOString(),
    };
  },
};

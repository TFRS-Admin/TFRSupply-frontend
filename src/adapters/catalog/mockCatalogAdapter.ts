import { listTypedCategories, listTypedProducts } from '@/data/loaders';
import type { CatalogAdapter } from './catalogAdapter';

/**
 * Wraps today's default catalog read path unchanged — the same typed
 * loaders `catalogService` already calls directly. This is the default
 * adapter CatalogService falls back to, so existing runtime behavior is
 * byte-for-byte identical whether or not this adapter boundary exists.
 */
export const mockCatalogAdapter: CatalogAdapter = {
  async fetchProducts() {
    return {
      status: 'success',
      products: listTypedProducts(),
      errors: [],
      fetchedAt: new Date().toISOString(),
    };
  },
  async fetchCollections() {
    return {
      status: 'success',
      categories: listTypedCategories(),
      unmatchedCollectionHandles: [],
      errors: [],
      fetchedAt: new Date().toISOString(),
    };
  },
};

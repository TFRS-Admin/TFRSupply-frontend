import type { Category, CatalogAdapterCollectionsResult, CatalogAdapterProductsResult } from '@/types';

/**
 * The Catalog Adapter boundary CatalogService reads through. Every
 * implementation returns data already shaped as existing Product/Category
 * contracts — no new domain type is introduced. `existingCategories` is
 * passed to both methods so an adapter can resolve `categoryIds`/
 * `verticalIds` (products) and enrich an existing Category record with live
 * Shopify identifiers (collections) without fabricating a `verticalId`
 * Shopify has no concept of — the same read-only reuse of Catalog Service
 * data every sibling Storefront foundation (Product Sync, Collection Sync)
 * already relies on.
 */
export interface CatalogAdapter {
  fetchProducts(existingCategories: Category[]): Promise<CatalogAdapterProductsResult>;
  fetchCollections(existingCategories: Category[]): Promise<CatalogAdapterCollectionsResult>;
}

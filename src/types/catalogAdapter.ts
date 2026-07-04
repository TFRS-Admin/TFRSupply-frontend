import type { Category, Product } from './product';

/**
 * 'mock' reads from the existing Product Data Platform loaders (today's
 * default runtime behavior, unchanged). 'live' reads from the Shopify
 * Storefront API. 'unavailable' is the explicit opt-out adapter — no
 * network call, empty result. Selection defaults to 'mock' unless the
 * Storefront Runtime Configuration foundation reports it configured and
 * enabled, matching every other Shopify Storefront foundation's default
 * safe posture.
 */
export type CatalogAdapterMode = 'mock' | 'unavailable' | 'live';

export type CatalogAdapterFetchStatus = 'idle' | 'success' | 'failed' | 'adapter-unavailable';

export type CatalogAdapterErrorCode =
  | 'not-configured'
  | 'network-error'
  | 'http-error'
  | 'graphql-error'
  | 'adapter-unavailable'
  | 'unknown';

export interface CatalogAdapterError {
  code: CatalogAdapterErrorCode;
  message: string;
  retryable: boolean;
  metadata?: Record<string, unknown>;
}

export interface CatalogAdapterProductsResult {
  status: CatalogAdapterFetchStatus;
  products: Product[];
  errors: CatalogAdapterError[];
  fetchedAt: string;
}

export interface CatalogAdapterCollectionsResult {
  status: CatalogAdapterFetchStatus;
  categories: Category[];
  /** Handles of Shopify collections with no matching local Category — verticalId cannot be safely fabricated, so these are reported rather than mapped. */
  unmatchedCollectionHandles: string[];
  errors: CatalogAdapterError[];
  fetchedAt: string;
}

export interface CatalogMappingIssue {
  entityType: 'product' | 'category';
  identifier: string;
  reason: string;
}

export interface CatalogMappingValidationResult {
  validProductCount: number;
  invalidProductCount: number;
  validCategoryCount: number;
  unmatchedCollectionCount: number;
  issues: CatalogMappingIssue[];
}

export interface CatalogAdapterStatusSnapshot {
  adapterMode: CatalogAdapterMode;
  productFetchStatus: CatalogAdapterFetchStatus;
  collectionFetchStatus: CatalogAdapterFetchStatus;
  lastSyncedAt: string | null;
  productCount: number;
  categoryCount: number;
  usedFallback: boolean;
  fallbackReason?: string;
  mappingValidation: CatalogMappingValidationResult | null;
  errors: CatalogAdapterError[];
}

export interface CatalogAdapterCapabilities {
  adapterMode: CatalogAdapterMode;
  supportsLiveFetch: boolean;
}

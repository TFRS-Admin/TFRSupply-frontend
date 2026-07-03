import type { Metadata } from './common';
import type { ShopifyStorefrontClientConfig } from './shopifyStorefront';

export type ShopifyStorefrontCollectionAdapterMode = 'mock' | 'unavailable' | 'live';
export type ShopifyStorefrontCollectionStatus = 'not-started' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyStorefrontCollectionErrorCode = 'validation-error' | 'unmapped-category' | 'adapter-unavailable' | 'live-calls-disabled' | 'unknown';

export interface ShopifyStorefrontCollectionError {
  code: ShopifyStorefrontCollectionErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

/**
 * Read-only mapping between a catalog Category (Catalog Service / Product
 * Data Platform) and its future Shopify Storefront collection record.
 * handle/productCount are derived deterministically from existing catalog
 * fields; shopifyCollectionId/shopifyCollectionGid come from the existing
 * Category.shopify metadata bag when present. No Shopify lookup produces
 * this mapping today.
 */
export interface ShopifyStorefrontCollectionMapping {
  categoryId: string;
  verticalId: string;
  handle: string;
  shopifyCollectionId: string | null;
  shopifyCollectionGid: string | null;
  mapped: boolean;
  productCount: number;
}

export interface ShopifyStorefrontCollectionPreview {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}

export interface ShopifyStorefrontCollectionRequest {
  requestId: string;
  dryRun: true;
  categoryId: string;
  config?: Partial<ShopifyStorefrontClientConfig>;
  requestedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontCollectionResult {
  requestId: string;
  status: ShopifyStorefrontCollectionStatus;
  categoryId: string;
  mapping: ShopifyStorefrontCollectionMapping | null;
  preview: ShopifyStorefrontCollectionPreview | null;
  errors: ShopifyStorefrontCollectionError[];
  respondedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontCollectionCapabilities {
  dryRunOnly: true;
  liveCallsEnabled: false;
  adapterMode: ShopifyStorefrontCollectionAdapterMode;
}

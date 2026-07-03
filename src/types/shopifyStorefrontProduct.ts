import type { Metadata } from './common';
import type { ShopifyStorefrontClientConfig } from './shopifyStorefront';

export type ShopifyStorefrontProductAdapterMode = 'mock' | 'unavailable' | 'live';
export type ShopifyStorefrontProductStatus = 'not-started' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyStorefrontProductErrorCode = 'validation-error' | 'unmapped-product' | 'adapter-unavailable' | 'live-calls-disabled' | 'unknown';

export interface ShopifyStorefrontProductError {
  code: ShopifyStorefrontProductErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

/**
 * Read-only mapping between a catalog Product (Product Data Platform /
 * Catalog Service) and its future Shopify Storefront product record.
 * handle/variantCount/mediaCount are derived deterministically from
 * existing catalog fields; shopifyProductId/shopifyProductGid come from the
 * existing Product.shopify metadata bag when present. No Shopify lookup
 * produces this mapping today.
 */
export interface ShopifyStorefrontProductMapping {
  productId: string;
  sku?: string;
  handle: string;
  shopifyProductId: string | null;
  shopifyProductGid: string | null;
  mapped: boolean;
  variantCount: number;
  mediaCount: number;
}

export interface ShopifyStorefrontProductPreview {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}

export interface ShopifyStorefrontProductRequest {
  requestId: string;
  dryRun: true;
  productId: string;
  config?: Partial<ShopifyStorefrontClientConfig>;
  requestedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontProductResult {
  requestId: string;
  status: ShopifyStorefrontProductStatus;
  productId: string;
  mapping: ShopifyStorefrontProductMapping | null;
  preview: ShopifyStorefrontProductPreview | null;
  errors: ShopifyStorefrontProductError[];
  respondedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontProductCapabilities {
  dryRunOnly: true;
  liveCallsEnabled: false;
  adapterMode: ShopifyStorefrontProductAdapterMode;
}

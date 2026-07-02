import type { Metadata, Money } from './common';
import type { Product } from './product';

export type ShopifyCatalogSyncStatus = 'draft' | 'mapped' | 'validated' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyCatalogPublishAction = 'create' | 'update' | 'archive' | 'skip';
export type ShopifyCatalogErrorCode = 'validation-error' | 'mapping-error' | 'adapter-unavailable' | 'unsupported-product' | 'unknown';

export interface ShopifyCatalogError {
  code: ShopifyCatalogErrorCode;
  message: string;
  fieldPath?: string;
  productId?: string;
  sku?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyCatalogSyncItem {
  productId: string;
  sku?: string;
  action: ShopifyCatalogPublishAction;
  status: ShopifyCatalogSyncStatus;
  title: string;
  handle: string;
  vendor?: string;
  productType?: string;
  tags: string[];
  description?: string;
  imageUrls: string[];
  price?: Money;
  variants: Array<{
    sku: string;
    title: string;
    optionValues?: Record<string, string>;
    price?: Money;
    metadata?: Metadata;
  }>;
  errors: ShopifyCatalogError[];
  metadata?: Metadata;
}

export interface ShopifyCatalogMapping {
  productId: string;
  shopifyProductId?: string | null;
  shopifyProductGid?: string | null;
  handle: string;
  action: ShopifyCatalogPublishAction;
  mappedAt: string;
  variantMappings: Array<{ sku: string; shopifyVariantId?: string | null; shopifyVariantGid?: string | null; action: ShopifyCatalogPublishAction }>;
  warnings: ShopifyCatalogError[];
  metadata?: Metadata;
}

export interface ShopifyCatalogSyncRequest {
  requestId: string;
  products: Product[];
  action?: ShopifyCatalogPublishAction;
  dryRun: true;
  requestedAt?: string;
  source?: 'catalog-service' | 'product-data-platform' | 'manual';
  metadata?: Metadata;
}

export interface ShopifyCatalogSyncResult {
  requestId: string;
  status: ShopifyCatalogSyncStatus;
  items: ShopifyCatalogSyncItem[];
  mappings: ShopifyCatalogMapping[];
  errors: ShopifyCatalogError[];
  syncedAt?: string;
  metadata?: Metadata;
}

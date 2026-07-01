import type { Metadata } from './common';
import type { InventoryStatus, Price, ShopifyProduct, ShopifyVariant, VariantMapping } from './commerce';

export type ShopifySyncEntityType = 'product' | 'variant' | 'inventory' | 'pricing-reference' | 'metadata';
export type ShopifySyncDirection = 'push' | 'pull' | 'reconcile';
export type ShopifySyncStatus = 'pending' | 'validated' | 'skipped' | 'succeeded' | 'failed' | 'retryable';
export type ShopifySyncErrorCode = 'validation-error' | 'adapter-unavailable' | 'not-found' | 'conflict' | 'rate-limited' | 'unknown';

export interface ShopifySyncRetryMetadata {
  attempt: number;
  maxAttempts: number;
  nextRetryAt?: string;
  lastAttemptAt?: string;
  backoffSeconds?: number;
}

export interface ShopifySyncError {
  code: ShopifySyncErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifySyncSubject {
  entityType: ShopifySyncEntityType;
  productId?: string;
  sku?: string;
  shopifyProductId?: string;
  shopifyVariantId?: string;
}

export interface ShopifyProductSyncPayload {
  product: ShopifyProduct;
  metadata?: Metadata;
}

export interface ShopifyVariantSyncPayload {
  variant: ShopifyVariant;
  variantMapping?: VariantMapping;
  metadata?: Metadata;
}

export interface ShopifyInventorySyncPayload {
  sku: string;
  inventoryStatus: InventoryStatus;
  shopifyVariantId?: string;
  metadata?: Metadata;
}

export interface ShopifyPricingReferenceSyncPayload {
  sku: string;
  price: Price;
  shopifyVariantId?: string;
  source?: string;
  metadata?: Metadata;
}

export type ShopifySyncPayload =
  | ShopifyProductSyncPayload
  | ShopifyVariantSyncPayload
  | ShopifyInventorySyncPayload
  | ShopifyPricingReferenceSyncPayload;

export interface ShopifySyncRequest<TPayload extends ShopifySyncPayload = ShopifySyncPayload> {
  requestId: string;
  direction: ShopifySyncDirection;
  subject: ShopifySyncSubject;
  payload: TPayload;
  dryRun: true;
  requestedAt?: string;
  retry?: ShopifySyncRetryMetadata;
  metadata?: Metadata;
}

export interface ShopifySyncResult<TPayload extends ShopifySyncPayload = ShopifySyncPayload> {
  requestId: string;
  status: ShopifySyncStatus;
  subject: ShopifySyncSubject;
  payload?: TPayload;
  errors: ShopifySyncError[];
  retry?: ShopifySyncRetryMetadata;
  syncedAt?: string;
  metadata?: Metadata;
}

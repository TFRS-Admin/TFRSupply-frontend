import type { InventoryStatus, VariantMapping } from './commerce';
import type { Metadata } from './common';
import type { Product } from './product';

export type ShopifyInventorySyncStatus = 'draft' | 'mapped' | 'validated' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyInventoryAdjustmentReason = 'inventory-sync' | 'manual-count' | 'warehouse-reconciliation' | 'return' | 'correction' | 'unknown';
export type ShopifyInventoryErrorCode = 'validation-error' | 'mapping-error' | 'adapter-unavailable' | 'missing-sku' | 'missing-location' | 'unknown';

export interface ShopifyInventoryLocation {
  locationId: string;
  name: string;
  shopifyLocationId?: string | null;
  shopifyLocationGid?: string | null;
  priority?: number;
  metadata?: Metadata;
}

export interface ShopifyInventoryAdjustment {
  sku: string;
  locationId: string;
  availableQuantity: number;
  previousQuantity?: number;
  delta?: number;
  reason: ShopifyInventoryAdjustmentReason;
  inventoryItemId?: string | null;
  inventoryItemGid?: string | null;
  metadata?: Metadata;
}

export interface ShopifyInventoryError {
  code: ShopifyInventoryErrorCode;
  message: string;
  fieldPath?: string;
  productId?: string;
  sku?: string;
  locationId?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyInventorySyncItem {
  productId: string;
  sku: string;
  status: ShopifyInventorySyncStatus;
  inventoryStatus: InventoryStatus;
  locations: ShopifyInventoryLocation[];
  adjustments: ShopifyInventoryAdjustment[];
  variantMapping?: VariantMapping;
  errors: ShopifyInventoryError[];
  metadata?: Metadata;
}

export interface ShopifyInventoryMapping {
  productId: string;
  sku: string;
  shopifyProductId?: string | null;
  shopifyProductGid?: string | null;
  shopifyVariantId?: string | null;
  shopifyVariantGid?: string | null;
  inventoryItemId?: string | null;
  inventoryItemGid?: string | null;
  locationMappings: Array<{ locationId: string; shopifyLocationId?: string | null; shopifyLocationGid?: string | null }>;
  mappedAt: string;
  warnings: ShopifyInventoryError[];
  metadata?: Metadata;
}

export interface ShopifyInventorySyncRequest {
  requestId: string;
  products: Product[];
  locations: ShopifyInventoryLocation[];
  dryRun: true;
  requestedAt?: string;
  source?: 'catalog-service' | 'product-data-platform' | 'commerce-foundation' | 'manual';
  defaultQuantity?: number;
  reason?: ShopifyInventoryAdjustmentReason;
  metadata?: Metadata;
}

export interface ShopifyInventorySyncResult {
  requestId: string;
  status: ShopifyInventorySyncStatus;
  items: ShopifyInventorySyncItem[];
  mappings: ShopifyInventoryMapping[];
  errors: ShopifyInventoryError[];
  syncedAt?: string;
  metadata?: Metadata;
}

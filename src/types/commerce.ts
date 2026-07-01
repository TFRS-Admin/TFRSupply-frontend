import type { BaseEntity, Metadata, Money } from './common';

export type CommerceChannel = 'shopify' | 'quote-only' | 'manual';

export type CommerceAvailabilityState = 'available' | 'unavailable' | 'backorder' | 'preorder' | 'unknown';

export type CommerceLookupStatus = 'ready' | 'not-found' | 'unmapped' | 'unavailable' | 'pending';

export interface Price extends Money {
  compareAt?: Money;
  taxable?: boolean;
}

export interface InventoryStatus {
  available: boolean;
  state?: CommerceAvailabilityState;
  quantityAvailable?: number;
  policy?: string;
  message?: string;
}

export interface CommerceProductReference {
  productId: string;
  sku?: string;
  configuratorId?: string;
  verticalId?: string;
  metadata?: Metadata;
}

export interface VariantMapping {
  sku: string;
  shopifyProductId?: string | null;
  shopifyVariantId?: string | null;
  shopifyProductGid?: string | null;
  shopifyVariantGid?: string | null;
  channel?: CommerceChannel;
  price?: Price;
  optionValues?: Record<string, string>;
  productReference?: CommerceProductReference;
  metadata?: Metadata;
}

export interface ShopifyVariant extends BaseEntity {
  gid?: string | null;
  sku: string;
  title: string;
  selectedOptions?: Record<string, string>;
  price?: Price;
  inventoryStatus?: InventoryStatus;
}

export interface ShopifyProduct extends BaseEntity {
  gid?: string | null;
  handle: string;
  cartEligible: boolean;
  storefrontAvailable: boolean;
  variants?: ShopifyVariant[];
  variantMappings?: VariantMapping[];
}

export interface CommerceLookupRequest {
  sku?: string;
  productId?: string;
  shopifyProductId?: string;
  shopifyVariantId?: string;
  channel?: CommerceChannel;
}

export interface CommerceLookupResult<T> {
  status: CommerceLookupStatus;
  data: T | null;
  message?: string;
}

export interface CartLineDraft {
  sku: string;
  quantity: number;
  variantMapping: VariantMapping;
  attributes?: Record<string, string>;
}

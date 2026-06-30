import type { BaseEntity, Money } from './common';

export interface Price extends Money {
  compareAt?: Money;
  taxable?: boolean;
}

export interface InventoryStatus {
  available: boolean;
  quantityAvailable?: number;
  policy?: string;
  message?: string;
}

export interface VariantMapping {
  sku: string;
  shopifyVariantId?: string | null;
  price?: Price;
  optionValues?: Record<string, string>;
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

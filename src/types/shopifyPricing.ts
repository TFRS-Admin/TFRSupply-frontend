import type { Metadata, Money } from './common';
import type { Price, VariantMapping } from './commerce';
import type { Product } from './product';
import type { ContractPrice, DealerCost, ListPrice, PricingContext, PricingLineInput } from './pricing';

export type ShopifyPricingSyncStatus = 'draft' | 'mapped' | 'validated' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyPricingStrategy = 'list-price' | 'dealer-cost' | 'contract-price' | 'manual' | 'quote-reference';
export type ShopifyPricingErrorCode = 'validation-error' | 'mapping-error' | 'adapter-unavailable' | 'missing-sku' | 'missing-price' | 'currency-mismatch' | 'unknown';

export interface ShopifyPriceAdjustment {
  sku: string;
  strategy: ShopifyPricingStrategy;
  price: Money;
  compareAtPrice?: Money | null;
  previousPrice?: Money | null;
  reason?: string;
  effectiveAt?: string;
  expiresAt?: string;
  metadata?: Metadata;
}

export interface ShopifyPricingError {
  code: ShopifyPricingErrorCode;
  message: string;
  fieldPath?: string;
  productId?: string;
  sku?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyPriceMapping {
  productId: string;
  sku: string;
  strategy: ShopifyPricingStrategy;
  price: Price;
  shopifyProductId?: string | null;
  shopifyProductGid?: string | null;
  shopifyVariantId?: string | null;
  shopifyVariantGid?: string | null;
  mappedAt: string;
  warnings: ShopifyPricingError[];
  metadata?: Metadata;
}

export interface ShopifyPricingSyncItem {
  productId: string;
  sku: string;
  status: ShopifyPricingSyncStatus;
  strategy: ShopifyPricingStrategy;
  price: Price;
  adjustment: ShopifyPriceAdjustment;
  variantMapping?: VariantMapping;
  errors: ShopifyPricingError[];
  metadata?: Metadata;
}

export interface ShopifyPricingSyncRequest {
  requestId: string;
  products: Product[];
  dryRun: true;
  requestedAt?: string;
  source?: 'pricing-domain' | 'dealer-contract-resolution' | 'commerce-foundation' | 'manual';
  strategy?: ShopifyPricingStrategy;
  pricingContext?: PricingContext;
  pricingLines?: PricingLineInput[];
  listPrices?: ListPrice[];
  dealerCosts?: DealerCost[];
  contractPrices?: ContractPrice[];
  defaultCurrencyCode?: string;
  metadata?: Metadata;
}

export interface ShopifyPricingSyncResult {
  requestId: string;
  status: ShopifyPricingSyncStatus;
  items: ShopifyPricingSyncItem[];
  mappings: ShopifyPriceMapping[];
  errors: ShopifyPricingError[];
  syncedAt?: string;
  metadata?: Metadata;
}

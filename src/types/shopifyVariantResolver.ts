export type ShopifyVariantAvailability = 'available' | 'unavailable' | 'unknown';

export type ShopifyVariantResolutionStatus = 'matched' | 'price_only' | 'unmatched';

export type ShopifyVariantResolutionSource = 'shopify-export' | 'commerce-foundation';

/**
 * Result of resolving a single catalog SKU to a Shopify variant. This is the
 * one place "does this configuration map to a real, sellable Shopify
 * variant?" gets answered — UI components read this instead of re-deriving
 * cart-readiness from raw commerce lookup fields.
 */
export interface ShopifyVariantResolution {
  sku: string;
  shopifyVariantId: string | null;
  shopifyProductId: string | null;
  price: number | null;
  currency: string;
  availability: ShopifyVariantAvailability;
  status: ShopifyVariantResolutionStatus;
  canAddToCart: boolean;
  reviewFlag: string | null;
  source: ShopifyVariantResolutionSource;
}

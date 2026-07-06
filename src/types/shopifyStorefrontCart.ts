import type { Metadata, Money } from './common';
import type { CartLineItem } from './cartWorkspace';
import type { ShopifyStorefrontClientConfig } from './shopifyStorefront';

export type ShopifyStorefrontCartAdapterMode = 'mock' | 'unavailable' | 'live';
export type ShopifyStorefrontCartStatus = 'not-started' | 'dry-run' | 'succeeded' | 'failed' | 'adapter-unavailable';
export type ShopifyStorefrontCartErrorCode =
  | 'validation-error'
  | 'unmapped-line'
  | 'adapter-unavailable'
  | 'live-calls-disabled'
  | 'configuration-error'
  | 'network-error'
  | 'shopify-error'
  | 'unknown';

/**
 * A single Cart Workspace line (src/types/cartWorkspace.ts CartLineItem)
 * mapped into the shape a Shopify Storefront cart mutation would need.
 * merchandiseId is the resolved Shopify variant GID/ID from the existing
 * Commerce Foundation (VariantMapping) — null when commerce has not yet
 * resolved a variant for this line's SKU.
 */
export interface ShopifyStorefrontCartLine {
  cartLineId: string;
  sku: string;
  quantity: number;
  merchandiseId: string | null;
  merchandiseAvailable: boolean;
  attributes?: Record<string, string>;
}

export interface ShopifyStorefrontCartMutationPreview {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}

/**
 * Display-only checkout preview metadata. checkoutUrlPreview is never a real
 * Shopify checkout URL — no live Storefront API call produces it, and no
 * redirect ever follows it.
 */
export interface ShopifyStorefrontCheckoutPreview {
  checkoutUrlPreview: string | null;
  cartId: string | null;
  currencyCode: string;
  estimatedTotal: Money;
  lineCount: number;
  ready: boolean;
}

export interface ShopifyStorefrontCartError {
  code: ShopifyStorefrontCartErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

export interface ShopifyStorefrontCartRequest {
  requestId: string;
  dryRun: true;
  lines: CartLineItem[];
  config?: Partial<ShopifyStorefrontClientConfig>;
  requestedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontCartResult {
  requestId: string;
  status: ShopifyStorefrontCartStatus;
  cartLines: ShopifyStorefrontCartLine[];
  lineCount: number;
  mutationPreview: ShopifyStorefrontCartMutationPreview | null;
  checkoutPreview: ShopifyStorefrontCheckoutPreview | null;
  errors: ShopifyStorefrontCartError[];
  respondedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyStorefrontCartCapabilities {
  dryRunOnly: true;
  liveCallsEnabled: false;
  adapterMode: ShopifyStorefrontCartAdapterMode;
}

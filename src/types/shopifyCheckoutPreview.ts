import type { Metadata, Money } from './common';
import type { CartLineItem } from './cartWorkspace';
import type { CheckoutIssueCategory } from './checkoutPreparation';
import type { ShopifyStorefrontClientConfig } from './shopifyStorefront';

export type ShopifyCheckoutPreviewAdapterMode = 'mock' | 'unavailable' | 'live';
export type ShopifyCheckoutPreviewStatus = 'not-started' | 'preview-ready' | 'blocked' | 'failed' | 'adapter-unavailable';
export type ShopifyCheckoutPreviewErrorCode = 'validation-error' | 'adapter-unavailable' | 'live-calls-disabled' | 'unknown';

/**
 * Extends the existing CheckoutIssueCategory (Checkout Preparation Layer)
 * with 'storefront' — the one new blocker/warning source this foundation
 * introduces (a missing/unavailable Shopify Storefront cart preview). No
 * existing CheckoutIssueCategory value or contract is redefined.
 */
export type ShopifyCheckoutPreviewIssueCategory = CheckoutIssueCategory | 'storefront';

export interface ShopifyCheckoutPreviewBlocker {
  code: string;
  category: ShopifyCheckoutPreviewIssueCategory;
  message: string;
  lineId?: string;
}

export interface ShopifyCheckoutPreviewWarning {
  code: string;
  category: ShopifyCheckoutPreviewIssueCategory;
  message: string;
  lineId?: string;
}

export interface ShopifyCheckoutPreviewError {
  code: ShopifyCheckoutPreviewErrorCode;
  message: string;
  fieldPath?: string;
  retryable: boolean;
  metadata?: Metadata;
}

/**
 * Display-only final checkout URL preview. checkoutUrlPreview is never a
 * real Shopify checkout URL — no live Storefront API call produces it, and
 * no redirect ever follows it. This is the last, read-only boundary before
 * a future live checkout redirect issue.
 */
export interface ShopifyCheckoutUrlPreview {
  checkoutUrlPreview: string | null;
  cartId: string | null;
  currencyCode: string;
  estimatedTotal: Money;
  lineCount: number;
  ready: boolean;
}

export interface ShopifyCheckoutPreviewRequest {
  requestId: string;
  lines?: CartLineItem[];
  config?: Partial<ShopifyStorefrontClientConfig>;
  requestedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyCheckoutPreviewResult {
  requestId: string;
  status: ShopifyCheckoutPreviewStatus;
  adapterMode: ShopifyCheckoutPreviewAdapterMode;
  urlPreview: ShopifyCheckoutUrlPreview | null;
  blockers: ShopifyCheckoutPreviewBlocker[];
  warnings: ShopifyCheckoutPreviewWarning[];
  errors: ShopifyCheckoutPreviewError[];
  checkoutRedirectDisabled: true;
  respondedAt?: string;
  metadata?: Metadata;
}

export interface ShopifyCheckoutPreviewCapabilities {
  dryRunOnly: true;
  liveCallsEnabled: false;
  checkoutRedirectDisabled: true;
  adapterMode: ShopifyCheckoutPreviewAdapterMode;
}

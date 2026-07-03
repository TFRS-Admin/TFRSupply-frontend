import type { ShopifyCheckoutPreviewError, ShopifyCheckoutPreviewStatus, ShopifyCheckoutUrlPreview, ShopifyStorefrontCheckoutPreview, ShopifyStorefrontClientConfig } from '@/types';

/**
 * Input the service hands to a ShopifyCheckoutPreviewAdapter after it has
 * already consumed Cart Workspace lines (via checkoutPreparationService) and
 * the Shopify Storefront Cart Adapter's checkout preview metadata (via
 * shopifyStorefrontCartService). The adapter's only job is deciding the
 * final status/errors/urlPreview for the given, already-computed inputs —
 * the same narrow request/response-translation role every adapter in this
 * repository plays. It never receives raw cart lines and never talks to
 * Shopify.
 */
export interface ShopifyCheckoutPreviewAdapterInput {
  requestId: string;
  hasBlockers: boolean;
  storefrontCheckoutPreview: ShopifyStorefrontCheckoutPreview | null;
  config?: Partial<ShopifyStorefrontClientConfig>;
}

export interface ShopifyCheckoutPreviewAdapterOutput {
  status: ShopifyCheckoutPreviewStatus;
  urlPreview: ShopifyCheckoutUrlPreview | null;
  errors: ShopifyCheckoutPreviewError[];
  respondedAt?: string;
  metadata?: { source?: string; attributes?: Record<string, string | number | boolean | null> };
}

export interface ShopifyCheckoutPreviewAdapter {
  execute(input: ShopifyCheckoutPreviewAdapterInput): Promise<ShopifyCheckoutPreviewAdapterOutput>;
}

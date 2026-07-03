import type { Money, ShopifyStorefrontCartLine, ShopifyStorefrontCartMutationPreview, ShopifyStorefrontCartResult, ShopifyStorefrontClientConfig } from '@/types';

/**
 * Input the service hands to a ShopifyStorefrontCartAdapter after it has
 * already mapped Cart Workspace lines to ShopifyStorefrontCartLine entries
 * (via the existing Commerce Foundation) and built the mutation preview.
 * The adapter's only job is deciding status/errors/checkout-preview
 * metadata for the given adapter mode — the same narrow
 * request/response-translation role CheckoutPreparationAdapter plays.
 */
export interface ShopifyStorefrontCartAdapterInput {
  requestId: string;
  cartLines: ShopifyStorefrontCartLine[];
  mutationPreview: ShopifyStorefrontCartMutationPreview;
  currencyCode: string;
  estimatedTotal: Money;
  config?: Partial<ShopifyStorefrontClientConfig>;
}

export interface ShopifyStorefrontCartAdapter {
  execute(input: ShopifyStorefrontCartAdapterInput): Promise<ShopifyStorefrontCartResult>;
}

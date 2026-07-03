import type { ShopifyStorefrontClientConfig, ShopifyStorefrontProductMapping, ShopifyStorefrontProductPreview, ShopifyStorefrontProductResult } from '@/types';

/**
 * Input the service hands to a ShopifyStorefrontProductAdapter after it has
 * already resolved the catalog Product (via the Catalog Service) into a
 * ShopifyStorefrontProductMapping and built the read-only query preview.
 * The adapter's only job is deciding status/errors for the given adapter
 * mode — the same narrow request/response-translation role
 * ShopifyStorefrontCartAdapter plays for cart lines.
 */
export interface ShopifyStorefrontProductAdapterInput {
  requestId: string;
  productId: string;
  mapping: ShopifyStorefrontProductMapping;
  preview: ShopifyStorefrontProductPreview;
  config?: Partial<ShopifyStorefrontClientConfig>;
}

export interface ShopifyStorefrontProductAdapter {
  execute(input: ShopifyStorefrontProductAdapterInput): Promise<ShopifyStorefrontProductResult>;
}

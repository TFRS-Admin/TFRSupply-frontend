import type { ShopifyStorefrontClientConfig, ShopifyStorefrontCollectionMapping, ShopifyStorefrontCollectionPreview, ShopifyStorefrontCollectionResult } from '@/types';

/**
 * Input the service hands to a ShopifyStorefrontCollectionAdapter after it
 * has already resolved the catalog Category (via the Catalog Service) into
 * a ShopifyStorefrontCollectionMapping and built the read-only query
 * preview. The adapter's only job is deciding status/errors for the given
 * adapter mode — the same narrow request/response-translation role
 * ShopifyStorefrontProductAdapter plays for products.
 */
export interface ShopifyStorefrontCollectionAdapterInput {
  requestId: string;
  categoryId: string;
  mapping: ShopifyStorefrontCollectionMapping;
  preview: ShopifyStorefrontCollectionPreview;
  config?: Partial<ShopifyStorefrontClientConfig>;
}

export interface ShopifyStorefrontCollectionAdapter {
  execute(input: ShopifyStorefrontCollectionAdapterInput): Promise<ShopifyStorefrontCollectionResult>;
}

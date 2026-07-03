import type { ShopifyStorefrontAvailability, ShopifyStorefrontClientConfig, ShopifyStorefrontRequest, ShopifyStorefrontResponse } from '@/types';

/**
 * The typed boundary every Storefront API adapter implementation must
 * satisfy. execute() runs a single already-validated ShopifyStorefrontRequest
 * and returns a ShopifyStorefrontResponse; getAvailability() reports whether
 * this adapter is currently able to serve live Storefront data without
 * performing any network call itself.
 */
export interface ShopifyStorefrontAdapter {
  execute(request: ShopifyStorefrontRequest): Promise<ShopifyStorefrontResponse>;
  getAvailability(config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontAvailability>;
}

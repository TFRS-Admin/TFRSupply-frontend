import type { ShopifyStorefrontAvailability, ShopifyStorefrontResponse } from '@/types';
import type { ShopifyStorefrontAdapter } from './shopifyStorefrontAdapter';

/**
 * Explicit opt-out adapter, following the unavailableCommerceAdapter /
 * unavailableCartWorkspaceAdapter pattern. This is the default adapter used
 * by shopifyStorefrontService when no adapter is injected — every request
 * reports adapter-unavailable and no Storefront API call is ever made.
 */
export const unavailableShopifyStorefrontAdapter: ShopifyStorefrontAdapter = {
  async execute(request): Promise<ShopifyStorefrontResponse> {
    return {
      requestId: request.requestId,
      status: 'adapter-unavailable',
      operationType: request.operation.operationType,
      data: null,
      errors: [{ code: 'adapter-unavailable', message: 'Shopify Storefront adapter is not connected; no live Storefront API call was made.', retryable: true }],
      metadata: { source: 'unavailable-shopify-storefront-adapter' },
    };
  },
  async getAvailability(): Promise<ShopifyStorefrontAvailability> {
    return {
      available: false,
      configured: false,
      adapterMode: 'unavailable',
      reason: 'No Shopify Storefront adapter is connected.',
      metadata: { source: 'unavailable-shopify-storefront-adapter' },
    };
  },
};

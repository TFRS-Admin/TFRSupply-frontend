import type { ShopifyOrderRequest, ShopifyOrderResult } from '@/types';

export interface ShopifyOrderAdapter {
  createOrder(request: ShopifyOrderRequest): Promise<ShopifyOrderResult>;
  getOrderSyncStatus(request: ShopifyOrderRequest): Promise<ShopifyOrderResult>;
}

function unavailableResult(request: ShopifyOrderRequest): ShopifyOrderResult {
  return { requestId: request.requestId, status: 'unavailable', syncStatus: 'adapter-unavailable', order: null, mapping: null, errors: [{ code: 'adapter-unavailable', message: 'Shopify order adapter is not connected; no live Shopify call was made.', retryable: true }] };
}

export const unavailableShopifyOrderAdapter: ShopifyOrderAdapter = {
  async createOrder(request) { return unavailableResult(request); },
  async getOrderSyncStatus(request) { return unavailableResult(request); },
};

export const mockShopifyOrderAdapter: ShopifyOrderAdapter = {
  async createOrder(request) {
    return { requestId: request.requestId, status: 'accepted', syncStatus: 'dry-run', order: null, mapping: null, errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-order-adapter' } };
  },
  async getOrderSyncStatus(request) {
    return { requestId: request.requestId, status: 'validated', syncStatus: 'dry-run', order: null, mapping: null, errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-order-adapter' } };
  },
};

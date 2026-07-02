import type { ShopifyFulfillmentRequest, ShopifyFulfillmentResult } from '@/types';

export interface ShopifyFulfillmentAdapter {
  createFulfillment(request: ShopifyFulfillmentRequest): Promise<ShopifyFulfillmentResult>;
  getFulfillmentSyncStatus(request: ShopifyFulfillmentRequest): Promise<ShopifyFulfillmentResult>;
}

function unavailableResult(request: ShopifyFulfillmentRequest): ShopifyFulfillmentResult {
  return { requestId: request.requestId, status: 'adapter-unavailable', items: [], shipment: null, mapping: null, errors: [{ code: 'adapter-unavailable', message: 'Shopify fulfillment adapter is not connected; no live Shopify call was made.', retryable: true }], syncedAt: request.requestedAt, metadata: { source: 'unavailable-shopify-fulfillment-adapter' } };
}

export const unavailableShopifyFulfillmentAdapter: ShopifyFulfillmentAdapter = {
  async createFulfillment(request) { return unavailableResult(request); },
  async getFulfillmentSyncStatus(request) { return unavailableResult(request); },
};

export const mockShopifyFulfillmentAdapter: ShopifyFulfillmentAdapter = {
  async createFulfillment(request) { return { requestId: request.requestId, status: 'dry-run', items: [], shipment: null, mapping: null, errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-fulfillment-adapter' } }; },
  async getFulfillmentSyncStatus(request) { return { requestId: request.requestId, status: 'validated', items: [], shipment: null, mapping: null, errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-fulfillment-adapter' } }; },
};

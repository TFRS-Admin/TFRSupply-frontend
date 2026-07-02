import type { ShopifyCustomerRequest, ShopifyCustomerResult } from '@/types';

export interface ShopifyCustomerAdapter {
  createCustomer(request: ShopifyCustomerRequest): Promise<ShopifyCustomerResult>;
  getCustomerSyncStatus(request: ShopifyCustomerRequest): Promise<ShopifyCustomerResult>;
}

function unavailableResult(request: ShopifyCustomerRequest): ShopifyCustomerResult {
  return { requestId: request.requestId, status: 'unavailable', syncStatus: 'adapter-unavailable', customer: null, mapping: null, errors: [{ code: 'adapter-unavailable', message: 'Shopify customer adapter is not connected; no live Shopify call was made.', retryable: true }] };
}

export const unavailableShopifyCustomerAdapter: ShopifyCustomerAdapter = {
  async createCustomer(request) { return unavailableResult(request); },
  async getCustomerSyncStatus(request) { return unavailableResult(request); },
};

export const mockShopifyCustomerAdapter: ShopifyCustomerAdapter = {
  async createCustomer(request) {
    return { requestId: request.requestId, status: 'accepted', syncStatus: 'dry-run', customer: null, mapping: null, errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-customer-adapter' } };
  },
  async getCustomerSyncStatus(request) {
    return { requestId: request.requestId, status: 'validated', syncStatus: 'dry-run', customer: null, mapping: null, errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-customer-adapter' } };
  },
};

import type { ShopifyInventorySyncRequest, ShopifyInventorySyncResult } from '@/types/shopifyInventory';

export interface ShopifyInventoryAdapter {
  syncInventory(request: ShopifyInventorySyncRequest): Promise<ShopifyInventorySyncResult>;
  getInventorySyncStatus(request: ShopifyInventorySyncRequest): Promise<ShopifyInventorySyncResult>;
}

function unavailableResult(request: ShopifyInventorySyncRequest): ShopifyInventorySyncResult {
  return { requestId: request.requestId, status: 'adapter-unavailable', items: [], mappings: [], errors: [{ code: 'adapter-unavailable', message: 'Shopify inventory adapter is not connected; no live Shopify call was made.', retryable: true }], syncedAt: request.requestedAt, metadata: { source: 'unavailable-shopify-inventory-adapter' } };
}

export const unavailableShopifyInventoryAdapter: ShopifyInventoryAdapter = {
  async syncInventory(request) { return unavailableResult(request); },
  async getInventorySyncStatus(request) { return unavailableResult(request); },
};

export const mockShopifyInventoryAdapter: ShopifyInventoryAdapter = {
  async syncInventory(request) { return { requestId: request.requestId, status: 'dry-run', items: [], mappings: [], errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-inventory-adapter' } }; },
  async getInventorySyncStatus(request) { return { requestId: request.requestId, status: 'validated', items: [], mappings: [], errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-inventory-adapter' } }; },
};

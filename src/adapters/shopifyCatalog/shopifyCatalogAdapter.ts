import type { ShopifyCatalogSyncRequest, ShopifyCatalogSyncResult } from '@/types';

export interface ShopifyCatalogAdapter {
  publishCatalog(request: ShopifyCatalogSyncRequest): Promise<ShopifyCatalogSyncResult>;
  getCatalogSyncStatus(request: ShopifyCatalogSyncRequest): Promise<ShopifyCatalogSyncResult>;
}

function unavailableResult(request: ShopifyCatalogSyncRequest): ShopifyCatalogSyncResult {
  return { requestId: request.requestId, status: 'adapter-unavailable', items: [], mappings: [], errors: [{ code: 'adapter-unavailable', message: 'Shopify catalog adapter is not connected; no live Shopify call was made.', retryable: true }], syncedAt: request.requestedAt, metadata: { source: 'unavailable-shopify-catalog-adapter' } };
}

export const unavailableShopifyCatalogAdapter: ShopifyCatalogAdapter = {
  async publishCatalog(request) { return unavailableResult(request); },
  async getCatalogSyncStatus(request) { return unavailableResult(request); },
};

export const mockShopifyCatalogAdapter: ShopifyCatalogAdapter = {
  async publishCatalog(request) { return { requestId: request.requestId, status: 'dry-run', items: [], mappings: [], errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-catalog-adapter' } }; },
  async getCatalogSyncStatus(request) { return { requestId: request.requestId, status: 'validated', items: [], mappings: [], errors: [], syncedAt: request.requestedAt ?? '2026-07-02T00:00:00.000Z', metadata: { source: 'mock-shopify-catalog-adapter' } }; },
};

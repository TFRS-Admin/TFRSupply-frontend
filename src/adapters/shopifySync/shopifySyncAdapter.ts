import type { ShopifySyncRequest, ShopifySyncResult } from '@/types';

export interface ShopifySyncAdapter {
  syncProduct(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  syncVariant(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  syncInventory(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  syncPricingReference(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  getSyncStatus(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
}

function pendingResult(request: ShopifySyncRequest): ShopifySyncResult {
  return {
    requestId: request.requestId,
    status: 'pending',
    subject: request.subject,
    payload: request.payload,
    errors: [{ code: 'adapter-unavailable', message: 'Shopify sync adapter is not connected.', retryable: true }],
    retry: request.retry,
  };
}

export const unavailableShopifySyncAdapter: ShopifySyncAdapter = {
  async syncProduct(request) { return pendingResult(request); },
  async syncVariant(request) { return pendingResult(request); },
  async syncInventory(request) { return pendingResult(request); },
  async syncPricingReference(request) { return pendingResult(request); },
  async getSyncStatus(request) { return pendingResult(request); },
};

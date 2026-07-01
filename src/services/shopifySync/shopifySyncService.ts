import { unavailableShopifySyncAdapter } from '@/adapters/shopifySync';
import type { ShopifySyncAdapter } from '@/adapters/shopifySync';
import { shopifySyncRequestSchema, shopifySyncResultSchema } from '@/schemas/shopifySync.schema';
import type { ShopifySyncRequest, ShopifySyncResult } from '@/types';

export interface ShopifySyncService {
  syncProduct(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  syncVariant(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  syncInventory(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  syncPricingReference(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
  getSyncStatus(request: ShopifySyncRequest): Promise<ShopifySyncResult>;
}

async function validateAndRun(request: ShopifySyncRequest, action: (validated: ShopifySyncRequest) => Promise<ShopifySyncResult>): Promise<ShopifySyncResult> {
  const validatedRequest = shopifySyncRequestSchema.parse(request);
  return shopifySyncResultSchema.parse(await action(validatedRequest));
}

export function createShopifySyncService(adapter: ShopifySyncAdapter = unavailableShopifySyncAdapter): ShopifySyncService {
  return {
    syncProduct: (request) => validateAndRun(request, adapter.syncProduct),
    syncVariant: (request) => validateAndRun(request, adapter.syncVariant),
    syncInventory: (request) => validateAndRun(request, adapter.syncInventory),
    syncPricingReference: (request) => validateAndRun(request, adapter.syncPricingReference),
    getSyncStatus: (request) => validateAndRun(request, adapter.getSyncStatus),
  };
}

export const shopifySyncService: ShopifySyncService = createShopifySyncService();

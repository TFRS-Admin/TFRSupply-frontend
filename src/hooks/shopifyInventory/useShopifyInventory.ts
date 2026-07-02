import { useCallback, useState } from 'react';
import { shopifyInventoryService } from '@/services/shopifyInventory';
import type { ShopifyInventorySyncRequest, ShopifyInventorySyncResult } from '@/types/shopifyInventory';

interface ShopifyInventoryState { result: ShopifyInventorySyncResult | null; loading: boolean; error: unknown; }
type ShopifyInventoryAction = (request: ShopifyInventorySyncRequest) => Promise<ShopifyInventorySyncResult>;

function useShopifyInventoryAction(action: ShopifyInventoryAction) {
  const [state, setState] = useState<ShopifyInventoryState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifyInventorySyncRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyInventory() { return useShopifyInventoryAction(shopifyInventoryService.syncInventory); }
export function useShopifyInventorySync() { return useShopifyInventoryAction(shopifyInventoryService.getInventorySyncStatus); }

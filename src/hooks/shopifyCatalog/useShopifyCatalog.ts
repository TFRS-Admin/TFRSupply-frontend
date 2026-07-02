import { useCallback, useState } from 'react';
import { shopifyCatalogService } from '@/services/shopifyCatalog';
import type { ShopifyCatalogSyncRequest, ShopifyCatalogSyncResult } from '@/types';

interface ShopifyCatalogState { result: ShopifyCatalogSyncResult | null; loading: boolean; error: unknown; }
type ShopifyCatalogAction = (request: ShopifyCatalogSyncRequest) => Promise<ShopifyCatalogSyncResult>;

function useShopifyCatalogAction(action: ShopifyCatalogAction) {
  const [state, setState] = useState<ShopifyCatalogState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifyCatalogSyncRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyCatalog() { return useShopifyCatalogAction(shopifyCatalogService.syncCatalog); }
export function useShopifyCatalogSync() { return useShopifyCatalogAction(shopifyCatalogService.getCatalogSyncStatus); }

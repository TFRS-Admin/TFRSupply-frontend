import { useCallback, useState } from 'react';
import { shopifySyncService } from '@/services/shopifySync';
import type { ShopifySyncRequest, ShopifySyncResult } from '@/types';

interface ShopifySyncState {
  result: ShopifySyncResult | null;
  loading: boolean;
  error: unknown;
}

type SyncAction = (request: ShopifySyncRequest) => Promise<ShopifySyncResult>;

function useShopifySyncAction(action: SyncAction) {
  const [state, setState] = useState<ShopifySyncState>({ result: null, loading: false, error: null });

  const run = useCallback(async (request: ShopifySyncRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await action(request);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, [action]);

  return { ...state, run };
}

export function useShopifyProductSync() { return useShopifySyncAction(shopifySyncService.syncProduct); }
export function useShopifyVariantSync() { return useShopifySyncAction(shopifySyncService.syncVariant); }
export function useShopifyInventorySync() { return useShopifySyncAction(shopifySyncService.syncInventory); }
export function useShopifyPricingReferenceSync() { return useShopifySyncAction(shopifySyncService.syncPricingReference); }
export function useShopifySyncStatus() { return useShopifySyncAction(shopifySyncService.getSyncStatus); }

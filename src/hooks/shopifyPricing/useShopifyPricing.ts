import { useCallback, useState } from 'react';
import { shopifyPricingService } from '@/services/shopifyPricing';
import type { ShopifyPricingSyncRequest, ShopifyPricingSyncResult } from '@/types/shopifyPricing';

interface ShopifyPricingState { result: ShopifyPricingSyncResult | null; loading: boolean; error: unknown; }
type ShopifyPricingAction = (request: ShopifyPricingSyncRequest) => Promise<ShopifyPricingSyncResult>;

function useShopifyPricingAction(action: ShopifyPricingAction) {
  const [state, setState] = useState<ShopifyPricingState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifyPricingSyncRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyPricing() { return useShopifyPricingAction(shopifyPricingService.syncPricing); }
export function useShopifyPricingSync() { return useShopifyPricingAction(shopifyPricingService.getPricingSyncStatus); }

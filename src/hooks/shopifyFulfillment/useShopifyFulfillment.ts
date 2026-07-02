import { useCallback, useState } from 'react';
import { shopifyFulfillmentService } from '@/services/shopifyFulfillment';
import type { ShopifyFulfillmentRequest, ShopifyFulfillmentResult } from '@/types';

interface ShopifyFulfillmentState { result: ShopifyFulfillmentResult | null; loading: boolean; error: unknown; }
type ShopifyFulfillmentAction = (request: ShopifyFulfillmentRequest) => Promise<ShopifyFulfillmentResult>;

function useShopifyFulfillmentAction(action: ShopifyFulfillmentAction) {
  const [state, setState] = useState<ShopifyFulfillmentState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifyFulfillmentRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyFulfillment() { return useShopifyFulfillmentAction(shopifyFulfillmentService.createFulfillment); }
export function useShopifyFulfillmentSync() { return useShopifyFulfillmentAction(shopifyFulfillmentService.getFulfillmentSyncStatus); }

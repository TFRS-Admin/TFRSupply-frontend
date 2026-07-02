import { useCallback, useState } from 'react';
import { shopifyOrderService } from '@/services/shopifyOrder';
import type { ShopifyOrderRequest, ShopifyOrderResult } from '@/types';

interface ShopifyOrderState { result: ShopifyOrderResult | null; loading: boolean; error: unknown; }
type ShopifyOrderAction = (request: ShopifyOrderRequest) => Promise<ShopifyOrderResult>;

function useShopifyOrderAction(action: ShopifyOrderAction) {
  const [state, setState] = useState<ShopifyOrderState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifyOrderRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyOrder() { return useShopifyOrderAction(shopifyOrderService.createOrder); }
export function useShopifyOrderSync() { return useShopifyOrderAction(shopifyOrderService.getOrderSyncStatus); }

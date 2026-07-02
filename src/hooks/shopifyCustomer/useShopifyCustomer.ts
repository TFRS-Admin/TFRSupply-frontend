import { useCallback, useState } from 'react';
import { shopifyCustomerService } from '@/services/shopifyCustomer';
import type { ShopifyCustomerRequest, ShopifyCustomerResult } from '@/types';

interface ShopifyCustomerState { result: ShopifyCustomerResult | null; loading: boolean; error: unknown; }
type ShopifyCustomerAction = (request: ShopifyCustomerRequest) => Promise<ShopifyCustomerResult>;

function useShopifyCustomerAction(action: ShopifyCustomerAction) {
  const [state, setState] = useState<ShopifyCustomerState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifyCustomerRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyCustomer() { return useShopifyCustomerAction(shopifyCustomerService.createCustomer); }
export function useShopifyCustomerSync() { return useShopifyCustomerAction(shopifyCustomerService.getCustomerSyncStatus); }

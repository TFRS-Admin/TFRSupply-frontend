import { useCallback, useState } from 'react';
import { shopifyWebhookService } from '@/services/shopifyWebhook';
import type { ShopifyWebhookEvent, ShopifyWebhookRequest, ShopifyWebhookResult } from '@/types';

interface ShopifyWebhookState { result: ShopifyWebhookResult | null; loading: boolean; error: unknown; }
type ShopifyWebhookAction<TInput> = (input: TInput) => Promise<ShopifyWebhookResult>;

function useShopifyWebhookAction<TInput>(action: ShopifyWebhookAction<TInput>) {
  const [state, setState] = useState<ShopifyWebhookState>({ result: null, loading: false, error: null });
  const run = useCallback(async (input: TInput) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await action(input); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, [action]);
  return { ...state, run };
}

export function useShopifyWebhook() { return useShopifyWebhookAction<ShopifyWebhookRequest>(shopifyWebhookService.receiveWebhook); }
export function useShopifyWebhookRouting() { return useShopifyWebhookAction<ShopifyWebhookEvent>(shopifyWebhookService.routeWebhookEvent); }

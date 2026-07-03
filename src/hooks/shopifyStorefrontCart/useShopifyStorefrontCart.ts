import { useCallback, useEffect, useState } from 'react';
import { cartWorkspaceService } from '@/services/cartWorkspace';
import { shopifyStorefrontCartService } from '@/services/shopifyStorefrontCart';
import type { CartLineItem, ShopifyStorefrontCartRequest, ShopifyStorefrontCartResult, ShopifyStorefrontClientConfig } from '@/types';

interface ShopifyStorefrontCartState {
  result: ShopifyStorefrontCartResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for running a single already-built
 * ShopifyStorefrontCartRequest through shopifyStorefrontCartService.execute().
 * Owns loading/error state only — request validation, cart-line mapping,
 * mutation preview generation, and adapter selection all live in the
 * service. With the default unavailable adapter, run() always resolves to
 * an adapter-unavailable result and never performs a live Storefront API
 * call.
 */
export function useShopifyStorefrontCart() {
  const [state, setState] = useState<ShopifyStorefrontCartState>({ result: null, loading: false, error: null });

  const run = useCallback(async (request: ShopifyStorefrontCartRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontCartService.execute(request);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  const buildRequest = useCallback((lines: CartLineItem[], overrides?: Partial<Omit<ShopifyStorefrontCartRequest, 'lines' | 'dryRun'>>) => {
    return shopifyStorefrontCartService.buildRequest(lines, overrides);
  }, []);

  return { ...state, run, buildRequest };
}

interface ShopifyStorefrontCartPreviewState {
  result: ShopifyStorefrontCartResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the /cart Checkout Readiness panel's
 * Storefront cart preview: reads the live Cart Workspace state via
 * shopifyStorefrontCartService.previewCart() and re-evaluates whenever a
 * line is added, updated, or removed, mirroring the same
 * cartWorkspaceService pub/sub useCheckoutPreparation() already subscribes
 * to. Owns loading/error state only — every mapping, mutation-preview, and
 * checkout-preview decision lives in the service.
 */
export function useShopifyStorefrontCartPreview(config?: Partial<ShopifyStorefrontClientConfig>) {
  const [state, setState] = useState<ShopifyStorefrontCartPreviewState>({ result: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontCartService.previewCart(undefined, config);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, [config?.storeDomain, config?.storefrontAccessToken, config?.apiVersion]);

  useEffect(() => {
    refresh();
    const unsubscribe = cartWorkspaceService.subscribe(() => {
      refresh();
    });
    return unsubscribe;
  }, [refresh]);

  return { ...state, refresh };
}

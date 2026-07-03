import { useCallback, useEffect, useState } from 'react';
import { cartWorkspaceService } from '@/services/cartWorkspace';
import { shopifyCheckoutPreviewService } from '@/services/shopifyCheckoutPreview';
import type { ShopifyCheckoutPreviewResult, ShopifyStorefrontClientConfig } from '@/types';

interface ShopifyCheckoutPreviewState {
  result: ShopifyCheckoutPreviewResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the /cart Checkout Readiness panel's final
 * checkout URL preview: reads the live Cart Workspace state via
 * shopifyCheckoutPreviewService.previewCheckout() and re-evaluates whenever
 * a line is added, updated, or removed, mirroring the same
 * cartWorkspaceService pub/sub useCheckoutPreparation() and
 * useShopifyStorefrontCartPreview() already subscribe to. Owns loading/error
 * state only — every blocker, warning, adapter-mode, and URL-preview
 * decision lives in the service. With the default unavailable adapter,
 * refresh() always resolves to an adapter-unavailable result and never
 * performs a live Storefront API call or checkout redirect.
 */
export function useShopifyCheckoutPreview(config?: Partial<ShopifyStorefrontClientConfig>) {
  const [state, setState] = useState<ShopifyCheckoutPreviewState>({ result: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyCheckoutPreviewService.previewCheckout(undefined, config);
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

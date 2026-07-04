import { useCallback, useState } from 'react';
import { shopifyStorefrontRuntimeService } from '@/services/shopifyStorefrontRuntime';
import type { ShopifyStorefrontRuntimeStatus } from '@/types';

interface ShopifyStorefrontRuntimeState {
  status: ShopifyStorefrontRuntimeStatus | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the Storefront Runtime Configuration status
 * (Storefront Runtime Readiness). Computes once on mount via
 * shopifyStorefrontRuntimeService.getRuntimeStatus() — which only reads
 * existing foundations' getCapabilities()/env config and never performs a
 * live Shopify API call — and exposes refresh() for manual re-checks.
 */
export function useShopifyStorefrontRuntimeStatus() {
  const [state, setState] = useState<ShopifyStorefrontRuntimeState>(() => {
    try {
      return { status: shopifyStorefrontRuntimeService.getRuntimeStatus(), loading: false, error: null };
    } catch (error) {
      return { status: null, loading: false, error };
    }
  });

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const status = shopifyStorefrontRuntimeService.getRuntimeStatus();
      setState({ status, loading: false, error: null });
      return status;
    } catch (error) {
      setState({ status: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, refresh };
}

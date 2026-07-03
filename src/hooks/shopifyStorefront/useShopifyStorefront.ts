import { useCallback, useEffect, useState } from 'react';
import { shopifyStorefrontService } from '@/services/shopifyStorefront';
import type { ShopifyStorefrontAvailability, ShopifyStorefrontClientConfig, ShopifyStorefrontRequest, ShopifyStorefrontResponse } from '@/types';

interface ShopifyStorefrontState {
  result: ShopifyStorefrontResponse | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for running a single already-built
 * ShopifyStorefrontRequest through shopifyStorefrontService.execute(). Owns
 * loading/error state only — request validation, response normalization,
 * and adapter selection all live in the service. With the default
 * unavailable adapter, run() always resolves to an adapter-unavailable
 * response and never performs a live Storefront API call.
 */
export function useShopifyStorefront() {
  const [state, setState] = useState<ShopifyStorefrontState>({ result: null, loading: false, error: null });

  const run = useCallback(async (request: ShopifyStorefrontRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontService.execute(request);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, run };
}

interface StorefrontAvailabilityState {
  availability: ShopifyStorefrontAvailability | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for shopifyStorefrontService.getAvailability(),
 * intended for readiness/status panels (for example the Checkout Readiness
 * panel at /cart) that want to display whether a live Storefront adapter is
 * connected without changing any existing readiness decision. Fetches once
 * on mount and exposes refresh() for manual re-checks.
 */
export function useStorefrontAvailability(config?: Partial<ShopifyStorefrontClientConfig>) {
  const [state, setState] = useState<StorefrontAvailabilityState>({ availability: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const availability = await shopifyStorefrontService.getAvailability(config);
      setState({ availability, loading: false, error: null });
      return availability;
    } catch (error) {
      setState({ availability: null, loading: false, error });
      throw error;
    }
  }, [config?.storeDomain, config?.storefrontAccessToken, config?.apiVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

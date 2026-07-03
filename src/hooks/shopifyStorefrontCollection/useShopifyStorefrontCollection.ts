import { useCallback, useEffect, useState } from 'react';
import { shopifyStorefrontCollectionService } from '@/services/shopifyStorefrontCollection';
import type { ShopifyStorefrontClientConfig, ShopifyStorefrontCollectionRequest, ShopifyStorefrontCollectionResult } from '@/types';

interface ShopifyStorefrontCollectionState {
  result: ShopifyStorefrontCollectionResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for running a single already-built
 * ShopifyStorefrontCollectionRequest through
 * shopifyStorefrontCollectionService.execute(). Owns loading/error state
 * only — request validation, mapping derivation, preview generation, and
 * adapter selection all live in the service. With the default unavailable
 * adapter, run() always resolves to an adapter-unavailable result and
 * never performs a live Storefront API call.
 */
export function useShopifyStorefrontCollection() {
  const [state, setState] = useState<ShopifyStorefrontCollectionState>({ result: null, loading: false, error: null });

  const run = useCallback(async (request: ShopifyStorefrontCollectionRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontCollectionService.execute(request);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  const buildRequest = useCallback((categoryId: string, overrides?: Partial<Omit<ShopifyStorefrontCollectionRequest, 'categoryId' | 'dryRun'>>) => {
    return shopifyStorefrontCollectionService.buildRequest(categoryId, overrides);
  }, []);

  return { ...state, run, buildRequest };
}

interface ShopifyStorefrontCollectionPreviewState {
  result: ShopifyStorefrontCollectionResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the Category Storefront Collection panel:
 * reads shopifyStorefrontCollectionService.previewCollection() for a
 * single categoryId and re-fetches whenever categoryId changes. Owns
 * loading/error state only — every mapping and preview decision lives in
 * the service. Fetches once on mount (and whenever categoryId changes) and
 * exposes refresh() for manual re-checks.
 */
export function useShopifyStorefrontCollectionPreview(categoryId: string | null | undefined, config?: Partial<ShopifyStorefrontClientConfig>) {
  const [state, setState] = useState<ShopifyStorefrontCollectionPreviewState>({ result: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    if (!categoryId) {
      setState({ result: null, loading: false, error: null });
      return null;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontCollectionService.previewCollection(categoryId, config);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, [categoryId, config?.storeDomain, config?.storefrontAccessToken, config?.apiVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

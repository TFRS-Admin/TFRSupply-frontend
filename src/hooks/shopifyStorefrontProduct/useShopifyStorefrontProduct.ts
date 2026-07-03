import { useCallback, useEffect, useState } from 'react';
import { shopifyStorefrontProductService } from '@/services/shopifyStorefrontProduct';
import type { ShopifyStorefrontClientConfig, ShopifyStorefrontProductRequest, ShopifyStorefrontProductResult } from '@/types';

interface ShopifyStorefrontProductState {
  result: ShopifyStorefrontProductResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for running a single already-built
 * ShopifyStorefrontProductRequest through
 * shopifyStorefrontProductService.execute(). Owns loading/error state
 * only — request validation, mapping derivation, preview generation, and
 * adapter selection all live in the service. With the default unavailable
 * adapter, run() always resolves to an adapter-unavailable result and
 * never performs a live Storefront API call.
 */
export function useShopifyStorefrontProduct() {
  const [state, setState] = useState<ShopifyStorefrontProductState>({ result: null, loading: false, error: null });

  const run = useCallback(async (request: ShopifyStorefrontProductRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontProductService.execute(request);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  const buildRequest = useCallback((productId: string, overrides?: Partial<Omit<ShopifyStorefrontProductRequest, 'productId' | 'dryRun'>>) => {
    return shopifyStorefrontProductService.buildRequest(productId, overrides);
  }, []);

  return { ...state, run, buildRequest };
}

interface ShopifyStorefrontProductPreviewState {
  result: ShopifyStorefrontProductResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the Product Detail Storefront Product
 * panel: reads shopifyStorefrontProductService.previewProduct() for a
 * single productId and re-fetches whenever productId changes. Owns
 * loading/error state only — every mapping and preview decision lives in
 * the service. Fetches once on mount (and whenever productId changes) and
 * exposes refresh() for manual re-checks.
 */
export function useShopifyStorefrontProductPreview(productId: string | null | undefined, config?: Partial<ShopifyStorefrontClientConfig>) {
  const [state, setState] = useState<ShopifyStorefrontProductPreviewState>({ result: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    if (!productId) {
      setState({ result: null, loading: false, error: null });
      return null;
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontProductService.previewProduct(productId, config);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, [productId, config?.storeDomain, config?.storefrontAccessToken, config?.apiVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

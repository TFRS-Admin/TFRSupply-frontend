import { useCallback, useEffect, useState } from 'react';
import { cartAdapterService } from '@/services/cartAdapter';
import { cartWorkspaceService } from '@/services/cartWorkspace';
import type { CartAdapterStatusSnapshot, ShopifyStorefrontClientConfig } from '@/types';

interface CartAdapterStatusState {
  status: CartAdapterStatusSnapshot;
  loading: boolean;
  error: unknown;
}

/**
 * Shared React-facing entry point for cart mutation readiness, consumed by
 * both the /dev/storefront dashboard's Cart Readiness section and the /cart
 * Checkout Readiness panel — one hook, two read-only display surfaces, so
 * neither can drift from the other's adapter-mode/mapping-validation
 * output. Owns loading/error state only; adapter selection, mutation
 * request preview, mapping validation, and diagnostics all live in
 * cartAdapterService. refresh() re-runs previewMutation() against the live
 * Cart Workspace state and re-subscribes whenever a line is added, updated,
 * or removed, mirroring useShopifyStorefrontCartPreview(). With the default
 * mock/unavailable adapter, this never performs a live Shopify API call.
 */
export function useCartAdapterStatus() {
  const [state, setState] = useState<CartAdapterStatusState>(() => ({
    status: cartAdapterService.getStatus(),
    loading: false,
    error: null,
  }));

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      await cartAdapterService.previewMutation();
      const status = cartAdapterService.getStatus();
      setState({ status, loading: false, error: null });
      return status;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }));
      throw error;
    }
  }, []);

  const activateLiveAdapter = useCallback((config: Partial<ShopifyStorefrontClientConfig>) => {
    cartAdapterService.configureLiveAdapter(config);
    setState({ status: cartAdapterService.getStatus(), loading: false, error: null });
  }, []);

  const resetToDefaultAdapter = useCallback(() => {
    cartAdapterService.resetToDefaultAdapter();
    setState({ status: cartAdapterService.getStatus(), loading: false, error: null });
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = cartWorkspaceService.subscribe(() => {
      refresh();
    });
    return unsubscribe;
  }, [refresh]);

  return { ...state, refresh, activateLiveAdapter, resetToDefaultAdapter };
}

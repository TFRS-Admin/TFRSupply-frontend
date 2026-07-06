import { useCallback, useState } from 'react';
import { shopifyStorefrontCartCreateService } from '@/services/shopifyStorefrontCart';
import type { CartLineItem, ShopifyStorefrontCartResult } from '@/types';

interface ShopifyStorefrontCartCreateState {
  result: ShopifyStorefrontCartResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for real Shopify cart creation: runs
 * shopifyStorefrontCartCreateService.createCart() (Storefront API
 * cartCreate) against the live Cart Workspace state and owns loading/error
 * state only. Unlike useShopifyStorefrontCartPreview(), this performs a
 * real network call and creates a real Shopify cart on every invocation —
 * callers should only invoke createCart() in response to an explicit user
 * checkout action, never on mount or on cart-line change.
 */
export function useShopifyStorefrontCartCreate() {
  const [state, setState] = useState<ShopifyStorefrontCartCreateState>({ result: null, loading: false, error: null });

  const createCart = useCallback(async (lines?: CartLineItem[]) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyStorefrontCartCreateService.createCart(lines);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, createCart };
}

import { useCallback, useEffect, useState } from 'react';
import { cartWorkspaceService } from '@/services/cartWorkspace';
import type { CartCheckoutPreparationResult, CartLineInput, CartState } from '@/types';

interface CartWorkspaceState {
  data: CartState | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the Cart Workspace at /cart and any other
 * consumer of the full cart line list. Owns loading/error state only —
 * totals, validation, and checkout preparation all live in
 * cartWorkspaceService. Subscribes to the service's pub/sub so this hook
 * re-syncs when another component (for example the Mini Cart) mutates the
 * shared in-memory cart.
 */
export function useCartWorkspace() {
  const [state, setState] = useState<CartWorkspaceState>({ data: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await cartWorkspaceService.getState();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = cartWorkspaceService.subscribe(() => {
      refresh();
    });
    return unsubscribe;
  }, [refresh]);

  const addLine = useCallback(async (input: CartLineInput) => {
    const data = await cartWorkspaceService.addLine(input);
    setState({ data, loading: false, error: null });
    return data;
  }, []);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    const data = await cartWorkspaceService.updateQuantity(lineId, quantity);
    setState({ data, loading: false, error: null });
    return data;
  }, []);

  const removeLine = useCallback(async (lineId: string) => {
    const data = await cartWorkspaceService.removeLine(lineId);
    setState({ data, loading: false, error: null });
    return data;
  }, []);

  const clearCart = useCallback(async () => {
    const data = await cartWorkspaceService.clearCart();
    setState({ data, loading: false, error: null });
    return data;
  }, []);

  const prepareCheckout = useCallback((): Promise<CartCheckoutPreparationResult> => {
    return cartWorkspaceService.prepareCheckout();
  }, []);

  return { ...state, refresh, addLine, updateQuantity, removeLine, clearCart, prepareCheckout };
}

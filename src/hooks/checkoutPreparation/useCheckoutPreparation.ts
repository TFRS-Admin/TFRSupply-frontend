import { useCallback, useEffect, useState } from 'react';
import { cartWorkspaceService } from '@/services/cartWorkspace';
import { checkoutPreparationService } from '@/services/checkoutPreparation';
import type { CheckoutPreparationResult } from '@/types';

interface CheckoutPreparationState {
  data: CheckoutPreparationResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the /cart Checkout Readiness panel. Owns
 * loading/error state only — every readiness decision and the payload
 * preview come from checkoutPreparationService. Subscribes to the same
 * cartWorkspaceService pub/sub the Cart Workspace uses so the readiness
 * panel re-evaluates whenever a line is added, updated, or removed.
 */
export function useCheckoutPreparation() {
  const [state, setState] = useState<CheckoutPreparationState>({ data: null, loading: false, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await checkoutPreparationService.prepareCheckout();
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

  return { ...state, refresh };
}

import { useEffect, useState } from 'react';
import { cartWorkspaceService } from '@/services/cartWorkspace';
import type { CartSummary } from '@/types';

interface MiniCartState {
  summary: CartSummary | null;
  loading: boolean;
  error: unknown;
}

/**
 * Lightweight, header-friendly view of the shared in-memory cart. Reads the
 * same cartWorkspaceService singleton as useCartWorkspace() and re-syncs
 * through the service's pub/sub whenever the full Cart Workspace (or any
 * other consumer) mutates a line, so the Mini Cart badge and quick subtotal
 * never drift from the Cart Workspace page.
 */
export function useMiniCart() {
  const [state, setState] = useState<MiniCartState>({ summary: null, loading: true, error: null });

  useEffect(() => {
    let active = true;

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const { summary } = await cartWorkspaceService.getState();
        if (active) setState({ summary, loading: false, error: null });
      } catch (error) {
        if (active) setState({ summary: null, loading: false, error });
      }
    }

    load();
    const unsubscribe = cartWorkspaceService.subscribe(load);

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return state;
}

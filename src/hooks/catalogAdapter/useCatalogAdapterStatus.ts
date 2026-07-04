import { useCallback, useState } from 'react';
import { catalogAdapterService } from '@/services/catalogAdapter';
import type { CatalogAdapterStatusSnapshot, ShopifyStorefrontClientConfig } from '@/types';

interface CatalogAdapterStatusState {
  status: CatalogAdapterStatusSnapshot;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the /dev/storefront dashboard. Owns
 * loading/error state only — adapter selection, sync orchestration, and
 * fallback decisions all live in catalogAdapterService. `sync()` never
 * throws from the service itself, but this hook still guards against
 * unexpected rejects the same way useStorefrontAvailability() does.
 */
export function useCatalogAdapterStatus() {
  const [state, setState] = useState<CatalogAdapterStatusState>(() => ({
    status: catalogAdapterService.getStatus(),
    loading: false,
    error: null,
  }));

  const sync = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const status = await catalogAdapterService.sync();
      setState({ status, loading: false, error: null });
      return status;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }));
      throw error;
    }
  }, []);

  const activateLiveAdapter = useCallback((config: Partial<ShopifyStorefrontClientConfig>) => {
    catalogAdapterService.configureLiveAdapter(config);
    setState({ status: catalogAdapterService.getStatus(), loading: false, error: null });
  }, []);

  const resetToDefaultAdapter = useCallback(() => {
    catalogAdapterService.resetToDefaultAdapter();
    setState({ status: catalogAdapterService.getStatus(), loading: false, error: null });
  }, []);

  return { ...state, sync, activateLiveAdapter, resetToDefaultAdapter };
}

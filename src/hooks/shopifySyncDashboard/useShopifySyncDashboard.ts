import { useCallback, useState } from 'react';
import { shopifySyncDashboardService } from '@/services/shopifySyncDashboard';
import type { ShopifySyncDashboardData } from '@/types/shopifySyncDashboard';

interface ShopifySyncDashboardState {
  data: ShopifySyncDashboardData | null;
  loading: boolean;
  error: unknown;
}

export function useShopifySyncDashboard() {
  const [state, setState] = useState<ShopifySyncDashboardState>({ data: null, loading: false, error: null });

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await shopifySyncDashboardService.loadDashboard();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, loadDashboard };
}

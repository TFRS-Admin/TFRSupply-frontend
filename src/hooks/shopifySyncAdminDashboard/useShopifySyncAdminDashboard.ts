import { useCallback, useState } from 'react';
import { shopifySyncAdminDashboardService } from '@/services/shopifySyncAdminDashboard';
import type { ShopifySyncAdminDashboardData } from '@/types/shopifySyncAdminDashboard';

interface ShopifySyncAdminDashboardState {
  data: ShopifySyncAdminDashboardData | null;
  loading: boolean;
  error: unknown;
}

export function useShopifySyncAdminDashboard() {
  const [state, setState] = useState<ShopifySyncAdminDashboardState>({ data: null, loading: false, error: null });

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await shopifySyncAdminDashboardService.loadDashboard();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, loadDashboard };
}

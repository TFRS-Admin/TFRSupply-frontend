import { useCallback, useState } from 'react';
import { adminSalesDashboardService } from '@/services/adminSalesDashboard';
import type { AdminSalesDashboardData } from '@/types/adminSalesDashboard';

interface AdminSalesDashboardState {
  data: AdminSalesDashboardData | null;
  loading: boolean;
  error: unknown;
}

export function useAdminSalesDashboard() {
  const [state, setState] = useState<AdminSalesDashboardState>({ data: null, loading: false, error: null });

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await adminSalesDashboardService.loadDashboard();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, loadDashboard };
}

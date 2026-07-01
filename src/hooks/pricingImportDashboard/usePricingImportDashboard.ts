import { useCallback, useState } from 'react';
import { pricingImportDashboardService } from '@/services/pricingImportDashboard';
import type { PricingImportDashboardData } from '@/types/pricingImportDashboard';

interface PricingImportDashboardState {
  data: PricingImportDashboardData | null;
  loading: boolean;
  error: unknown;
}

export function usePricingImportDashboard() {
  const [state, setState] = useState<PricingImportDashboardState>({ data: null, loading: false, error: null });

  const loadDashboard = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await pricingImportDashboardService.loadDashboard();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, loadDashboard };
}

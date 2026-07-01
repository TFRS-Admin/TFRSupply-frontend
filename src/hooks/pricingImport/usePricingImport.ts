import { useCallback, useState } from 'react';
import { pricingImportService } from '@/services/pricingImport';
import type { PricingImportRequest, PricingImportResult } from '@/types/pricingImport';

interface PricingImportState {
  result: PricingImportResult | null;
  loading: boolean;
  error: unknown;
}

export function usePricingImport() {
  const [state, setState] = useState<PricingImportState>({ result: null, loading: false, error: null });

  const importPricing = useCallback(async <TInput,>(request: PricingImportRequest<TInput>) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await pricingImportService.importPricing(request);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, importPricing };
}

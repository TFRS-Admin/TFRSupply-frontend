import { useCallback, useState } from 'react';
import { quoteBuilderWorkspaceService } from '@/services/quoteBuilderWorkspace';
import type { QuoteBuilderWorkspaceScenarioResult } from '@/services/quoteBuilderWorkspace';

interface QuoteBuilderWorkspaceState {
  data: QuoteBuilderWorkspaceScenarioResult[] | null;
  loading: boolean;
  error: unknown;
}

export function useQuoteBuilderWorkspace() {
  const [state, setState] = useState<QuoteBuilderWorkspaceState>({ data: null, loading: false, error: null });

  const loadScenarios = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await quoteBuilderWorkspaceService.loadScenarios();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, loadScenarios };
}

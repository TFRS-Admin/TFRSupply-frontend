import { useCallback, useMemo, useState } from 'react';
import { shopifySyncOrchestratorService } from '@/services/shopifySyncOrchestrator';
import type { ShopifySyncExecutionPlan, ShopifySyncOrchestratorRequest, ShopifySyncOrchestratorResult } from '@/types';

interface ShopifySyncOrchestratorState { result: ShopifySyncOrchestratorResult | null; loading: boolean; error: unknown; }

export function useShopifySyncOrchestrator() {
  const [state, setState] = useState<ShopifySyncOrchestratorState>({ result: null, loading: false, error: null });
  const run = useCallback(async (request: ShopifySyncOrchestratorRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try { const result = await shopifySyncOrchestratorService.orchestrate(request); setState({ result, loading: false, error: null }); return result; }
    catch (error) { setState({ result: null, loading: false, error }); throw error; }
  }, []);
  return { ...state, run };
}

export function useShopifySyncExecutionPlan(request: ShopifySyncOrchestratorRequest | null | undefined): ShopifySyncExecutionPlan | null {
  return useMemo(() => (request ? shopifySyncOrchestratorService.buildExecutionPlan(request) : null), [request]);
}

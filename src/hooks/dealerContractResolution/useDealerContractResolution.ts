import { useEffect, useState } from 'react';
import { dealerContractResolutionService } from '@/services/dealerContractResolution';
import type { DealerContractResolutionRequest, DealerContractResolutionResult } from '@/types';

interface DealerContractResolutionState {
  result: DealerContractResolutionResult | null;
  loading: boolean;
  error: unknown;
}

export function useDealerContractResolution(request: DealerContractResolutionRequest | null | undefined): DealerContractResolutionState {
  const [state, setState] = useState<DealerContractResolutionState>({ result: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    if (!request) {
      setState({ result: null, loading: false, error: null });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    dealerContractResolutionService.resolve(request).then((result) => {
      if (active) setState({ result, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ result: null, loading: false, error });
    });
    return () => { active = false; };
  }, [request]);

  return state;
}

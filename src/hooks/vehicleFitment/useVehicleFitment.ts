import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { vehicleFitmentService } from '@/services/vehicleFitment';
import type { FitmentRequest, FitmentResult, PackageFitmentRequest, ProductFitmentRequest } from '@/types';

interface FitmentResourceState {
  result: FitmentResult | null;
  loading: boolean;
  error: unknown;
}

function useFitmentResource(load: () => Promise<FitmentResult> | null, dependencies: DependencyList): FitmentResourceState {
  const [state, setState] = useState<FitmentResourceState>({ result: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    const pending = load();
    if (!pending) {
      setState({ result: null, loading: false, error: null });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    pending.then((result) => {
      if (active) setState({ result, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ result: null, loading: false, error });
    });
    return () => { active = false; };
  }, dependencies);

  return state;
}

export function useVehicleFitment(request: FitmentRequest | null | undefined): FitmentResourceState {
  return useFitmentResource(() => (request ? vehicleFitmentService.evaluateFitment(request) : null), [request]);
}

export function useProductFitment(request: ProductFitmentRequest | null | undefined): FitmentResourceState {
  return useFitmentResource(() => (request ? vehicleFitmentService.evaluateProductCompatibility(request) : null), [request]);
}

export function usePackageFitment(request: PackageFitmentRequest | null | undefined): FitmentResourceState {
  return useFitmentResource(() => (request ? vehicleFitmentService.evaluatePackageCompatibility(request) : null), [request]);
}

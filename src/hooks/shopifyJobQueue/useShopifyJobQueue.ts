import { useCallback, useMemo, useState } from 'react';
import { shopifyJobQueueService } from '@/services/shopifyJobQueue';
import type { ShopifyJob, ShopifyJobRequest, ShopifyJobResult } from '@/types';

interface ShopifyJobQueueState {
  results: ShopifyJobResult[];
  loading: boolean;
  error: unknown;
}

export function useShopifyJobQueue() {
  const [state, setState] = useState<ShopifyJobQueueState>({ results: [], loading: false, error: null });

  const queueJob = useCallback(async (request: ShopifyJobRequest) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyJobQueueService.queueJob(request);
      setState((current) => ({ results: [...current.results, result], loading: false, error: null }));
      return result;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }));
      throw error;
    }
  }, []);

  const queueJobs = useCallback(async (requests: ShopifyJobRequest[]) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const results = await shopifyJobQueueService.queueJobs(requests);
      setState((current) => ({ results: [...current.results, ...results], loading: false, error: null }));
      return results;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }));
      throw error;
    }
  }, []);

  const cancelJob = useCallback(async (jobId: string, requestId: string) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await shopifyJobQueueService.cancelJob(jobId, requestId);
      setState((current) => ({ results: [...current.results, result], loading: false, error: null }));
      return result;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }));
      throw error;
    }
  }, []);

  return { ...state, queueJob, queueJobs, cancelJob };
}

export function useShopifyJobDefinition(request: ShopifyJobRequest | null | undefined): ShopifyJob | null {
  return useMemo(() => (request ? shopifyJobQueueService.buildJobDefinition(request) : null), [request]);
}

interface ShopifyJobStatusState {
  result: ShopifyJobResult | null;
  loading: boolean;
  error: unknown;
}

export function useShopifyJobStatus() {
  const [state, setState] = useState<ShopifyJobStatusState>({ result: null, loading: false, error: null });

  const refresh = useCallback(async (jobId: string, requestId: string) => {
    setState({ result: null, loading: true, error: null });
    try {
      const result = await shopifyJobQueueService.getJobStatus(jobId, requestId);
      setState({ result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ result: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, refresh };
}

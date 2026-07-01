import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { pricingService } from '@/services/pricing';
import type { BundlePricing, BundlePricingInput, ContractPrice, DealerCost, ListPrice, PricingContext, PricingResolution, PricingSubject, QuotePricingInput, QuotePricingResult } from '@/types';

interface PricingResourceState<T> {
  result: PricingResolution<T> | null;
  data: T | null;
  loading: boolean;
  error: unknown;
}

function usePricingResource<T>(load: () => Promise<PricingResolution<T>> | null, dependencies: DependencyList): PricingResourceState<T> {
  const [state, setState] = useState<PricingResourceState<T>>({ result: null, data: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    const pending = load();
    if (!pending) {
      setState({ result: null, data: null, loading: false, error: null });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    pending.then((result) => {
      if (active) setState({ result, data: result.data, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ result: null, data: null, loading: false, error });
    });
    return () => { active = false; };
  }, dependencies);

  return state;
}

export function useListPrice(subject: PricingSubject | null | undefined, context: PricingContext | null | undefined): PricingResourceState<ListPrice> {
  return usePricingResource(() => (subject && context ? pricingService.getListPrice(subject, context) : null), [subject, context]);
}

export function useDealerCost(subject: PricingSubject | null | undefined, context: PricingContext | null | undefined): PricingResourceState<DealerCost> {
  return usePricingResource(() => (subject && context ? pricingService.getDealerCost(subject, context) : null), [subject, context]);
}

export function useContractPrice(subject: PricingSubject | null | undefined, context: PricingContext | null | undefined): PricingResourceState<ContractPrice> {
  return usePricingResource(() => (subject && context ? pricingService.getContractPrice(subject, context) : null), [subject, context]);
}

export function useBundlePricing(input: BundlePricingInput | null | undefined): PricingResourceState<BundlePricing> {
  return usePricingResource(() => (input ? pricingService.priceBundle(input) : null), [input]);
}

export function useQuotePricing(input: QuotePricingInput | null | undefined): PricingResourceState<QuotePricingResult> {
  return usePricingResource(() => (input ? pricingService.priceQuote(input) : null), [input]);
}

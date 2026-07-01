import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { quoteBuilderService } from '@/services/quoteBuilder';
import type { QuoteAssemblyInput, QuoteAssemblyResult, QuoteDraft, QuoteValidationResult } from '@/types';

interface QuoteBuilderResourceState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

function useQuoteBuilderResource<T>(load: () => Promise<T> | null, dependencies: DependencyList): QuoteBuilderResourceState<T> {
  const [state, setState] = useState<QuoteBuilderResourceState<T>>({ data: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    const pending = load();
    if (!pending) {
      setState({ data: null, loading: false, error: null });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    pending.then((data) => {
      if (active) setState({ data, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ data: null, loading: false, error });
    });
    return () => { active = false; };
  }, dependencies);

  return state;
}

export function useQuoteDraft(draftId: string | null | undefined): QuoteBuilderResourceState<QuoteDraft | null> {
  return useQuoteBuilderResource(() => (draftId ? quoteBuilderService.getDraft(draftId) : null), [draftId]);
}

export function useQuoteAssembly(input: QuoteAssemblyInput | null | undefined): QuoteBuilderResourceState<QuoteAssemblyResult> {
  return useQuoteBuilderResource(() => (input ? quoteBuilderService.assembleQuote(input) : null), [input]);
}

export function useQuoteValidation(input: QuoteAssemblyInput | null | undefined): QuoteBuilderResourceState<QuoteValidationResult> {
  return useQuoteBuilderResource(() => (input ? quoteBuilderService.validateQuote(input) : null), [input]);
}

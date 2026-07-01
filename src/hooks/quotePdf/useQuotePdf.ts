import { useEffect, useMemo, useState } from 'react';
import type { DependencyList } from 'react';
import { quotePdfService } from '@/services/quotePdf';
import type { QuotePdfRenderInput, QuotePdfRenderResult, QuotePdfValidationResult } from '@/types';

interface QuotePdfResourceState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

function useQuotePdfResource<T>(load: () => Promise<T> | null, dependencies: DependencyList): QuotePdfResourceState<T> {
  const [state, setState] = useState<QuotePdfResourceState<T>>({ data: null, loading: false, error: null });

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

export function useQuotePdfRender(input: QuotePdfRenderInput | null | undefined): QuotePdfResourceState<QuotePdfRenderResult> {
  return useQuotePdfResource(() => (input ? quotePdfService.generateQuotePdf(input) : null), [input]);
}

export function useQuotePdfValidation(input: QuotePdfRenderInput | null | undefined): QuotePdfValidationResult | null {
  return useMemo(() => (input ? quotePdfService.validateQuotePdfInput(input) : null), [input]);
}

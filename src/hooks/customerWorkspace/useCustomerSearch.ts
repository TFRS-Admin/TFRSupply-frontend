import { useCallback, useState } from 'react';
import { customerWorkspaceService } from '@/services/customerWorkspace';
import type { CustomerWorkspaceListResult, CustomerWorkspaceSearch } from '@/types';

interface CustomerSearchState {
  data: CustomerWorkspaceListResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for Customer Workspace search and filtering.
 * Formats customerWorkspaceService.searchCustomers() results into render-ready
 * state; it does not implement query matching or filter logic itself.
 */
export function useCustomerSearch() {
  const [state, setState] = useState<CustomerSearchState>({ data: null, loading: false, error: null });

  const search = useCallback(async (search: CustomerWorkspaceSearch) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await customerWorkspaceService.searchCustomers(search);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, search };
}

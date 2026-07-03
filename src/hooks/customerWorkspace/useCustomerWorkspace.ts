import { useCallback, useState } from 'react';
import { customerWorkspaceService } from '@/services/customerWorkspace';
import type { CustomerWorkspaceDetailResult, CustomerWorkspaceListResult } from '@/types';

interface CustomerWorkspaceListState {
  data: CustomerWorkspaceListResult | null;
  loading: boolean;
  error: unknown;
}

interface CustomerWorkspaceDetailState {
  detail: CustomerWorkspaceDetailResult | null;
  loading: boolean;
  error: unknown;
}

/**
 * React-facing entry point for the Customer Workspace list and detail views.
 * Owns loading/error state only — every list, filter, and summary rule lives
 * in customerWorkspaceService.
 */
export function useCustomerWorkspace() {
  const [listState, setListState] = useState<CustomerWorkspaceListState>({ data: null, loading: false, error: null });
  const [detailState, setDetailState] = useState<CustomerWorkspaceDetailState>({ detail: null, loading: false, error: null });

  const loadCustomers = useCallback(async () => {
    setListState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await customerWorkspaceService.listCustomers();
      setListState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setListState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const loadCustomerDetail = useCallback(async (customerId: string) => {
    setDetailState((current) => ({ ...current, loading: true, error: null }));
    try {
      const detail = await customerWorkspaceService.getCustomer(customerId);
      setDetailState({ detail, loading: false, error: null });
      return detail;
    } catch (error) {
      setDetailState({ detail: null, loading: false, error });
      throw error;
    }
  }, []);

  return {
    ...listState,
    loadCustomers,
    detail: detailState.detail,
    detailLoading: detailState.loading,
    detailError: detailState.error,
    loadCustomerDetail,
  };
}

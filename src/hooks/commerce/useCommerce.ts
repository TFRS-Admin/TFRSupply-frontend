import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { commerceService } from '@/services/commerce';
import type { CartLineDraft, CommerceLookupResult, ShopifyProduct, ShopifyVariant, VariantMapping } from '@/types';

interface CommerceResourceState<T> {
  result: CommerceLookupResult<T> | null;
  data: T | null;
  loading: boolean;
  error: unknown;
}

function useCommerceResource<T>(
  load: () => Promise<CommerceLookupResult<T>> | null,
  dependencies: DependencyList,
): CommerceResourceState<T> {
  const [state, setState] = useState<CommerceResourceState<T>>({
    result: null,
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const pending = load();

    if (!pending) {
      setState({ result: null, data: null, loading: false, error: null });
      return () => {
        active = false;
      };
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    pending
      .then((result) => {
        if (!active) return;
        setState({ result, data: result.data, loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({ result: null, data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, dependencies);

  return state;
}

export function useCommerceProduct(productId: string | null | undefined): CommerceResourceState<ShopifyProduct> {
  return useCommerceResource(
    () => (productId ? commerceService.getShopifyProduct(productId) : null),
    [productId],
  );
}

export function useCommerceVariant(sku: string | null | undefined): CommerceResourceState<ShopifyVariant> {
  return useCommerceResource(
    () => (sku ? commerceService.getShopifyVariant(sku) : null),
    [sku],
  );
}

export function useVariantMapping(sku: string | null | undefined): CommerceResourceState<VariantMapping> {
  return useCommerceResource(
    () => (sku ? commerceService.getVariantMapping(sku) : null),
    [sku],
  );
}

export function useCartLineDraft(
  sku: string | null | undefined,
  quantity: number | null | undefined,
): CommerceResourceState<CartLineDraft> {
  return useCommerceResource(
    () => (sku && quantity ? commerceService.prepareCartLine(sku, quantity) : null),
    [sku, quantity],
  );
}

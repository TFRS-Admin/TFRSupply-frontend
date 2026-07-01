import { useEffect, useState } from 'react';
import type { DependencyList } from 'react';
import { catalogService } from '@/services/catalog';
import type { Category, Product, Vertical } from '@/types';

interface CatalogResourceState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

function useCatalogResource<T>(load: () => T | null, dependencies: DependencyList): CatalogResourceState<T> {
  const [state, setState] = useState<CatalogResourceState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    Promise.resolve()
      .then(load)
      .then((data) => {
        if (!active) return;
        setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({ data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, dependencies);

  return state;
}

export function useCatalogCategory(categoryId: string | null | undefined): CatalogResourceState<Category> {
  return useCatalogResource(
    () => (categoryId ? catalogService.getCategory(categoryId) : null),
    [categoryId],
  );
}

export function useCatalogProduct(productId: string | null | undefined): CatalogResourceState<Product> {
  return useCatalogResource(
    () => (productId ? catalogService.getProduct(productId) : null),
    [productId],
  );
}

export function useCatalogVertical(verticalId: string | null | undefined): CatalogResourceState<Vertical> {
  return useCatalogResource(
    () => (verticalId ? catalogService.getVertical(verticalId) : null),
    [verticalId],
  );
}

export function useCatalogLists() {
  const [state, setState] = useState({
    products: [],
    categories: [],
    verticals: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    Promise.resolve()
      .then(() => ({
        products: catalogService.listProducts(),
        categories: catalogService.listCategories(),
        verticals: catalogService.listVerticals(),
      }))
      .then((data) => {
        if (!active) return;
        setState({ ...data, loading: false, error: null });
      })
      .catch((error) => {
        if (!active) return;
        setState({ products: [], categories: [], verticals: [], loading: false, error });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

import { useEffect, useState } from 'react';
import { catalogService } from '@/services/catalog';

function useCatalogResource(load, dependencies) {
  const [state, setState] = useState({
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

export function useCatalogCategory(categoryId) {
  return useCatalogResource(
    () => (categoryId ? catalogService.getCategory(categoryId) : null),
    [categoryId],
  );
}

export function useCatalogProduct(productId) {
  return useCatalogResource(
    () => (productId ? catalogService.getProduct(productId) : null),
    [productId],
  );
}

export function useCatalogVertical(verticalId) {
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

import type { Product } from '@/types';

export interface ProductDetailPathOptions {
  verticalId?: string;
  categoryId?: string;
}

/**
 * Builds the canonical /:verticalId/:categoryId/:productId detail route for a
 * product, matching the route declared in App.jsx. Returns null when a
 * product has no vertical/category association to route into, so callers can
 * render a disabled CTA instead of a broken link.
 */
export function resolveProductDetailPath(product: Product, options: ProductDetailPathOptions = {}): string | null {
  const verticalId = options.verticalId ?? product.verticalIds?.[0];
  const categoryId = options.categoryId ?? product.categoryIds?.[0];

  if (!verticalId || !categoryId) return null;

  return `/${verticalId}/${categoryId}/${product.id}`;
}

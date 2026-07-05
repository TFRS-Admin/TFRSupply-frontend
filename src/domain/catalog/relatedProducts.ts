import type { Product } from '@/types';

export interface RelatedProductsDeps {
  getProduct: (productId: string) => Product | null | undefined;
  searchByCategory: (categoryId: string | undefined) => Product[];
}

/**
 * Deterministic "related products" resolution shared by RecommendedProducts
 * (Product Detail's "Recommended Products" section) and Product Intelligence's
 * "Commonly Installed With" panel — extracted so both read the same
 * relationship data (product.commerce.related_products, then same-category
 * catalog products) instead of each maintaining its own copy. No AI ranking,
 * no network calls: `deps` is just catalogService's getProduct/searchProducts
 * threaded in by the caller.
 */
export function resolveRelatedProducts(product: Product, deps: RelatedProductsDeps, limit: number): Product[] {
  const relatedIds = product.commerce?.related_products ?? [];
  const explicit = relatedIds
    .map((id) => deps.getProduct(id))
    .filter((candidate): candidate is Product => Boolean(candidate) && candidate?.id !== product.id);

  if (explicit.length >= limit) return explicit.slice(0, limit);

  const seenIds = new Set([product.id, ...explicit.map((candidate) => candidate.id)]);
  const sameCategory = deps
    .searchByCategory(product.categoryIds?.[0] ?? product.category)
    .filter((candidate) => !seenIds.has(candidate.id));

  return [...explicit, ...sameCategory].slice(0, limit);
}

import type { CategoryProductCard } from '@/types';

export type CategoryActiveFilter = Record<string, string | null | undefined>;

function matchesActiveFilter(product: CategoryProductCard, activeFilter: CategoryActiveFilter): boolean {
  return Object.entries(activeFilter).every(([key, value]) => {
    if (!value) return true;
    const productValue = product[key];
    return productValue === value || (Array.isArray(productValue) && productValue.includes(value));
  });
}

export function matchesCategoryProductKeyword(product: CategoryProductCard, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [product.label, product.tagline, ...(product.specs ?? [])]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}

/**
 * Applies the CategoryTemplate sidebar filter selections and free-text search
 * to a category's product list. Pulled out of CategoryTemplate so the
 * matching rules can be unit tested without simulating user interaction
 * through server-rendered HTML.
 */
export function filterCategoryProducts(
  products: CategoryProductCard[],
  activeFilter: CategoryActiveFilter,
  keyword: string,
): CategoryProductCard[] {
  return products
    .filter((product) => matchesActiveFilter(product, activeFilter))
    .filter((product) => matchesCategoryProductKeyword(product, keyword));
}

import type { Product, ProductListResult } from '@/types/product';
import type { UpfitCategoryId } from '@/types/fleetBuilds';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds/upfitCategories';

export interface SuggestedProductsDeps {
  searchProducts: (query: { query?: string }) => ProductListResult;
}

/**
 * Deterministic "suggested products for this upfit category" resolution — the
 * same free-text `catalogService.searchProducts({ query: categoryLabel })`
 * path `/search` and FinishYourUpfitPanel's "Browse {category}" links already
 * use (see FLEET_INTELLIGENCE.md's Known Limitations: there is no reverse
 * UpfitCategoryId → catalog Category mapping). `deps.searchProducts` is
 * threaded in by the caller (catalogService.searchProducts), matching
 * src/domain/catalog/relatedProducts.ts's dependency-injection pattern so
 * this stays a pure, service-import-free domain module.
 */
export function resolveSuggestedProductsForCategory(
  categoryId: UpfitCategoryId,
  deps: SuggestedProductsDeps,
  limit = 4,
): Product[] {
  const result = deps.searchProducts({ query: getUpfitCategoryLabel(categoryId) });
  if (result.status !== 'ready') return [];
  return result.products.slice(0, limit);
}

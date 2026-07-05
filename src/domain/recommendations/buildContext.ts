import type { Product } from '@/types/product';
import type { FleetBuild, UpfitCategoryId } from '@/types/fleetBuilds';

/** Every product id selected anywhere in a build, regardless of category. */
export function getSelectedProductIds(build: FleetBuild | null | undefined): Set<string> {
  const ids = new Set<string>();
  if (!build) return ids;
  Object.values(build.selections).forEach((selections) => {
    (selections ?? []).forEach((selection) => ids.add(selection.productId));
  });
  return ids;
}

/** True when a build's category still has at least one selection flagged incompatible (see FleetBuildProductSelection.incompatible). */
export function categoryHasIncompatibleSelection(build: FleetBuild | null | undefined, categoryId: UpfitCategoryId | null): boolean {
  if (!build || !categoryId) return false;
  return (build.selections[categoryId] ?? []).some((selection) => selection.incompatible === true);
}

export interface RelatedProductIdsDeps {
  getProduct: (productId: string) => Product | null | undefined;
}

/**
 * Product ids related (product.commerce.related_products) to any product
 * already selected in this build — reuses the same relationship signal as
 * src/domain/catalog/relatedProducts.ts rather than introducing a second
 * "related products" source. Threaded into scoreProductForBuild as
 * RecommendationScoringContext.relatedProductIds so the scorer stays a pure
 * function that never imports catalogService itself.
 */
export function resolveRelatedProductIdsForBuild(build: FleetBuild | null | undefined, deps: RelatedProductIdsDeps): string[] {
  if (!build) return [];
  const relatedIds = new Set<string>();
  getSelectedProductIds(build).forEach((productId) => {
    const product = deps.getProduct(productId);
    (product?.commerce?.related_products ?? []).forEach((relatedId) => relatedIds.add(relatedId));
  });
  return [...relatedIds];
}

import type { Product } from '@/types/product';
import { classifyProductUpfitCategory } from '@/domain/fleetBuilds/upfitCategories';
import { resolveRelatedProducts, type RelatedProductsDeps } from '@/domain/catalog/relatedProducts';

export interface ProductRelationshipGroups {
  /** Related products in a different upfit category — pair well with this product without replacing it. */
  companions: Product[];
  /** Related products in the same upfit category — an alternative/upgrade option for this product's slot. */
  upgrades: Product[];
}

export interface GroupProductRelationshipsOptions {
  /** Max products per group. Defaults to 3. */
  limit?: number;
  /** Product ids to leave out entirely (e.g. already shown elsewhere on the page). */
  excludeProductIds?: string[];
}

/**
 * Splits a product's related products into "companions" (different upfit
 * category) and "upgrades/alternatives" (same category) — reusing
 * resolveRelatedProducts (product.commerce.related_products, then
 * same-category catalog products) and classifyProductUpfitCategory rather
 * than introducing a new relationship source. Degrades to empty arrays when
 * no deterministic relationship metadata exists, same as every caller of
 * resolveRelatedProducts already does.
 */
export function groupProductRelationships(
  product: Product,
  deps: RelatedProductsDeps,
  options: GroupProductRelationshipsOptions = {},
): ProductRelationshipGroups {
  const { limit = 3, excludeProductIds = [] } = options;
  const excluded = new Set([product.id, ...excludeProductIds]);
  const productCategoryId = classifyProductUpfitCategory(product);

  const pool = resolveRelatedProducts(product, deps, limit * 2 + excluded.size).filter((candidate) => !excluded.has(candidate.id));

  const companions: Product[] = [];
  const upgrades: Product[] = [];
  for (const candidate of pool) {
    if (companions.length >= limit && upgrades.length >= limit) break;
    const candidateCategoryId = classifyProductUpfitCategory(candidate);
    if (productCategoryId && candidateCategoryId === productCategoryId) {
      if (upgrades.length < limit) upgrades.push(candidate);
    } else if (companions.length < limit) {
      companions.push(candidate);
    }
  }

  return { companions, upgrades };
}

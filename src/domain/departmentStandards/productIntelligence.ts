import type { Product } from '@/types';
import type { DepartmentStandard, DepartmentStandardTier, ProductStandardMatch } from '@/types/departmentStandards';
import { classifyProductUpfitCategory } from '@/domain/fleetBuilds';

const TIER_PRIORITY: DepartmentStandardTier[] = ['required', 'recommended', 'optional'];

/**
 * Product Intelligence (Feature 5) — classifies a product into its upfit
 * category (the same classifyProductUpfitCategory used by Fleet Builds) and
 * matches it against every standard's required/recommended/optional tiers.
 * One match per standard (its highest-priority tier, required over
 * recommended over optional) — no AI, no network calls, no new product
 * database.
 */
export function getStandardsForProduct(
  product: Product | null | undefined,
  standards: DepartmentStandard[],
): ProductStandardMatch[] {
  const categoryId = classifyProductUpfitCategory(product);
  if (!categoryId) return [];

  const matches: ProductStandardMatch[] = [];
  standards.forEach((standard) => {
    const tier = TIER_PRIORITY.find((candidate) => standard.categories[candidate].includes(categoryId));
    if (tier) matches.push({ standard, tier });
  });
  return matches;
}

/** Standards that treat this product's category as required. */
export function getRequiredByStandards(matches: ProductStandardMatch[]): DepartmentStandard[] {
  return matches.filter((match) => match.tier === 'required').map((match) => match.standard);
}

/** Standards that consider this product's category worth having — required or recommended (not merely optional). */
export function getRecommendedForStandards(matches: ProductStandardMatch[]): DepartmentStandard[] {
  return matches.filter((match) => match.tier === 'required' || match.tier === 'recommended').map((match) => match.standard);
}

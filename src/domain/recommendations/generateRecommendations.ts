import type { Product } from '@/types/product';
import type { ProductRecommendation } from '@/types/recommendations';
import { getSelectedProductIds } from './buildContext';
import { scoreProductForBuild, type RecommendationScoringContext } from './scoreProduct';

export interface GenerateRecommendationsOptions {
  /** Maximum number of ranked recommendations to return. Defaults to 10. */
  limit?: number;
  /** Additional product ids to exclude beyond whatever is already selected in the build. */
  excludeProductIds?: string[];
}

/**
 * Scores every candidate product (scoreProductForBuild), then filters out
 * anything already selected in the build or flagged incompatible with its
 * vehicle — regardless of whether other signals pushed its raw score above
 * zero — before ranking the remainder highest-score-first. This is the one
 * function every integration surface (Guided Upfit Builder, Finish Your
 * Upfit, Product Search, Workspace) calls to get a ranked, capped
 * recommendation list.
 */
export function generateRecommendations(
  products: Product[],
  context: RecommendationScoringContext = {},
  options: GenerateRecommendationsOptions = {},
): ProductRecommendation[] {
  const { limit = 10, excludeProductIds = [] } = options;
  const excluded = new Set([...excludeProductIds, ...getSelectedProductIds(context.build)]);

  const ranked = products
    .filter((product) => !excluded.has(product.id))
    .map((product) => scoreProductForBuild(product, context))
    .filter((entry) => entry.score > 0 && entry.compatibilityStatus !== 'incompatible')
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit).map((entry, index) => ({ ...entry, rank: index + 1 }));
}

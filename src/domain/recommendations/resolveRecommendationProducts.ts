import type { Product } from '@/types/product';
import type { ProductRecommendation } from '@/types/recommendations';

export interface RecommendationWithProduct {
  recommendation: ProductRecommendation;
  product: Product;
}

/**
 * Pairs each ranked recommendation with its resolved catalog Product,
 * silently dropping any id that no longer resolves — the same tolerance
 * Compare/Saved Products/Recently Viewed already apply to their own id
 * lists. Shared by every UI surface that renders generateRecommendations'
 * output so none of them re-implement this resolve-and-filter step.
 */
export function resolveRecommendationProducts(
  recommendations: ProductRecommendation[],
  getProduct: (productId: string) => Product | null | undefined,
): RecommendationWithProduct[] {
  return recommendations
    .map((recommendation) => ({ recommendation, product: getProduct(recommendation.productId) }))
    .filter((entry): entry is RecommendationWithProduct => Boolean(entry.product));
}

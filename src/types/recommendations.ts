/**
 * Vehicle Build Recommendations Engine — client-side, deterministic domain
 * contracts. Scores existing catalog Products (src/types/product.ts) against
 * an existing FleetBuild/DepartmentStandard/guided-upfit-step context using
 * fixed, documented weights (src/domain/recommendations/scoringWeights.ts) —
 * no AI/ML, no external services, no new product/catalog data model. See
 * docs/architecture/VEHICLE_BUILD_RECOMMENDATIONS.md.
 */
import type { FleetBuildStyleId, UpfitCategoryId } from './fleetBuilds';

/**
 * How a recommendation should be framed to the customer. Distinct from
 * DepartmentStandardTier ('required'|'recommended'|'optional', which only
 * describes a category's importance to a standard) — a RecommendationType
 * also covers relationship-based suggestions (companion/upgrade) and a
 * build-repair suggestion (replacement) that a tier alone can't express.
 */
export type RecommendationType =
  | 'required'
  | 'recommended'
  | 'optional'
  | 'replacement'
  | 'companion'
  | 'upgrade';

export type RecommendationCompatibilityStatus = 'compatible' | 'incompatible' | 'unknown';

/**
 * One independent, additive scoring signal. Every code maps 1:1 to a weight
 * in RECOMMENDATION_SCORE_WEIGHTS — see scoringWeights.ts for the documented
 * point values.
 */
export type RecommendationReasonCode =
  | 'fills_required_category'
  | 'fills_recommended_category'
  | 'fills_optional_category'
  | 'matches_department_standard'
  | 'matches_guided_step'
  | 'matches_build_style'
  | 'compatible_with_vehicle'
  | 'incompatible_with_vehicle'
  | 'related_to_selected_product'
  | 'already_selected';

/** A single scored signal that fired for a product, before being flattened into reasonCodes/reasons. */
export interface RecommendationSignal {
  code: RecommendationReasonCode;
  label: string;
  points: number;
}

/**
 * The result of scoring one product against a RecommendationContext — no
 * rank yet, since rank only makes sense once a candidate list has been
 * sorted (see generateRecommendations).
 */
export interface ProductRecommendationScore {
  productId: string;
  score: number;
  reasonCodes: RecommendationReasonCode[];
  reasons: string[];
  matchingCategoryId: UpfitCategoryId | null;
  matchingDepartmentStandardId: string | null;
  matchingBuildStyleId: FleetBuildStyleId | null;
  compatibilityStatus: RecommendationCompatibilityStatus;
  recommendationType: RecommendationType;
}

/** One ranked recommendation — the shape every integration surface (Guided Builder, Workspace, etc.) renders. */
export interface ProductRecommendation extends ProductRecommendationScore {
  rank: number;
}

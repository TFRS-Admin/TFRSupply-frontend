import type { Product } from '@/types/product';
import type { FleetBuild, FleetBuildStyleId, UpfitCategoryId } from '@/types/fleetBuilds';
import type { DepartmentStandard, DepartmentStandardTier } from '@/types/departmentStandards';
import type { ProductRecommendationScore, RecommendationSignal, RecommendationType } from '@/types/recommendations';
import { classifyProductUpfitCategory, getUpfitCategoryLabel } from '@/domain/fleetBuilds/upfitCategories';
import { getFilledUpfitCategories } from '@/domain/fleetBuilds/completion';
import { getBuildStyleDefinition } from '@/domain/fleetBuilds/buildStyles';
import { resolveCatalogVerticalId } from '@/data/vehicles/vehicleMaster';
import { RECOMMENDATION_SCORE_WEIGHTS } from './scoringWeights';
import { categoryHasIncompatibleSelection, getSelectedProductIds } from './buildContext';

export interface RecommendationScoringContext {
  /** The build being scored against. Null when there's no active build (e.g. a generic product-detail lookup). */
  build?: FleetBuild | null;
  /** The build's effective Department Standard (src/domain/departmentStandards/standardAssignment.ts), if any. */
  standard?: DepartmentStandard | null;
  /** The Guided Upfit Builder category currently being worked on, if the caller is that step's panel. */
  currentStepCategoryId?: UpfitCategoryId | null;
  /** Product ids considered "related" to the current context (see resolveRelatedProductIdsForBuild). */
  relatedProductIds?: string[];
  /** Overrides the default "in this build" wording for the related-product reason, e.g. for a product-detail context. */
  relatedProductsReasonLabel?: string;
}

/** A category's tier is read from the standard when assigned; otherwise the build style's priority list counts as "recommended." Null means neither says anything about this category. */
function resolveCategoryTier(
  categoryId: UpfitCategoryId | null,
  standard: DepartmentStandard | null | undefined,
  buildStyle: FleetBuildStyleId | null | undefined,
): DepartmentStandardTier | null {
  if (!categoryId) return null;
  if (standard) {
    if (standard.categories.required.includes(categoryId)) return 'required';
    if (standard.categories.recommended.includes(categoryId)) return 'recommended';
    if (standard.categories.optional.includes(categoryId)) return 'optional';
    return null;
  }
  const style = getBuildStyleDefinition(buildStyle ?? null);
  return style?.priorityCategories.includes(categoryId) ? 'recommended' : null;
}

function resolveVehicleCompatibility(build: FleetBuild | null | undefined, product: Product): 'compatible' | 'incompatible' | 'unknown' {
  if (!build?.vehicle) return 'unknown';
  const buildVerticalId = resolveCatalogVerticalId(build.vehicle.vertical);
  const productVerticalIds = product.verticalIds ?? [];
  if (!buildVerticalId || productVerticalIds.length === 0) return 'unknown';
  return productVerticalIds.includes(buildVerticalId) ? 'compatible' : 'incompatible';
}

function resolveRecommendationType(params: {
  categoryId: UpfitCategoryId | null;
  isMissingCategory: boolean;
  tier: DepartmentStandardTier | null;
  isRelated: boolean;
  isReplacementCandidate: boolean;
  guidedStepMatched: boolean;
  filledCategories: Set<UpfitCategoryId>;
}): RecommendationType {
  const { categoryId, isMissingCategory, tier, isRelated, isReplacementCandidate, guidedStepMatched, filledCategories } = params;
  if (isMissingCategory && tier === 'required') return 'required';
  if (isReplacementCandidate) return 'replacement';
  if ((isMissingCategory && tier === 'recommended') || guidedStepMatched) return 'recommended';
  if (isRelated && categoryId && filledCategories.has(categoryId)) return 'upgrade';
  if (isRelated) return 'companion';
  if (isMissingCategory && tier === 'optional') return 'optional';
  return 'recommended';
}

/**
 * Scores one catalog Product against a build/standard/guided-step context —
 * the Vehicle Build Recommendations Engine's core rule. Every signal is
 * independent and additive (see RECOMMENDATION_SCORE_WEIGHTS); a product can
 * fire more than one at once (e.g. a product that fills a missing required
 * category AND matches the current guided step scores both bonuses). Pure —
 * takes already-loaded FleetBuild/DepartmentStandard objects, matching
 * evaluateFleetBuildIntelligence/buildGuidedUpfitChecklist's convention, so
 * it can be unit tested with plain fixtures and no context/service.
 */
export function scoreProductForBuild(product: Product, context: RecommendationScoringContext = {}): ProductRecommendationScore {
  const { build = null, standard = null, currentStepCategoryId = null, relatedProductIds = [], relatedProductsReasonLabel } = context;

  const categoryId = classifyProductUpfitCategory(product);
  const filledCategories: Set<UpfitCategoryId> = new Set(build ? getFilledUpfitCategories(build) : []);
  const tier = resolveCategoryTier(categoryId, standard, build?.buildStyle);
  const isMissingCategory = Boolean(categoryId) && !filledCategories.has(categoryId as UpfitCategoryId);
  const alreadySelected = getSelectedProductIds(build).has(product.id);
  const compatibilityStatus = resolveVehicleCompatibility(build, product);
  const isRelated = relatedProductIds.includes(product.id);
  const guidedStepMatched = Boolean(currentStepCategoryId) && categoryId === currentStepCategoryId;
  const isReplacementCandidate = Boolean(categoryId)
    && !isMissingCategory
    && !alreadySelected
    && compatibilityStatus !== 'incompatible'
    && categoryHasIncompatibleSelection(build, categoryId);

  const signals: RecommendationSignal[] = [];

  if (categoryId && isMissingCategory && tier === 'required') {
    signals.push({
      code: 'fills_required_category',
      label: `Fills missing required category: ${getUpfitCategoryLabel(categoryId)}`,
      points: RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_REQUIRED_CATEGORY,
    });
  } else if (categoryId && isMissingCategory && tier === 'recommended') {
    signals.push({
      code: 'fills_recommended_category',
      label: `Fills missing recommended category: ${getUpfitCategoryLabel(categoryId)}`,
      points: RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_RECOMMENDED_CATEGORY,
    });
  } else if (categoryId && isMissingCategory && tier === 'optional') {
    signals.push({
      code: 'fills_optional_category',
      label: `Fills missing optional category: ${getUpfitCategoryLabel(categoryId)}`,
      points: RECOMMENDATION_SCORE_WEIGHTS.FILLS_MISSING_OPTIONAL_CATEGORY,
    });
  }

  if (standard && categoryId && tier) {
    signals.push({
      code: 'matches_department_standard',
      label: `Matches ${tier} department category (${standard.name})`,
      points: RECOMMENDATION_SCORE_WEIGHTS.MATCHES_DEPARTMENT_STANDARD,
    });
  }

  if (guidedStepMatched && categoryId) {
    signals.push({
      code: 'matches_guided_step',
      label: `Completes current guided step: ${getUpfitCategoryLabel(categoryId)}`,
      points: RECOMMENDATION_SCORE_WEIGHTS.MATCHES_GUIDED_STEP,
    });
  }

  const styleDefinition = getBuildStyleDefinition(build?.buildStyle ?? null);
  const matchesBuildStyle = Boolean(styleDefinition && categoryId && styleDefinition.priorityCategories.includes(categoryId));
  if (matchesBuildStyle && styleDefinition) {
    signals.push({
      code: 'matches_build_style',
      label: `Supports active build style: ${styleDefinition.label}`,
      points: RECOMMENDATION_SCORE_WEIGHTS.MATCHES_BUILD_STYLE,
    });
  }

  if (compatibilityStatus === 'compatible') {
    signals.push({
      code: 'compatible_with_vehicle',
      label: 'Compatible with selected vehicle',
      points: RECOMMENDATION_SCORE_WEIGHTS.COMPATIBLE_WITH_VEHICLE,
    });
  } else if (compatibilityStatus === 'incompatible') {
    signals.push({
      code: 'incompatible_with_vehicle',
      label: "Not associated with the selected vehicle's vertical",
      points: RECOMMENDATION_SCORE_WEIGHTS.INCOMPATIBLE_WITH_VEHICLE,
    });
  }

  if (isRelated) {
    signals.push({
      code: 'related_to_selected_product',
      label: relatedProductsReasonLabel ?? 'Frequently paired with a product already in this build',
      points: RECOMMENDATION_SCORE_WEIGHTS.RELATED_TO_SELECTED_PRODUCT,
    });
  }

  if (alreadySelected) {
    signals.push({
      code: 'already_selected',
      label: 'Already selected in this build',
      points: RECOMMENDATION_SCORE_WEIGHTS.ALREADY_SELECTED,
    });
  }

  const recommendationType = resolveRecommendationType({
    categoryId, isMissingCategory, tier, isRelated, isReplacementCandidate, guidedStepMatched, filledCategories,
  });

  return {
    productId: product.id,
    score: signals.reduce((sum, signal) => sum + signal.points, 0),
    reasonCodes: signals.map((signal) => signal.code),
    reasons: signals.map((signal) => signal.label),
    matchingCategoryId: categoryId,
    matchingDepartmentStandardId: standard && categoryId && tier ? standard.id : null,
    matchingBuildStyleId: matchesBuildStyle && styleDefinition ? styleDefinition.id : null,
    compatibilityStatus,
    recommendationType,
  };
}

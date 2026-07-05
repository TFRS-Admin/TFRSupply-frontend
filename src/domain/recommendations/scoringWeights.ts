/**
 * Vehicle Build Recommendations Engine — centralized, documented scoring
 * weights. Every product is scored by summing whichever of these signals
 * apply (see scoreProduct.ts) — a purely additive, deterministic rules
 * engine over existing catalog/FleetBuild/DepartmentStandard metadata. No
 * AI/ML. Change a weight here and every surface that calls
 * generateRecommendations picks it up — never hardcode a point value
 * elsewhere.
 */
export const RECOMMENDATION_SCORE_WEIGHTS = {
  /** The category is a current, unfilled gap the build's Department Standard requires. */
  FILLS_MISSING_REQUIRED_CATEGORY: 50,
  /** The product's category matches the Guided Upfit Builder step currently being worked on. */
  MATCHES_GUIDED_STEP: 40,
  /** The product's category appears in the build's effective Department Standard, at any tier. */
  MATCHES_DEPARTMENT_STANDARD: 30,
  /** The category is a current, unfilled gap the Department Standard recommends (not required). */
  FILLS_MISSING_RECOMMENDED_CATEGORY: 25,
  /** The product's category is one of the active Build Style's priority categories. */
  MATCHES_BUILD_STYLE: 20,
  /** The product's catalog verticals include the build vehicle's vertical. */
  COMPATIBLE_WITH_VEHICLE: 20,
  /** The category is a current, unfilled gap the Department Standard treats as optional. */
  FILLS_MISSING_OPTIONAL_CATEGORY: 10,
  /** The product is related (commerce.related_products) to a product already selected in this build. */
  RELATED_TO_SELECTED_PRODUCT: 10,
  /** The product is already selected somewhere in this build — never worth re-recommending. */
  ALREADY_SELECTED: -100,
  /** The product's catalog verticals don't include the build vehicle's vertical. */
  INCOMPATIBLE_WITH_VEHICLE: -100,
} as const;

import type { Product } from '@/types/product';
import type { FleetQuoteBuildEntry, QuoteProductEntry, VehicleQuoteMissingProduct, VehicleQuoteSummary } from '@/types/fleetQuote';
import { getBuildStyleLabel } from '@/domain/fleetBuilds';
import { generateRecommendations, resolveRecommendationProducts, resolveRelatedProductIdsForBuild } from '@/domain/recommendations';
import { formatVehicleLabel } from './vehicleLabel';

const MAX_RECOMMENDED_ADDITIONS = 5;

export interface VehicleQuoteDeps {
  products: Product[];
  getProduct: (productId: string) => Product | null | undefined;
}

/** Total selected product instances across every category, regardless of tier — mirrors src/domain/fleetProjects/projectSummary.ts's countSelectedProducts. */
function countSelectedProductInstances(entry: FleetQuoteBuildEntry): number {
  return Object.values(entry.build.selections).reduce((sum, items) => sum + (items?.length ?? 0), 0);
}

/**
 * Aggregates one Fleet Build's already-computed Guided Upfit Builder
 * checklist (src/domain/upfitBuilder/guidedChecklist.ts) plus the Vehicle
 * Build Recommendations Engine (src/domain/recommendations) into the Vehicle
 * Summary card the Fleet Quote Builder renders — installed/missing products,
 * completion, and recommended additions. No tier/completion logic is
 * re-derived here; every fact comes from the checklist already passed in.
 */
export function aggregateVehicleQuote(entry: FleetQuoteBuildEntry, deps: VehicleQuoteDeps): VehicleQuoteSummary {
  const { build, standard, checklist } = entry;

  const installedProducts: QuoteProductEntry[] = checklist.steps.flatMap((step) => step.selectedProducts.map((selection) => ({
    productId: selection.productId,
    label: selection.label,
    categoryId: step.categoryId,
    categoryLabel: step.label,
  })));

  const missingProducts: VehicleQuoteMissingProduct[] = checklist.steps
    .filter((step) => step.status !== 'complete')
    .map((step) => ({ categoryId: step.categoryId, categoryLabel: step.label, tier: step.tier }));

  const recommendedAdditions = resolveRecommendationProducts(
    generateRecommendations(deps.products, {
      build,
      standard,
      relatedProductIds: resolveRelatedProductIdsForBuild(build, { getProduct: deps.getProduct }),
    }, { limit: MAX_RECOMMENDED_ADDITIONS }),
    deps.getProduct,
  );

  const recommendationStatus: VehicleQuoteSummary['recommendationStatus'] = checklist.departmentCompliant
    ? 'fully_equipped'
    : recommendedAdditions.length > 0
      ? 'has_recommendations'
      : 'no_recommendations';

  return {
    buildId: build.id,
    buildName: build.name,
    vehicle: build.vehicle,
    vehicleLabel: formatVehicleLabel(build.vehicle),
    buildStyleLabel: getBuildStyleLabel(build.buildStyle),
    departmentStandardName: standard?.name ?? null,
    quantity: build.quantity,
    completionPercent: checklist.overallPercent,
    departmentCompliant: checklist.departmentCompliant,
    estimatedEquipmentCount: countSelectedProductInstances(entry) * build.quantity,
    missingRequiredCategories: checklist.steps.filter((step) => checklist.missingRequired.includes(step.categoryId)).map((step) => step.label),
    missingRecommendedCategories: checklist.steps.filter((step) => checklist.missingRecommended.includes(step.categoryId)).map((step) => step.label),
    installedProducts,
    missingProducts,
    recommendedAdditions,
    recommendationStatus,
  };
}

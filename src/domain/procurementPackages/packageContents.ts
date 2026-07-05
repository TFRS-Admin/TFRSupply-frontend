import type { FleetQuoteBuildEntry } from '@/types/fleetQuote';
import type {
  PackageCategoryEntry,
  PackageCategoryStatus,
  PackageContents,
  PackageVehicleTypeEntry,
  ProcurementPackageGroup,
} from '@/types/procurementPackages';
import type { UpfitCategoryId } from '@/types/fleetBuilds';
import type { UpfitBuilderCategoryTier } from '@/types/upfitBuilder';
import { groupQuoteItems, formatVehicleLabel } from '@/domain/fleetQuote';
import { getBuildStyleLabel } from '@/domain/fleetBuilds';

/** How many of this package's builds already have `categoryId` filled — complete (all), partial (some), or missing (none). */
function resolveCategoryStatus(entries: FleetQuoteBuildEntry[], categoryId: UpfitCategoryId): { status: PackageCategoryStatus; equippedBuildIds: string[] } {
  const equippedBuildIds = entries
    .filter((entry) => entry.checklist.steps.find((step) => step.categoryId === categoryId)?.status === 'complete')
    .map((entry) => entry.build.id);

  const status: PackageCategoryStatus = equippedBuildIds.length === 0
    ? 'missing'
    : equippedBuildIds.length === entries.length ? 'complete' : 'partial';

  return { status, equippedBuildIds };
}

/**
 * Expands one package group into its "Package Contents" — Vehicle Types,
 * Products (grouped quantities, reusing groupQuoteItems), and tiered
 * Required/Recommended/Optional Equipment. Every build in a package shares
 * the same effective Department Standard (the grouping key — see
 * src/domain/procurementPackages/grouping.ts), so tier is read from the
 * first entry's already-computed Guided Upfit Builder checklist rather than
 * re-derived; the Unassigned package is the one documented exception (each
 * build falls back to its own build style when there is no standard, so tier
 * can differ build-to-build there — see docs/architecture/
 * FLEET_PROCUREMENT_PACKAGES.md's Known Limitations).
 */
export function buildPackageContents(group: ProcurementPackageGroup): PackageContents {
  const { entries } = group;

  const vehicleTypes: PackageVehicleTypeEntry[] = entries.map(({ build }) => ({
    buildId: build.id,
    buildName: build.name,
    vehicleLabel: formatVehicleLabel(build.vehicle),
    buildStyleLabel: getBuildStyleLabel(build.buildStyle),
    quantity: build.quantity,
  }));

  const products = groupQuoteItems(entries);
  const referenceSteps = entries[0]?.checklist.steps ?? [];

  function byTier(tier: UpfitBuilderCategoryTier): PackageCategoryEntry[] {
    return referenceSteps
      .filter((step) => step.tier === tier)
      .map((step) => {
        const { status, equippedBuildIds } = resolveCategoryStatus(entries, step.categoryId);
        return { categoryId: step.categoryId, categoryLabel: step.label, tier, status, equippedBuildIds };
      });
  }

  return {
    vehicleTypes,
    products,
    requiredEquipment: byTier('required'),
    recommendedEquipment: byTier('recommended'),
    optionalEquipment: byTier('optional'),
  };
}

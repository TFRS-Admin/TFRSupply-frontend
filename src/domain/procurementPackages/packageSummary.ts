import type { ProcurementPackage, ProcurementPackageGroup } from '@/types/procurementPackages';
import { aggregateVehicleQuote, buildMissingEquipmentReport, groupQuoteItems, type VehicleQuoteDeps } from '@/domain/fleetQuote';
import { summarizeFleetHealth } from '@/domain/departmentStandards';
import { detectDuplicateConfigurations } from './duplicateConfigurations';
import { resolvePackageReadiness } from './packageReadiness';
import { dedupeRecommendedAdditions } from './recommendedAdditions';

const MAX_PACKAGE_RECOMMENDATIONS = 5;

/**
 * Aggregates one package group's Package Summary — Package Name, Department,
 * Vehicles, Equipment Count, Completion, Readiness, Missing Equipment,
 * Recommended Additions. No tier, completion, readiness, or recommendation
 * logic is re-derived here: every field composes an existing Fleet Quote
 * Builder/Fleet Intelligence aggregation function, scoped to this package's
 * entries instead of the whole project.
 */
export function aggregatePackageSummary(group: ProcurementPackageGroup, deps: VehicleQuoteDeps): ProcurementPackage {
  const { entries } = group;
  const builds = entries.map((entry) => entry.build);

  const groupedItems = groupQuoteItems(entries);
  const health = summarizeFleetHealth(entries.map(({ build, standard }) => ({ build, standard })));
  const duplicateConfigurations = detectDuplicateConfigurations(builds);
  const readiness = resolvePackageReadiness(entries, duplicateConfigurations);
  const missingEquipment = buildMissingEquipmentReport(entries);

  const vehicleSummaries = entries.map((entry) => aggregateVehicleQuote(entry, deps));
  const recommendedAdditions = dedupeRecommendedAdditions(
    vehicleSummaries.flatMap((summary) => summary.recommendedAdditions),
    MAX_PACKAGE_RECOMMENDATIONS,
  );

  return {
    id: group.id,
    name: group.name,
    departmentLabel: group.name,
    buildIds: builds.map((build) => build.id),
    vehicleCount: health.vehicleCount,
    equipmentCount: groupedItems.length,
    completionPercent: health.overallCompletionPercent,
    readiness,
    missingEquipment,
    recommendedAdditions,
    duplicateConfigurations,
  };
}

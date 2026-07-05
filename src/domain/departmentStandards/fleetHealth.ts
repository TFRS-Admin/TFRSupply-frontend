import type { FleetBuild } from '@/types/fleetBuilds';
import type { DepartmentStandard, FleetHealthColor, FleetHealthCriticalGap, FleetHealthSummary } from '@/types/departmentStandards';
import type { UpfitCategoryId } from '@/types/fleetBuilds';
import { calculateFleetBuildCompletion, getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import { evaluateFleetBuildIntelligence } from './completionEngine';

const MAX_CRITICAL_GAPS = 5;

export interface FleetHealthBuildEntry {
  build: FleetBuild;
  /** The standard effective for this build (see standardAssignment.ts), or null if none is assigned. */
  standard: DepartmentStandard | null;
}

function healthColorFromPercent(percent: number): FleetHealthColor {
  return percent >= 100 ? 'green' : percent > 0 ? 'yellow' : 'red';
}

/**
 * Aggregates fleet readiness across a set of (build, effective standard)
 * pairs — the same rollup powers both the Workspace Fleet Intelligence
 * section (Feature 3, across every project) and each project's Fleet Health
 * card (Feature 6, scoped to one project's builds). Builds on
 * evaluateFleetBuildIntelligence/calculateFleetBuildCompletion rather than
 * re-deriving per-build scoring.
 *
 * Vehicle counts (vehiclesReady/InProgress/MissingEquipment/NeedReview,
 * vehicleCount) are weighted by build.quantity, mirroring
 * FleetProjectSummary.vehicleCount. overallCompletionPercent is a simple
 * (unweighted) average across builds, mirroring
 * FleetProjectSummary.averageCompletionPercent.
 */
export function summarizeFleetHealth(entries: FleetHealthBuildEntry[]): FleetHealthSummary {
  let vehicleCount = 0;
  let vehiclesReady = 0;
  let vehiclesInProgress = 0;
  let vehiclesMissingEquipment = 0;
  let vehiclesNeedReview = 0;
  const percents: number[] = [];
  const gapVehicleCountByCategory = new Map<UpfitCategoryId, number>();

  entries.forEach(({ build, standard }) => {
    const quantity = build.quantity;
    vehicleCount += quantity;

    const report = evaluateFleetBuildIntelligence(build, standard);
    if (!report) {
      vehiclesNeedReview += quantity;
      percents.push(calculateFleetBuildCompletion(build).percent);
      return;
    }

    percents.push(report.completionPercent);
    if (report.departmentCompliant) {
      vehiclesReady += quantity;
    } else if (report.requiredInstalled > 0 || report.recommendedInstalled > 0) {
      vehiclesInProgress += quantity;
    } else {
      vehiclesMissingEquipment += quantity;
    }

    report.missingRequired.forEach((categoryId) => {
      gapVehicleCountByCategory.set(categoryId, (gapVehicleCountByCategory.get(categoryId) ?? 0) + quantity);
    });
  });

  const overallCompletionPercent = percents.length
    ? Math.round(percents.reduce((sum, percent) => sum + percent, 0) / percents.length)
    : 0;

  const scoredVehicleCount = vehiclesReady + vehiclesInProgress + vehiclesMissingEquipment;
  const departmentCompliancePercent = scoredVehicleCount === 0
    ? 0
    : Math.round((vehiclesReady / scoredVehicleCount) * 100);

  const criticalGaps: FleetHealthCriticalGap[] = Array.from(gapVehicleCountByCategory.entries())
    .map(([categoryId, count]) => ({ categoryId, label: getUpfitCategoryLabel(categoryId), vehicleCount: count }))
    .sort((a, b) => b.vehicleCount - a.vehicleCount)
    .slice(0, MAX_CRITICAL_GAPS);

  return {
    buildCount: entries.length,
    vehicleCount,
    overallCompletionPercent,
    color: healthColorFromPercent(overallCompletionPercent),
    vehiclesReady,
    vehiclesInProgress,
    vehiclesMissingEquipment,
    vehiclesNeedReview,
    departmentCompliancePercent,
    criticalGaps,
  };
}

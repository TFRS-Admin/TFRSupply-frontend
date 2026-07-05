import type { FleetQuoteBuildEntry } from '@/types/fleetQuote';
import type { DuplicateConfigurationGroup, PackageReadiness, PackageReadinessLevel } from '@/types/procurementPackages';

const LEVEL_LABELS: Record<PackageReadinessLevel, string> = {
  ready: 'Ready',
  minor_issues: 'Minor Issues',
  needs_review: 'Needs Review',
  blocked: 'Blocked',
};

/**
 * Deterministic package readiness scoring — no probability model, no AI,
 * mirroring src/domain/fleetQuote/quoteReadiness.ts's structure (collect
 * every applicable reason, then decide a level in a fixed priority order).
 * Reuses each entry's already-computed Guided Upfit Builder checklist rather
 * than re-deriving tier/completion facts, plus this feature's own duplicate-
 * configuration detection (src/domain/procurementPackages/
 * duplicateConfigurations.ts).
 *
 * Priority (most to least severe):
 *  1. No builds in the package, or a build missing a vehicle assignment, or
 *     missing required equipment anywhere in the package → Blocked — nothing
 *     to procure, or the package isn't specified enough to procure yet.
 *  2. A duplicate vehicle configuration, or any build with no Department
 *     Standard assigned → Needs Review — a human judgment call is needed
 *     (is this really two vehicles, does this package need a standard).
 *  3. Missing recommended equipment, or any build under 100% completion →
 *     Minor Issues.
 *  4. Otherwise → Ready.
 */
export function resolvePackageReadiness(
  entries: FleetQuoteBuildEntry[],
  duplicateConfigurations: DuplicateConfigurationGroup[] = [],
): PackageReadiness {
  if (entries.length === 0) {
    return { level: 'blocked', label: LEVEL_LABELS.blocked, reasons: ['No fleet builds in this package.'] };
  }

  const reasons: string[] = [];

  const buildsWithoutVehicle = entries.filter((entry) => !entry.build.vehicle).length;
  if (buildsWithoutVehicle > 0) {
    reasons.push(`${buildsWithoutVehicle} fleet build${buildsWithoutVehicle === 1 ? '' : 's'} missing a vehicle assignment.`);
  }

  const missingRequiredCount = entries.reduce((sum, entry) => sum + entry.checklist.missingRequired.length, 0);
  if (missingRequiredCount > 0) {
    reasons.push(`${missingRequiredCount} required equipment item${missingRequiredCount === 1 ? '' : 's'} missing across this package.`);
  }

  if (duplicateConfigurations.length > 0) {
    reasons.push(`${duplicateConfigurations.length} duplicate vehicle configuration${duplicateConfigurations.length === 1 ? '' : 's'} detected — review before procuring.`);
  }

  const buildsWithoutStandard = entries.filter((entry) => !entry.standard).length;
  if (buildsWithoutStandard === entries.length) {
    reasons.push('No Department Standard assigned to this package.');
  } else if (buildsWithoutStandard > 0) {
    reasons.push(`${buildsWithoutStandard} fleet build${buildsWithoutStandard === 1 ? '' : 's'} has no Department Standard assigned.`);
  }

  const missingRecommendedCount = entries.reduce((sum, entry) => sum + entry.checklist.missingRecommended.length, 0);
  if (missingRecommendedCount > 0) {
    reasons.push(`${missingRecommendedCount} recommended equipment item${missingRecommendedCount === 1 ? '' : 's'} missing across this package.`);
  }

  const incompleteBuildCount = entries.filter((entry) => entry.checklist.overallPercent < 100).length;

  let level: PackageReadinessLevel;
  if (buildsWithoutVehicle > 0 || missingRequiredCount > 0) {
    level = 'blocked';
  } else if (duplicateConfigurations.length > 0 || buildsWithoutStandard > 0) {
    level = 'needs_review';
  } else if (missingRecommendedCount > 0 || incompleteBuildCount > 0) {
    level = 'minor_issues';
  } else {
    level = 'ready';
  }

  return { level, label: LEVEL_LABELS[level], reasons };
}

import type { FleetQuoteBuildEntry, MissingEquipmentEntry, MissingEquipmentReport } from '@/types/fleetQuote';
import { formatVehicleLabel } from './vehicleLabel';

function groupBy(entries: MissingEquipmentEntry[], keyFn: (entry: MissingEquipmentEntry) => string): Record<string, MissingEquipmentEntry[]> {
  const groups: Record<string, MissingEquipmentEntry[]> = {};
  entries.forEach((entry) => {
    const key = keyFn(entry);
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
}

/**
 * Missing Equipment Report — every not-yet-complete category across every
 * Fleet Build in the project (from each entry's already-computed Guided
 * Upfit Builder checklist), split by tier (Critical/Recommended/Optional)
 * and, separately, grouped by Vehicle/Department Standard/Category.
 */
export function buildMissingEquipmentReport(entries: FleetQuoteBuildEntry[]): MissingEquipmentReport {
  const all: MissingEquipmentEntry[] = entries.flatMap(({ build, standard, checklist }) => checklist.steps
    .filter((step) => step.status !== 'complete')
    .map((step) => ({
      buildId: build.id,
      buildName: build.name,
      vehicleLabel: formatVehicleLabel(build.vehicle),
      categoryId: step.categoryId,
      categoryLabel: step.label,
      tier: step.tier,
      standardName: standard?.name ?? null,
    })));

  return {
    critical: all.filter((entry) => entry.tier === 'required'),
    recommended: all.filter((entry) => entry.tier === 'recommended'),
    optional: all.filter((entry) => entry.tier === 'optional'),
    byVehicle: groupBy(all, (entry) => entry.buildName),
    byDepartmentStandard: groupBy(all, (entry) => entry.standardName ?? 'No Standard Assigned'),
    byCategory: groupBy(all, (entry) => entry.categoryLabel),
  };
}

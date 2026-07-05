import type { FleetQuoteBuildEntry } from '@/types/fleetQuote';
import type { ProcurementPackageGroup } from '@/types/procurementPackages';

export const UNASSIGNED_PACKAGE_ID = 'unassigned';
export const UNASSIGNED_PACKAGE_NAME = 'Unassigned Vehicles';

/**
 * Groups already-resolved Fleet Quote Builder entries
 * (src/domain/fleetQuote/buildEntries.ts's buildFleetQuoteEntries — build +
 * effective Department Standard + Guided Upfit Builder checklist) by their
 * effective Department Standard's id into named procurement packages ("Patrol,"
 * "SWAT," "K9," …). Builds with no effective standard fall into one shared
 * `'unassigned'` package rather than being dropped — a package with no
 * Department Standard still needs a procurement decision made about it.
 *
 * Groups by standard id, not name: two distinct standards that happen to
 * share a display name (e.g. a company-standard clone still named "Patrol")
 * become two distinct packages, since they are different records that could
 * diverge later. Sorted alphabetically by name, with the Unassigned package
 * always last.
 */
export function groupFleetQuoteEntriesIntoPackages(entries: FleetQuoteBuildEntry[]): ProcurementPackageGroup[] {
  const groups = new Map<string, ProcurementPackageGroup>();

  entries.forEach((entry) => {
    const id = entry.standard?.id ?? UNASSIGNED_PACKAGE_ID;
    const existing = groups.get(id);
    if (existing) {
      existing.entries.push(entry);
      return;
    }
    groups.set(id, { id, name: entry.standard?.name ?? UNASSIGNED_PACKAGE_NAME, entries: [entry] });
  });

  return Array.from(groups.values()).sort((a, b) => {
    if (a.id === UNASSIGNED_PACKAGE_ID) return 1;
    if (b.id === UNASSIGNED_PACKAGE_ID) return -1;
    return a.name.localeCompare(b.name);
  });
}

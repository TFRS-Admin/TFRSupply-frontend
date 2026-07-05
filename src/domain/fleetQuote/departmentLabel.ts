import type { FleetQuoteBuildEntry } from '@/types/fleetQuote';

/**
 * Resolves the Project Summary's "Department" field from every build's
 * already-resolved effective Department Standard (see
 * src/domain/departmentStandards/standardAssignment.ts) — "Not Assigned" with
 * no builds or no standards anywhere, "Mixed" when builds disagree, else the
 * one shared standard name.
 */
export function resolveProjectDepartmentLabel(entries: FleetQuoteBuildEntry[]): string {
  if (entries.length === 0) return 'Not Assigned';

  const names = new Set(entries.map((entry) => entry.standard?.name ?? null));
  if (names.size === 1) {
    const [only] = names;
    return only ?? 'Not Assigned';
  }
  return 'Mixed';
}

import type { FleetBuild } from '@/types/fleetBuilds';
import type { FleetProject } from '@/types/fleetProjects';
import type { DepartmentStandard } from '@/types/departmentStandards';
import type { FleetQuoteBuildEntry } from '@/types/fleetQuote';
import { resolveEffectiveStandard } from '@/domain/departmentStandards';
import { buildGuidedUpfitChecklist } from '@/domain/upfitBuilder';

/**
 * Resolves each Fleet Build's effective Department Standard
 * (src/domain/departmentStandards/standardAssignment.ts) and Guided Upfit
 * Builder checklist (src/domain/upfitBuilder/guidedChecklist.ts) once, for
 * reuse across every Fleet Quote Builder aggregation function below. Does not
 * read UpfitBuilderContext's per-build skipped-step state — a category
 * skipped in the guided flow still reports as outstanding here, since a
 * customer-facing quote should reflect true install state regardless of an
 * in-progress guided-workflow shortcut (see docs/architecture/
 * FLEET_QUOTE_BUILDER.md's Known Limitations).
 */
export function buildFleetQuoteEntries(
  builds: FleetBuild[],
  project: FleetProject | null,
  companyStandards: DepartmentStandard[],
): FleetQuoteBuildEntry[] {
  return builds.map((build) => {
    const standard = resolveEffectiveStandard(build, project, companyStandards);
    return { build, standard, checklist: buildGuidedUpfitChecklist(build, standard, []) };
  });
}

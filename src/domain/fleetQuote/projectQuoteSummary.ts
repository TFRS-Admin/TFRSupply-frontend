import type { FleetProject } from '@/types/fleetProjects';
import type { FleetQuoteBuildEntry, ProjectQuoteSummary } from '@/types/fleetQuote';
import { summarizeFleetHealth } from '@/domain/departmentStandards';
import { resolveProjectDepartmentLabel } from './departmentLabel';
import { resolveQuoteReadiness } from './quoteReadiness';

/**
 * The Project Summary block's data — composes summarizeFleetHealth (Fleet
 * Intelligence & Department Standards) for Fleet Health/vehicle count/
 * completion percent and resolveQuoteReadiness for Quote Status, rather than
 * re-deriving either rollup.
 */
export function aggregateProjectQuote(
  project: FleetProject | null,
  entries: FleetQuoteBuildEntry[],
  lastUpdated: number | null,
): ProjectQuoteSummary {
  const health = summarizeFleetHealth(entries.map(({ build, standard }) => ({ build, standard })));
  const quoteStatus = resolveQuoteReadiness(Boolean(project), entries);

  return {
    projectId: project?.id ?? '',
    projectName: project?.name ?? 'No Active Project',
    departmentLabel: resolveProjectDepartmentLabel(entries),
    buildCount: entries.length,
    vehicleCount: health.vehicleCount,
    completionPercent: health.overallCompletionPercent,
    fleetHealthColor: health.color,
    quoteStatus,
    lastUpdated,
  };
}

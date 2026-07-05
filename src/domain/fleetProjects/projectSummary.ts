import type { FleetBuild, FleetBuildTemplate } from '@/types/fleetBuilds';
import type { FleetProject, FleetProjectCompletionColor, FleetProjectSummary } from '@/types/fleetProjects';
import { calculateFleetBuildCompletion } from '@/domain/fleetBuilds/completion';
import { getBuildStyleLabel } from '@/domain/fleetBuilds/buildStyles';

function completionColorFromPercent(percent: number): FleetProjectCompletionColor {
  return percent >= 100 ? 'green' : percent > 0 ? 'yellow' : 'red';
}

function countSelectedProducts(build: FleetBuild): number {
  return Object.values(build.selections).reduce((sum, items) => sum + (items?.length ?? 0), 0);
}

/**
 * Derives a read-only project summary from the full (unscoped) builds/
 * templates lists, filtering to `project.id` itself — callers may pass
 * either FleetBuildsContext's already-scoped `builds` (for the active
 * project) or its unscoped `allBuilds` (to summarize every project at once,
 * e.g. the Workspace Projects list), since filtering a list that's already
 * scoped to this project is a no-op. No pricing: estimatedProductCount is a
 * line-item count, never a dollar amount.
 *
 * `lastModified` is a best-effort signal, not an exact edit log — it is the
 * latest of the project's own `updatedAt` (bumped on rename/archive) and its
 * builds'/templates' own timestamps. Editing an existing build in place
 * (changing its vehicle, quantity, or products) does not currently bump any
 * timestamp, so `lastModified` can lag behind that kind of edit — see
 * docs/architecture/FLEET_PROJECTS.md's Known Limitation.
 */
export function summarizeFleetProject(
  project: FleetProject,
  allBuilds: FleetBuild[],
  allTemplates: FleetBuildTemplate[],
): FleetProjectSummary {
  const builds = allBuilds.filter((build) => build.projectId === project.id);
  const templates = allTemplates.filter((template) => template.projectId === project.id);

  const completions = builds.map((build) => calculateFleetBuildCompletion(build));
  const averageCompletionPercent = completions.length
    ? Math.round(completions.reduce((sum, completion) => sum + completion.percent, 0) / completions.length)
    : 0;

  const completedBuildCount = completions.filter((completion) => completion.percent >= 100).length;
  const vehicleCount = builds.reduce((sum, build) => sum + build.quantity, 0);
  const estimatedProductCount = builds.reduce((sum, build) => sum + countSelectedProducts(build) * build.quantity, 0);
  const templateUsageCount = builds.filter((build) => Boolean(build.templateId)).length;

  const styleCounts = new Map<string, number>();
  builds.forEach((build) => {
    if (!build.buildStyle) return;
    styleCounts.set(build.buildStyle, (styleCounts.get(build.buildStyle) ?? 0) + 1);
  });
  const buildStyles = Array.from(styleCounts.entries()).map(([styleId, count]) => ({
    styleId,
    label: getBuildStyleLabel(styleId as Parameters<typeof getBuildStyleLabel>[0]),
    count,
  }));

  const lastModifiedCandidates = [
    project.updatedAt,
    ...builds.map((build) => build.createdAt),
    ...templates.map((template) => template.updatedAt),
  ];
  const lastModified = lastModifiedCandidates.length ? Math.max(...lastModifiedCandidates) : null;

  return {
    projectId: project.id,
    buildCount: builds.length,
    vehicleCount,
    templateCount: templates.length,
    averageCompletionPercent,
    completionColor: completionColorFromPercent(averageCompletionPercent),
    completedBuildCount,
    incompleteBuildCount: builds.length - completedBuildCount,
    estimatedProductCount,
    templateUsageCount,
    buildStyles,
    lastModified,
  };
}

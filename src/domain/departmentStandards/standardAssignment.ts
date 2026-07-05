import type { FleetBuild } from '@/types/fleetBuilds';
import type { FleetProject } from '@/types/fleetProjects';
import type { DepartmentStandard } from '@/types/departmentStandards';
import { getDepartmentStandardById } from './standardRules';

/**
 * Resolves which Department Standard id applies to a build: the build's own
 * assignment first (FleetBuild.departmentStandardId), falling back to its
 * Fleet Project's assignment (FleetProject.departmentStandardId). Null when
 * neither is set — the build simply has no standard yet.
 */
export function resolveAssignedStandardId(build: FleetBuild, project: FleetProject | null): string | null {
  if (build.departmentStandardId) return build.departmentStandardId;
  return project?.departmentStandardId ?? null;
}

/**
 * Resolves the full DepartmentStandard record effective for a build, checking
 * the build's own assignment, then its project's, then looking each up
 * across shipped defaults and saved company standards.
 */
export function resolveEffectiveStandard(
  build: FleetBuild,
  project: FleetProject | null,
  customStandards: DepartmentStandard[],
): DepartmentStandard | null {
  const standardId = resolveAssignedStandardId(build, project);
  return getDepartmentStandardById(standardId, customStandards);
}

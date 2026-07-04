import type { FleetBuild, FleetBuildStyleId, FleetBuildTemplate, FleetBuildVehicle } from '@/types/fleetBuilds';
import { cloneCategorySelections } from './cloneRules';
import { calculateFleetBuildCompletion } from './completion';
import { getBuildStyleLabel } from './buildStyles';

/** Keeps the saved-templates list bounded, mirroring MAX_FLEET_BUILDS. */
export const MAX_FLEET_TEMPLATES = 50;

/** `{Model} {Style}` when both are known (e.g. "Explorer Patrol"), falling back gracefully when either is missing. */
export function defaultTemplateName(
  vehicle: FleetBuildVehicle | null,
  buildStyle: FleetBuildStyleId | null,
  existingCount: number,
): string {
  const styleLabel = buildStyle ? getBuildStyleLabel(buildStyle) : null;
  if (vehicle?.model && styleLabel) return `${vehicle.model} ${styleLabel}`;
  if (vehicle?.model) return `${vehicle.model} Template`;
  if (styleLabel) return `${styleLabel} Template`;
  return `Fleet Template ${existingCount + 1}`;
}

/**
 * Snapshots a fleet build into a reusable template: vehicle, build style,
 * category selections, and a completion % taken at save time. `id` and
 * `createdAt` are supplied by the caller (context) so this stays
 * deterministic and side-effect-free, mirroring createFleetBuild.
 */
export function createTemplateFromBuild(
  id: string,
  createdAt: number,
  build: FleetBuild,
  existingTemplates: FleetBuildTemplate[],
  name?: string,
): FleetBuildTemplate {
  const trimmed = name?.trim();
  return {
    id,
    name: trimmed || defaultTemplateName(build.vehicle, build.buildStyle, existingTemplates.length),
    vehicle: build.vehicle,
    buildStyle: build.buildStyle,
    selections: cloneCategorySelections(build.selections),
    completionPercent: calculateFleetBuildCompletion(build).percent,
    sourceBuildId: build.id,
    createdAt,
    updatedAt: createdAt,
    usageCount: 0,
    lastUsedAt: null,
  };
}

export function addTemplate(templates: FleetBuildTemplate[], template: FleetBuildTemplate): FleetBuildTemplate[] {
  if (templates.length >= MAX_FLEET_TEMPLATES) return templates;
  return [...templates, template];
}

export function removeTemplate(templates: FleetBuildTemplate[], templateId: string): FleetBuildTemplate[] {
  return templates.filter((template) => template.id !== templateId);
}

export function renameTemplate(
  templates: FleetBuildTemplate[],
  templateId: string,
  name: string,
  updatedAt: number,
): FleetBuildTemplate[] {
  const trimmed = name.trim();
  if (!trimmed) return templates;
  return templates.map((template) => (template.id === templateId ? { ...template, name: trimmed, updatedAt } : template));
}

/** Increments usage tracking — called when a template is applied to a build or cloned into a new one, never on plain build-to-build clones. */
export function touchTemplateUsage(templates: FleetBuildTemplate[], templateId: string, usedAt: number): FleetBuildTemplate[] {
  return templates.map((template) => (
    template.id === templateId
      ? { ...template, usageCount: template.usageCount + 1, lastUsedAt: usedAt }
      : template
  ));
}

export function getTemplateById(templates: FleetBuildTemplate[], templateId: string | null | undefined): FleetBuildTemplate | null {
  if (!templateId) return null;
  return templates.find((template) => template.id === templateId) ?? null;
}

/** How many current fleet builds have this template applied to or cloned into them — "vehicles using template" on the Workspace summary. */
export function countBuildsUsingTemplate(builds: FleetBuild[], templateId: string): number {
  return builds.filter((build) => build.templateId === templateId).length;
}

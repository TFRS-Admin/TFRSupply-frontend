import type { FleetProject } from '@/types/fleetProjects';

/** Keeps the workspace a small set of active programs, mirroring MAX_FLEET_BUILDS/MAX_FLEET_TEMPLATES. */
export const MAX_FLEET_PROJECTS = 20;

/**
 * Fixed (not generated) id for the project every pre-existing Fleet Build/
 * Template is normalized onto the first time this feature loads for a
 * customer who already had fleet data — see FleetBuildsContext/
 * FleetTemplatesContext's loadFromStorage. Using a fixed id (rather than a
 * timestamp-based one) means the bootstrap project in FleetProjectContext
 * always lines up with that legacy data, even before the project itself has
 * been persisted.
 */
export const DEFAULT_PROJECT_ID = 'fleet-project-default';
export const DEFAULT_PROJECT_NAME = 'My Fleet Project';

function nextDefaultProjectName(current: FleetProject[]): string {
  return `Fleet Project ${current.length + 1}`;
}

/** The always-present bootstrap project a fresh install (or legacy fleet data) lands in. */
export function createDefaultFleetProject(createdAt: number): FleetProject {
  return { id: DEFAULT_PROJECT_ID, name: DEFAULT_PROJECT_NAME, archived: false, createdAt, updatedAt: createdAt };
}

/**
 * Pure fleet-project CRUD rules, mirroring fleetBuildRules.ts/templateRules.ts
 * so create/rename/archive/remove behavior can be unit tested without a
 * localStorage-backed context. `id`/`createdAt`/`updatedAt` are supplied by
 * the caller (context) so this stays deterministic and side-effect-free.
 */
export function createFleetProject(id: string, createdAt: number, current: FleetProject[], name?: string): FleetProject {
  const trimmed = name?.trim();
  return { id, name: trimmed || nextDefaultProjectName(current), archived: false, createdAt, updatedAt: createdAt };
}

export function addFleetProject(current: FleetProject[], project: FleetProject): FleetProject[] {
  if (current.length >= MAX_FLEET_PROJECTS) return current;
  return [...current, project];
}

export function removeFleetProject(current: FleetProject[], projectId: string): FleetProject[] {
  return current.filter((project) => project.id !== projectId);
}

/** Resolves the next active project id after `removedProjectId` was removed, preferring a non-archived project. */
export function resolveNextActiveProjectId(
  projectsAfterRemoval: FleetProject[],
  removedProjectId: string,
  previousActiveId: string | null,
): string | null {
  if (previousActiveId !== removedProjectId) return previousActiveId;
  const firstActive = projectsAfterRemoval.find((project) => !project.archived);
  return firstActive?.id ?? projectsAfterRemoval[0]?.id ?? null;
}

export function renameFleetProject(current: FleetProject[], projectId: string, name: string, updatedAt: number): FleetProject[] {
  const trimmed = name.trim();
  if (!trimmed) return current;
  return current.map((project) => (project.id === projectId ? { ...project, name: trimmed, updatedAt } : project));
}

export function setFleetProjectArchived(
  current: FleetProject[],
  projectId: string,
  archived: boolean,
  updatedAt: number,
): FleetProject[] {
  return current.map((project) => (project.id === projectId ? { ...project, archived, updatedAt } : project));
}

/** Duplicates a project's metadata only — the caller is responsible for duplicating its builds/templates. */
export function duplicateFleetProjectMeta(id: string, createdAt: number, source: FleetProject): FleetProject {
  return { id, name: `${source.name} (Copy)`, archived: false, createdAt, updatedAt: createdAt };
}

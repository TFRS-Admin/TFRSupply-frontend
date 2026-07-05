/**
 * context/FleetProjectContext.jsx
 * Fleet Projects — the top-level planning object that groups multiple Fleet
 * Builds and Fleet Templates into one customer program (e.g. "2026 Patrol
 * Vehicle Replacement"). This context owns only project metadata (name,
 * archived flag, timestamps) and which project is active; FleetBuildsContext
 * and FleetTemplatesContext each read `activeProjectId` from here and scope
 * their own build/template lists to it (see those files) — switching
 * projects changes which builds/templates are visible without losing
 * anything, since builds/templates outside the active project simply stay in
 * storage, filtered out of view. No backend, authentication, or Shopify
 * calls are involved.
 *
 * This context always exposes at least one project: the first time it loads
 * with nothing in storage, it bootstraps DEFAULT_PROJECT_ID (the same fixed
 * id FleetBuildsContext/FleetTemplatesContext normalize any project-less
 * legacy build/template onto), so a customer who already had fleet builds
 * before this feature shipped never loses them.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MAX_FLEET_PROJECTS,
  createDefaultFleetProject,
  createFleetProject,
  addFleetProject,
  removeFleetProject,
  resolveNextActiveProjectId,
  renameFleetProject,
  setFleetProjectArchived,
  duplicateFleetProjectMeta,
} from '@/domain/fleetProjects';

const STORAGE_KEY = 'tfr_fleet_projects';
export { MAX_FLEET_PROJECTS };

function isValidStoredProject(value) {
  return Boolean(
    value && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.createdAt === 'number',
  );
}

function saveToStorage(projects, activeProjectId) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, activeProjectId }));
}

/**
 * Bootstraps the always-present default project in memory only — it is
 * persisted the same way any other project is, the first time a real
 * mutation (create/rename/archive/switch) calls saveToStorage, mirroring
 * every other context here (VehicleContext, FleetBuildsContext, etc.), none
 * of which write to localStorage outside of a mutation callback. Since
 * DEFAULT_PROJECT_ID is a fixed id rather than a timestamp-based one,
 * re-bootstrapping on every load before that first mutation is harmless —
 * it always resolves to the same project id.
 */
function bootstrapDefaultProject() {
  const defaultProject = createDefaultFleetProject(Date.now());
  return { projects: [defaultProject], activeProjectId: defaultProject.id };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const projects = Array.isArray(parsed?.projects) ? parsed.projects.filter(isValidStoredProject) : [];
      if (projects.length > 0) {
        const activeProjectId = typeof parsed?.activeProjectId === 'string' && projects.some((project) => project.id === parsed.activeProjectId)
          ? parsed.activeProjectId
          : (projects.find((project) => !project.archived)?.id ?? projects[0].id);
        return { projects, activeProjectId };
      }
    }
  } catch {
    // fall through to bootstrap a default project below
  }
  return bootstrapDefaultProject();
}

function generateProjectId() {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const FleetProjectContext = createContext(null);

export function FleetProjectProvider({ children }) {
  const [state, setState] = useState(() => loadFromStorage());

  const createProject = useCallback((name) => {
    const newId = generateProjectId();
    const createdAt = Date.now();
    let created = null;
    setState((current) => {
      if (current.projects.length >= MAX_FLEET_PROJECTS) return current;
      created = createFleetProject(newId, createdAt, current.projects, name);
      const projects = addFleetProject(current.projects, created);
      saveToStorage(projects, newId);
      return { projects, activeProjectId: newId };
    });
    return created;
  }, []);

  const renameProject = useCallback((projectId, name) => {
    setState((current) => {
      const projects = renameFleetProject(current.projects, projectId, name, Date.now());
      saveToStorage(projects, current.activeProjectId);
      return { ...current, projects };
    });
  }, []);

  const archiveProject = useCallback((projectId) => {
    setState((current) => {
      const projects = setFleetProjectArchived(current.projects, projectId, true, Date.now());
      const activeProjectId = current.activeProjectId === projectId
        ? (projects.find((project) => !project.archived)?.id ?? current.activeProjectId)
        : current.activeProjectId;
      saveToStorage(projects, activeProjectId);
      return { projects, activeProjectId };
    });
  }, []);

  const unarchiveProject = useCallback((projectId) => {
    setState((current) => {
      const projects = setFleetProjectArchived(current.projects, projectId, false, Date.now());
      saveToStorage(projects, current.activeProjectId);
      return { ...current, projects };
    });
  }, []);

  const deleteProject = useCallback((projectId) => {
    setState((current) => {
      const projects = removeFleetProject(current.projects, projectId);
      const activeProjectId = resolveNextActiveProjectId(projects, projectId, current.activeProjectId);
      saveToStorage(projects, activeProjectId);
      return { projects, activeProjectId };
    });
  }, []);

  const setActiveProject = useCallback((projectId) => {
    setState((current) => {
      if (!current.projects.some((project) => project.id === projectId)) return current;
      saveToStorage(current.projects, projectId);
      return { ...current, activeProjectId: projectId };
    });
  }, []);

  // Fleet Projects — Duplicate Project: creates the new project's metadata
  // only. The caller (useFleetProjectActions) also duplicates the source
  // project's builds/templates via FleetBuildsContext/FleetTemplatesContext,
  // since this context has no knowledge of fleet build/template content by
  // design. Mirrors cloneBuild — never switches the active project.
  const duplicateProject = useCallback((projectId) => {
    const newId = generateProjectId();
    const createdAt = Date.now();
    let created = null;
    setState((current) => {
      const source = current.projects.find((project) => project.id === projectId);
      if (!source || current.projects.length >= MAX_FLEET_PROJECTS) return current;
      created = duplicateFleetProjectMeta(newId, createdAt, source);
      const projects = [...current.projects, created];
      saveToStorage(projects, current.activeProjectId);
      return { ...current, projects };
    });
    return created;
  }, []);

  const activeProject = useMemo(
    () => state.projects.find((project) => project.id === state.activeProjectId) ?? null,
    [state.projects, state.activeProjectId],
  );

  const value = useMemo(() => ({
    projects: state.projects,
    activeProjectId: state.activeProjectId,
    activeProject,
    isFull: state.projects.length >= MAX_FLEET_PROJECTS,
    createProject,
    renameProject,
    archiveProject,
    unarchiveProject,
    deleteProject,
    duplicateProject,
    setActiveProject,
  }), [
    state.projects, state.activeProjectId, activeProject,
    createProject, renameProject, archiveProject, unarchiveProject, deleteProject, duplicateProject, setActiveProject,
  ]);

  return <FleetProjectContext.Provider value={value}>{children}</FleetProjectContext.Provider>;
}

export function useFleetProject() {
  const ctx = useContext(FleetProjectContext);
  if (!ctx) throw new Error('useFleetProject must be used within FleetProjectProvider');
  return ctx;
}

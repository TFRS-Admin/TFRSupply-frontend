/**
 * context/FleetBuildsContext.jsx
 * Fleet Vehicle Shopping Modes — client-side fleet build workspace state.
 * Persists to localStorage, mirroring CompareContext/SavedProductsContext's
 * pattern. Every add/remove/rename/vehicle/quantity/style/completion decision
 * delegates to the pure functions in src/domain/fleetBuilds; this context
 * only owns React state wiring, id/timestamp generation, and localStorage
 * persistence. No backend, authentication, or Shopify calls are involved.
 *
 * Fleet Projects — every build belongs to exactly one Fleet Project
 * (`build.projectId`). This context reads the active project id from
 * FleetProjectContext and exposes `builds`/`activeBuild`/`isFull` scoped to
 * it, so every existing consumer (FleetBuildsPanel, FinishYourUpfitPanel,
 * etc.) automatically "operates on the active project" without any changes
 * of its own — switching projects just changes which slice of the same
 * `allBuilds` array (also exposed, unscoped, for cross-project summaries
 * like the Workspace Projects list) is visible. Nothing is ever deleted by
 * switching; MAX_FLEET_BUILDS is enforced per project, not globally.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MAX_FLEET_BUILDS,
  createFleetBuild,
  addFleetBuild,
  removeFleetBuild,
  resolveNextActiveBuildId,
  renameFleetBuild,
  updateFleetBuildVehicle,
  updateFleetBuildQuantity,
  updateFleetBuildStyle,
  addProductToBuildCategory,
  removeProductFromBuildCategory,
  addProductToAllCompatibleBuilds,
  cloneFleetBuildFromSource,
  applyTemplateToBuild as applyTemplateToBuildDomain,
  cloneCategorySelections,
} from '@/domain/fleetBuilds';
import { DEFAULT_PROJECT_ID } from '@/domain/fleetProjects';
import { useFleetProject } from './FleetProjectContext';

const STORAGE_KEY = 'tfr_fleet_builds';
export { MAX_FLEET_BUILDS };

function isValidStoredBuild(value) {
  return Boolean(
    value && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && value.selections && typeof value.selections === 'object',
  );
}

/** Pre-Fleet-Projects builds have no projectId — normalize them onto the default project so they're never lost. */
function normalizeBuild(build) {
  return typeof build.projectId === 'string' ? build : { ...build, projectId: DEFAULT_PROJECT_ID };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { allBuilds: [], activeBuildIdByProject: {} };

    const parsed = JSON.parse(raw);
    const allBuilds = Array.isArray(parsed?.builds) ? parsed.builds.filter(isValidStoredBuild).map(normalizeBuild) : [];

    if (parsed?.activeBuildIdByProject && typeof parsed.activeBuildIdByProject === 'object') {
      return { allBuilds, activeBuildIdByProject: { ...parsed.activeBuildIdByProject } };
    }

    // Legacy shape (pre-Fleet-Projects): a single global activeBuildId, which
    // always referred to a build now normalized onto DEFAULT_PROJECT_ID.
    if (typeof parsed?.activeBuildId === 'string') {
      return { allBuilds, activeBuildIdByProject: { [DEFAULT_PROJECT_ID]: parsed.activeBuildId } };
    }

    return { allBuilds, activeBuildIdByProject: {} };
  } catch {
    return { allBuilds: [], activeBuildIdByProject: {} };
  }
}

function saveToStorage(allBuilds, activeBuildIdByProject) {
  if (allBuilds.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds: allBuilds, activeBuildIdByProject }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function generateBuildId() {
  return `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toProductSelection(product, addedAt) {
  return { productId: product.id, label: product.title ?? product.label ?? product.id, addedAt };
}

const FleetBuildsContext = createContext(null);

export function FleetBuildsProvider({ children }) {
  const { activeProjectId } = useFleetProject();
  const [state, setState] = useState(() => loadFromStorage());

  const scopedBuilds = useMemo(
    () => state.allBuilds.filter((build) => build.projectId === activeProjectId),
    [state.allBuilds, activeProjectId],
  );
  const activeBuildId = state.activeBuildIdByProject[activeProjectId] ?? scopedBuilds[0]?.id ?? null;

  const addBuild = useCallback(() => {
    if (!activeProjectId) return null;
    const newId = generateBuildId();
    const createdAt = Date.now();
    setState((current) => {
      const scoped = current.allBuilds.filter((build) => build.projectId === activeProjectId);
      if (scoped.length >= MAX_FLEET_BUILDS) return current;
      const build = { ...createFleetBuild(newId, createdAt, scoped), projectId: activeProjectId };
      const allBuilds = [...current.allBuilds, build];
      const activeBuildIdByProject = { ...current.activeBuildIdByProject, [activeProjectId]: newId };
      saveToStorage(allBuilds, activeBuildIdByProject);
      return { allBuilds, activeBuildIdByProject };
    });
    return newId;
  }, [activeProjectId]);

  const removeBuild = useCallback((buildId) => {
    setState((current) => {
      const build = current.allBuilds.find((b) => b.id === buildId);
      if (!build) return current;
      const allBuilds = removeFleetBuild(current.allBuilds, buildId);
      const scopedAfter = allBuilds.filter((b) => b.projectId === build.projectId);
      const previousActiveId = current.activeBuildIdByProject[build.projectId] ?? null;
      const nextActiveId = resolveNextActiveBuildId(scopedAfter, buildId, previousActiveId);
      const activeBuildIdByProject = { ...current.activeBuildIdByProject, [build.projectId]: nextActiveId };
      saveToStorage(allBuilds, activeBuildIdByProject);
      return { allBuilds, activeBuildIdByProject };
    });
  }, []);

  const setActiveBuild = useCallback((buildId) => {
    setState((current) => {
      const activeBuildIdByProject = { ...current.activeBuildIdByProject, [activeProjectId]: buildId };
      saveToStorage(current.allBuilds, activeBuildIdByProject);
      return { ...current, activeBuildIdByProject };
    });
  }, [activeProjectId]);

  const renameBuild = useCallback((buildId, name) => {
    setState((current) => {
      const allBuilds = renameFleetBuild(current.allBuilds, buildId, name);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  const updateVehicle = useCallback((buildId, vehicle) => {
    setState((current) => {
      const allBuilds = updateFleetBuildVehicle(current.allBuilds, buildId, vehicle);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  const updateQuantity = useCallback((buildId, quantity) => {
    setState((current) => {
      const allBuilds = updateFleetBuildQuantity(current.allBuilds, buildId, quantity);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  const updateStyle = useCallback((buildId, buildStyle) => {
    setState((current) => {
      const allBuilds = updateFleetBuildStyle(current.allBuilds, buildId, buildStyle);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  const addProductToBuild = useCallback((buildId, categoryId, product) => {
    const selection = toProductSelection(product, Date.now());
    setState((current) => {
      const allBuilds = addProductToBuildCategory(current.allBuilds, buildId, categoryId, selection);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  const removeProductFromBuild = useCallback((buildId, categoryId, productId) => {
    setState((current) => {
      const allBuilds = removeProductFromBuildCategory(current.allBuilds, buildId, categoryId, productId);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  const addProductToActiveBuild = useCallback((categoryId, product) => {
    const selection = toProductSelection(product, Date.now());
    setState((current) => {
      const currentActiveBuildId = current.activeBuildIdByProject[activeProjectId]
        ?? current.allBuilds.find((build) => build.projectId === activeProjectId)?.id
        ?? null;
      if (!currentActiveBuildId) return current;
      const allBuilds = addProductToBuildCategory(current.allBuilds, currentActiveBuildId, categoryId, selection);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, [activeProjectId]);

  const addToAllCompatibleBuilds = useCallback((product) => {
    const addedAt = Date.now();
    let outcome = null;
    setState((current) => {
      const scoped = current.allBuilds.filter((build) => build.projectId === activeProjectId);
      const { builds: updatedScoped, result } = addProductToAllCompatibleBuilds(scoped, product, addedAt);
      outcome = result;
      const updatedById = new Map(updatedScoped.map((build) => [build.id, build]));
      const allBuilds = current.allBuilds.map((build) => updatedById.get(build.id) ?? build);
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
    return outcome;
  }, [activeProjectId]);

  // Fleet Templates & Vehicle Cloning — clone an existing build or saved
  // template into a brand-new build in the active project. Does not switch
  // the active build, since cloning is typically used to spin off copies for
  // other vehicles while staying focused on the build already being edited.
  const cloneBuild = useCallback((source, destination, getProductVerticalIds) => {
    if (!activeProjectId) return null;
    const newId = generateBuildId();
    const createdAt = Date.now();
    let outcome = null;
    setState((current) => {
      const scoped = current.allBuilds.filter((build) => build.projectId === activeProjectId);
      if (scoped.length >= MAX_FLEET_BUILDS) return current;
      const { build, flaggedIncompatible } = cloneFleetBuildFromSource(newId, createdAt, source, destination, getProductVerticalIds);
      const projectBuild = { ...build, projectId: activeProjectId };
      outcome = { build: projectBuild, flaggedIncompatible };
      const allBuilds = [...current.allBuilds, projectBuild];
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
    return outcome;
  }, [activeProjectId]);

  // Applies a saved template's build style + selections onto an existing
  // build in place (see applyTemplateToBuild in src/domain/fleetBuilds).
  const applyTemplate = useCallback((buildId, template, getProductVerticalIds) => {
    let outcome = null;
    setState((current) => {
      const build = current.allBuilds.find((b) => b.id === buildId);
      if (!build) return current;
      const { build: updatedBuild, flaggedIncompatible } = applyTemplateToBuildDomain(build, template, getProductVerticalIds);
      outcome = { build: updatedBuild, flaggedIncompatible };
      const allBuilds = current.allBuilds.map((b) => (b.id === buildId ? updatedBuild : b));
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
    return outcome;
  }, []);

  // Fleet Projects — Duplicate Project: clones every build belonging to
  // sourceProjectId into destProjectId with new ids, preserving vehicle/
  // quantity/style/selections/templateId. Never switches the active build.
  const duplicateBuildsForProject = useCallback((sourceProjectId, destProjectId) => {
    setState((current) => {
      const sourceBuilds = current.allBuilds.filter((build) => build.projectId === sourceProjectId);
      if (sourceBuilds.length === 0) return current;
      const stamp = Date.now();
      const duplicated = sourceBuilds.map((build, index) => ({
        ...build,
        id: `build-${stamp}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        projectId: destProjectId,
        selections: cloneCategorySelections(build.selections),
        createdAt: stamp,
      }));
      const allBuilds = [...current.allBuilds, ...duplicated];
      saveToStorage(allBuilds, current.activeBuildIdByProject);
      return { ...current, allBuilds };
    });
  }, []);

  // Fleet Projects — Delete Project cascade: removes every build belonging
  // to projectId along with its per-project active-build bookkeeping.
  const removeBuildsForProject = useCallback((projectId) => {
    setState((current) => {
      const allBuilds = current.allBuilds.filter((build) => build.projectId !== projectId);
      const activeBuildIdByProject = { ...current.activeBuildIdByProject };
      delete activeBuildIdByProject[projectId];
      saveToStorage(allBuilds, activeBuildIdByProject);
      return { allBuilds, activeBuildIdByProject };
    });
  }, []);

  const activeBuild = useMemo(
    () => scopedBuilds.find((build) => build.id === activeBuildId) ?? null,
    [scopedBuilds, activeBuildId],
  );

  const value = useMemo(() => ({
    builds: scopedBuilds,
    allBuilds: state.allBuilds,
    activeBuildId,
    activeBuild,
    isFull: scopedBuilds.length >= MAX_FLEET_BUILDS,
    addBuild,
    removeBuild,
    setActiveBuild,
    renameBuild,
    updateVehicle,
    updateQuantity,
    updateStyle,
    addProductToBuild,
    removeProductFromBuild,
    addProductToActiveBuild,
    addToAllCompatibleBuilds,
    cloneBuild,
    applyTemplate,
    duplicateBuildsForProject,
    removeBuildsForProject,
  }), [
    scopedBuilds, state.allBuilds, activeBuildId, activeBuild,
    addBuild, removeBuild, setActiveBuild, renameBuild, updateVehicle, updateQuantity, updateStyle,
    addProductToBuild, removeProductFromBuild, addProductToActiveBuild, addToAllCompatibleBuilds,
    cloneBuild, applyTemplate, duplicateBuildsForProject, removeBuildsForProject,
  ]);

  return <FleetBuildsContext.Provider value={value}>{children}</FleetBuildsContext.Provider>;
}

export function useFleetBuilds() {
  const ctx = useContext(FleetBuildsContext);
  if (!ctx) throw new Error('useFleetBuilds must be used within FleetBuildsProvider');
  return ctx;
}

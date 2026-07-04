/**
 * context/FleetBuildsContext.jsx
 * Fleet Vehicle Shopping Modes — client-side fleet build workspace state.
 * Persists to localStorage, mirroring CompareContext/SavedProductsContext's
 * pattern. Every add/remove/rename/vehicle/quantity/style/completion decision
 * delegates to the pure functions in src/domain/fleetBuilds; this context
 * only owns React state wiring, id/timestamp generation, and localStorage
 * persistence. No backend, authentication, or Shopify calls are involved.
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
} from '@/domain/fleetBuilds';

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

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { builds: [], activeBuildId: null };

    const parsed = JSON.parse(raw);
    const builds = Array.isArray(parsed?.builds) ? parsed.builds.filter(isValidStoredBuild) : [];
    const activeBuildId = typeof parsed?.activeBuildId === 'string' && builds.some((build) => build.id === parsed.activeBuildId)
      ? parsed.activeBuildId
      : (builds[0]?.id ?? null);

    return { builds, activeBuildId };
  } catch {
    return { builds: [], activeBuildId: null };
  }
}

function saveToStorage(builds, activeBuildId) {
  if (builds.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ builds, activeBuildId }));
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
  const [state, setState] = useState(() => loadFromStorage());

  const addBuild = useCallback(() => {
    const newId = generateBuildId();
    const createdAt = Date.now();
    setState((current) => {
      const build = createFleetBuild(newId, createdAt, current.builds);
      const builds = addFleetBuild(current.builds, build);
      const activeBuildId = builds === current.builds ? current.activeBuildId : newId;
      saveToStorage(builds, activeBuildId);
      return { builds, activeBuildId };
    });
    return newId;
  }, []);

  const removeBuild = useCallback((buildId) => {
    setState((current) => {
      const builds = removeFleetBuild(current.builds, buildId);
      const activeBuildId = resolveNextActiveBuildId(builds, buildId, current.activeBuildId);
      saveToStorage(builds, activeBuildId);
      return { builds, activeBuildId };
    });
  }, []);

  const setActiveBuild = useCallback((buildId) => {
    setState((current) => {
      saveToStorage(current.builds, buildId);
      return { ...current, activeBuildId: buildId };
    });
  }, []);

  const renameBuild = useCallback((buildId, name) => {
    setState((current) => {
      const builds = renameFleetBuild(current.builds, buildId, name);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const updateVehicle = useCallback((buildId, vehicle) => {
    setState((current) => {
      const builds = updateFleetBuildVehicle(current.builds, buildId, vehicle);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const updateQuantity = useCallback((buildId, quantity) => {
    setState((current) => {
      const builds = updateFleetBuildQuantity(current.builds, buildId, quantity);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const updateStyle = useCallback((buildId, buildStyle) => {
    setState((current) => {
      const builds = updateFleetBuildStyle(current.builds, buildId, buildStyle);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const addProductToBuild = useCallback((buildId, categoryId, product) => {
    const selection = toProductSelection(product, Date.now());
    setState((current) => {
      const builds = addProductToBuildCategory(current.builds, buildId, categoryId, selection);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const removeProductFromBuild = useCallback((buildId, categoryId, productId) => {
    setState((current) => {
      const builds = removeProductFromBuildCategory(current.builds, buildId, categoryId, productId);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const addProductToActiveBuild = useCallback((categoryId, product) => {
    const selection = toProductSelection(product, Date.now());
    setState((current) => {
      if (!current.activeBuildId) return current;
      const builds = addProductToBuildCategory(current.builds, current.activeBuildId, categoryId, selection);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
  }, []);

  const addToAllCompatibleBuilds = useCallback((product) => {
    const addedAt = Date.now();
    let outcome = null;
    setState((current) => {
      const { builds, result } = addProductToAllCompatibleBuilds(current.builds, product, addedAt);
      outcome = result;
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
    return outcome;
  }, []);

  // Fleet Templates & Vehicle Cloning — clone an existing build or saved
  // template into a brand-new build. Does not switch the active build, since
  // cloning is typically used to spin off copies for other vehicles while
  // staying focused on the build already being edited.
  const cloneBuild = useCallback((source, destination, getProductVerticalIds) => {
    const newId = generateBuildId();
    const createdAt = Date.now();
    let outcome = null;
    setState((current) => {
      if (current.builds.length >= MAX_FLEET_BUILDS) return current;
      const { build, flaggedIncompatible } = cloneFleetBuildFromSource(newId, createdAt, source, destination, getProductVerticalIds);
      outcome = { build, flaggedIncompatible };
      const builds = addFleetBuild(current.builds, build);
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
    return outcome;
  }, []);

  // Applies a saved template's build style + selections onto an existing
  // build in place (see applyTemplateToBuild in src/domain/fleetBuilds).
  const applyTemplate = useCallback((buildId, template, getProductVerticalIds) => {
    let outcome = null;
    setState((current) => {
      const build = current.builds.find((b) => b.id === buildId);
      if (!build) return current;
      const { build: updatedBuild, flaggedIncompatible } = applyTemplateToBuildDomain(build, template, getProductVerticalIds);
      outcome = { build: updatedBuild, flaggedIncompatible };
      const builds = current.builds.map((b) => (b.id === buildId ? updatedBuild : b));
      saveToStorage(builds, current.activeBuildId);
      return { ...current, builds };
    });
    return outcome;
  }, []);

  const activeBuild = useMemo(
    () => state.builds.find((build) => build.id === state.activeBuildId) ?? null,
    [state.builds, state.activeBuildId],
  );

  const value = useMemo(() => ({
    builds: state.builds,
    activeBuildId: state.activeBuildId,
    activeBuild,
    isFull: state.builds.length >= MAX_FLEET_BUILDS,
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
  }), [
    state.builds, state.activeBuildId, activeBuild,
    addBuild, removeBuild, setActiveBuild, renameBuild, updateVehicle, updateQuantity, updateStyle,
    addProductToBuild, removeProductFromBuild, addProductToActiveBuild, addToAllCompatibleBuilds,
    cloneBuild, applyTemplate,
  ]);

  return <FleetBuildsContext.Provider value={value}>{children}</FleetBuildsContext.Provider>;
}

export function useFleetBuilds() {
  const ctx = useContext(FleetBuildsContext);
  if (!ctx) throw new Error('useFleetBuilds must be used within FleetBuildsProvider');
  return ctx;
}

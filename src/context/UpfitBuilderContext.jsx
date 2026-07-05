/**
 * context/UpfitBuilderContext.jsx
 * Guided Vehicle Upfit Builder — the only new client-side state this feature
 * introduces. Everything else the guided flow walks through (active Fleet
 * Project, active Fleet Build, its vehicle/department standard/build style/
 * category selections) already persists via FleetProjectContext/
 * FleetBuildsContext/DepartmentStandardsContext — this context only tracks,
 * per fleet build id, which step its guided flow last stopped on and which
 * optional steps were explicitly skipped. Persists to localStorage, mirroring
 * DepartmentStandardsContext's pattern. No backend, authentication, or
 * Shopify calls are involved.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'tfr_upfit_builder';

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { currentStepByBuildId: {}, skippedByBuildId: {} };
    const parsed = JSON.parse(raw);
    return {
      currentStepByBuildId: isPlainObject(parsed?.currentStepByBuildId) ? { ...parsed.currentStepByBuildId } : {},
      skippedByBuildId: isPlainObject(parsed?.skippedByBuildId) ? { ...parsed.skippedByBuildId } : {},
    };
  } catch {
    return { currentStepByBuildId: {}, skippedByBuildId: {} };
  }
}

function saveToStorage(state) {
  const hasData = Object.keys(state.currentStepByBuildId).length > 0 || Object.keys(state.skippedByBuildId).length > 0;
  if (hasData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const UpfitBuilderContext = createContext(null);

export function UpfitBuilderProvider({ children }) {
  const [state, setState] = useState(() => loadFromStorage());

  const getCurrentStepId = useCallback(
    (buildId) => (buildId ? state.currentStepByBuildId[buildId] ?? null : null),
    [state.currentStepByBuildId],
  );

  const setCurrentStepId = useCallback((buildId, stepId) => {
    if (!buildId) return;
    setState((current) => {
      const next = { ...current, currentStepByBuildId: { ...current.currentStepByBuildId, [buildId]: stepId } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const getSkippedSteps = useCallback(
    (buildId) => (buildId ? state.skippedByBuildId[buildId] ?? [] : []),
    [state.skippedByBuildId],
  );

  const skipStep = useCallback((buildId, stepId) => {
    if (!buildId) return;
    setState((current) => {
      const existing = current.skippedByBuildId[buildId] ?? [];
      if (existing.includes(stepId)) return current;
      const next = { ...current, skippedByBuildId: { ...current.skippedByBuildId, [buildId]: [...existing, stepId] } };
      saveToStorage(next);
      return next;
    });
  }, []);

  const unskipStep = useCallback((buildId, stepId) => {
    if (!buildId) return;
    setState((current) => {
      const existing = current.skippedByBuildId[buildId] ?? [];
      if (!existing.includes(stepId)) return current;
      const next = {
        ...current,
        skippedByBuildId: { ...current.skippedByBuildId, [buildId]: existing.filter((id) => id !== stepId) },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    getCurrentStepId,
    setCurrentStepId,
    getSkippedSteps,
    skipStep,
    unskipStep,
  }), [getCurrentStepId, setCurrentStepId, getSkippedSteps, skipStep, unskipStep]);

  return <UpfitBuilderContext.Provider value={value}>{children}</UpfitBuilderContext.Provider>;
}

export function useUpfitBuilder() {
  const ctx = useContext(UpfitBuilderContext);
  if (!ctx) throw new Error('useUpfitBuilder must be used within UpfitBuilderProvider');
  return ctx;
}

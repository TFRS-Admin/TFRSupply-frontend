/**
 * context/ConfigurationContext.jsx
 * React context layer over the pure configuratorEngine.
 * Components use this context — never import the engine directly.
 */

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { initializeEngine, applySelection, clearStep, computeSummary } from '@/domain/configuration/configuratorEngine';
import { useConfiguratorData } from '@/hooks/useConfiguratorData';

const ConfigurationContext = createContext(null);

export function ConfigurationProvider({ configuratorId, children }) {
  const { data: configuratorJson } = useConfiguratorData(configuratorId);

  const engineState = useMemo(() => {
    if (!configuratorJson) return null;
    return initializeEngine(configuratorJson);
  }, [configuratorJson]);

  const [selections, setSelections] = useState({});

  const selectOption = useCallback((stepId, optionId) => {
    if (!engineState) return;
    setSelections(prev => applySelection(engineState.session, prev, stepId, optionId));
  }, [engineState]);

  const clearStepSelection = useCallback((stepId) => {
    setSelections(prev => clearStep(prev, stepId));
  }, []);

  const resetConfiguration = useCallback(() => {
    setSelections({});
  }, []);

  const summary = useMemo(() => {
    if (!engineState) return null;
    return computeSummary(engineState.session, selections);
  }, [engineState, selections]);

  const value = {
    session: engineState?.session || null,
    selections,
    summary,
    selectOption,
    clearStepSelection,
    resetConfiguration,
    isLoaded: !!engineState,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const ctx = useContext(ConfigurationContext);
  if (!ctx) throw new Error('useConfiguration must be used inside ConfigurationProvider');
  return ctx;
}
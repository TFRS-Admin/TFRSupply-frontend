import React, { createContext, useContext, useReducer, useState } from 'react';

const ConfiguratorContext = createContext(null);

const initialState = {
  selectedFamily: null,
  currentStep: 0,
  vehicle: { year: '', make: '', model: '', trim: '' },
  coreOption: null,
  accessories: [],
  resolvedDependencies: [],
  buildSummary: null,
};

function configuratorReducer(state, action) {
  switch (action.type) {
    case 'SELECT_FAMILY':
      return { ...initialState, selectedFamily: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_VEHICLE':
      return { ...state, vehicle: action.payload, resolvedDependencies: [] };
    case 'SET_CORE_OPTION':
      return { ...state, coreOption: action.payload };
    case 'TOGGLE_ACCESSORY':
      const exists = state.accessories.find(a => a.id === action.payload.id);
      return {
        ...state,
        accessories: exists
          ? state.accessories.filter(a => a.id !== action.payload.id)
          : [...state.accessories, action.payload],
      };
    case 'SET_ACCESSORIES':
      return { ...state, accessories: action.payload };
    case 'SET_DEPENDENCIES':
      return { ...state, resolvedDependencies: action.payload };
    case 'FINALIZE_BUILD':
      return { ...state, buildSummary: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function ConfiguratorProvider({ children }) {
  const [state, dispatch] = useReducer(configuratorReducer, initialState);
  const [debugMode, setDebugMode] = useState(false);

  return (
    <ConfiguratorContext.Provider value={{ state, dispatch, debugMode, setDebugMode }}>
      {children}
    </ConfiguratorContext.Provider>
  );
}

export function useConfigurator() {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error('useConfigurator must be used within ConfiguratorProvider');
  return ctx;
}
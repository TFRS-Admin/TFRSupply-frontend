/**
 * context/VehicleContext.jsx
 * Global vehicle selection — persists across page navigation.
 * Provides selectedVehicle and setSelectedVehicle to any component.
 * Product configurators can read selectedVehicle for future filtering.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'tfr_selected_vehicle';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  // Hydrate from localStorage on first render
  const [selectedVehicle, _setSelectedVehicle] = useState(() => loadFromStorage());

  const setSelectedVehicle = useCallback((vehicle) => {
    _setSelectedVehicle(vehicle);
    if (vehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <VehicleContext.Provider value={{ selectedVehicle, setSelectedVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicle must be used within VehicleProvider');
  return ctx;
}
/**
 * context/VehicleContext.jsx
 * Global vehicle selection — persists across page navigation.
 * Provides selectedVehicle and setSelectedVehicle to any component.
 * Product configurators can read selectedVehicle for future filtering.
 */
import React, { createContext, useContext, useState } from 'react';

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  // selectedVehicle shape: { year: string, make: string, model: string } | null

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
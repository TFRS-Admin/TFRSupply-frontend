/**
 * data/vehicles/vehicleMaster.ts
 * Vehicle Master — expanded per Vehicle_Master_Additions workbook (2026-06-29)
 * vehicleId used for fitment/dependency lookups in configurator JSON vehicleRules.
 *
 * Extracted from VehicleSelectorModal so the Shop by Vehicle tab and the Fleet
 * Builds tab (per-build vehicle picker) share one vehicle list instead of
 * duplicating it — no vehicle data changed.
 */

export interface VehicleMasterEntry {
  vehicleId: string;
  year: string;
  make: string;
  model: string;
  vertical: string;
}

export const VEHICLE_MASTER: VehicleMasterEntry[] = [
  // Ford — Police
  { vehicleId: 'FORD_PIU',            year: '2026', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2025', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2024', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2023', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2022', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2021', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_PIU',            year: '2020', make: 'Ford', model: 'Explorer PIU',        vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2026', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2025', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2024', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2023', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2022', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2021', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_EXPEDITION_SSV', year: '2018', make: 'Ford', model: 'Expedition SSV',      vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2026', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2025', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2024', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2023', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2022', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  { vehicleId: 'FORD_F150_RESPONDER', year: '2021', make: 'Ford', model: 'F-150 Responder',     vertical: 'Police' },
  // Ford — Work Truck
  { vehicleId: 'FORD_SUPERDUTY',      year: '2026', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2025', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2024', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2023', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2022', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  { vehicleId: 'FORD_SUPERDUTY',      year: '2021', make: 'Ford', model: 'SuperDuty F-250/350', vertical: 'Work Truck' },
  // Chevrolet — Police
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2026', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2025', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2024', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2023', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2022', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_TAHOE_PPV',     year: '2021', make: 'Chevrolet', model: 'Tahoe PPV / SSV',       vertical: 'Police' },
  { vehicleId: 'CHEVY_SILVERADO_PPV', year: '2026', make: 'Chevrolet', model: 'Silverado PPV / SSV',   vertical: 'Police' },
  { vehicleId: 'CHEVY_SILVERADO_PPV', year: '2025', make: 'Chevrolet', model: 'Silverado PPV / SSV',   vertical: 'Police' },
  { vehicleId: 'CHEVY_SILVERADO_PPV', year: '2024', make: 'Chevrolet', model: 'Silverado PPV / SSV',   vertical: 'Police' },
  { vehicleId: 'CHEVY_BLAZER_EV_PPV', year: '2026', make: 'Chevrolet', model: 'Blazer EV PPV',         vertical: 'Police' },
  { vehicleId: 'CHEVY_BLAZER_EV_PPV', year: '2025', make: 'Chevrolet', model: 'Blazer EV PPV',         vertical: 'Police' },
  // Chevrolet — Work Truck
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2026', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2025', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2024', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  { vehicleId: 'CHEVY_SILVERADO_HD',  year: '2023', make: 'Chevrolet', model: 'Silverado HD 2500/3500',vertical: 'Work Truck' },
  // Dodge — Police
  { vehicleId: 'DODGE_CHARGER',       year: '2023', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_CHARGER',       year: '2022', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_CHARGER',       year: '2021', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_CHARGER',       year: '2020', make: 'Dodge', model: 'Charger Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2026', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2025', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2024', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  { vehicleId: 'DODGE_DURANGO',       year: '2023', make: 'Dodge', model: 'Durango Pursuit',    vertical: 'Police' },
  // Ram — Police / Work Truck
  { vehicleId: 'RAM_1500_SSV',        year: '2026', make: 'Ram', model: '1500 SSV',             vertical: 'Police' },
  { vehicleId: 'RAM_1500_SSV',        year: '2025', make: 'Ram', model: '1500 SSV',             vertical: 'Police' },
  { vehicleId: 'RAM_1500_SSV',        year: '2024', make: 'Ram', model: '1500 SSV',             vertical: 'Police' },
  { vehicleId: 'RAM_2500',            year: '2026', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_2500',            year: '2025', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_2500',            year: '2024', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_2500',            year: '2023', make: 'Ram', model: '2500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2026', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2025', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2024', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
  { vehicleId: 'RAM_3500',            year: '2023', make: 'Ram', model: '3500',                 vertical: 'Work Truck' },
];

/** Maps a VEHICLE_MASTER display vertical to the catalog's vertical id (src/data/verticals/*.json). */
const VERTICAL_LABEL_TO_CATALOG_ID: Record<string, string> = {
  'Police': 'police',
  'Fire/EMS': 'fire',
  'Work Truck': 'work-truck',
};

export function resolveCatalogVerticalId(verticalLabel: string | null | undefined): string | null {
  if (!verticalLabel) return null;
  return VERTICAL_LABEL_TO_CATALOG_ID[verticalLabel]
    ?? verticalLabel.toLowerCase().replace(/[\s/]+/g, '-');
}

export function listVehicleYears(): string[] {
  return [...new Set(VEHICLE_MASTER.map((v) => v.year))].sort((a, b) => Number(b) - Number(a));
}

export function listVehicleMakes(year?: string | null): string[] {
  const source = year ? VEHICLE_MASTER.filter((v) => v.year === year) : VEHICLE_MASTER;
  return [...new Set(source.map((v) => v.make))].sort();
}

export function listVehicleModels(year?: string | null, make?: string | null): string[] {
  if (!year || !make) return [];
  return [...new Set(VEHICLE_MASTER.filter((v) => v.year === year && v.make === make).map((v) => v.model))].sort();
}

/** Resolves the full master record (vehicleId + vertical) for an exact year/make/model triple. */
export function findVehicleMasterEntry(
  year?: string | null,
  make?: string | null,
  model?: string | null,
): VehicleMasterEntry | null {
  if (!year || !make || !model) return null;
  return VEHICLE_MASTER.find((v) => v.year === year && v.make === make && v.model === model) ?? null;
}

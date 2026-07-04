/**
 * Fleet Vehicle Shopping Modes — client-side, localStorage-only domain
 * contracts. A "fleet build" is a customer's in-progress upfit plan for one
 * vehicle spec (vehicle + quantity + build style + the products chosen per
 * upfit category). No backend, authentication, or Shopify data is involved.
 */

export type UpfitCategoryId =
  | 'roof_lighting'
  | 'interior_lighting'
  | 'perimeter_lighting'
  | 'siren'
  | 'speaker'
  | 'push_bumper'
  | 'console'
  | 'partition'
  | 'rear_warning'
  | 'scene_lighting'
  | 'graphics_markings'
  | 'accessories';

export interface UpfitCategoryDefinition {
  id: UpfitCategoryId;
  label: string;
}

export type FleetBuildStyleId =
  | 'patrol'
  | 'slicktop'
  | 'supervisor'
  | 'traffic_enforcement'
  | 'pursuit'
  | 'fire_command'
  | 'work_truck';

export interface FleetBuildStyleDefinition {
  id: FleetBuildStyleId;
  label: string;
  guidance: string;
  /** Guidance only, not a hard dependency gate — see docs/architecture/FLEET_VEHICLE_SHOPPING_MODES.md. */
  priorityCategories: UpfitCategoryId[];
}

/**
 * Lightweight per-build vehicle selection — intentionally distinct from the
 * global VehicleContext selection (each fleet build has its own vehicle) and
 * from the strict Vehicle fitment type (src/types/vehicle.ts), mirroring how
 * VehicleContext already stores a lightweight shape rather than the strict
 * fitment contract (see FitmentSummary's toFitmentVehicle).
 */
export interface FleetBuildVehicle {
  vehicleId?: string;
  year: string;
  make: string;
  model: string;
  /** Display vertical label from the vehicle master, e.g. "Police" | "Work Truck". */
  vertical?: string | null;
}

export interface FleetBuildProductSelection {
  productId: string;
  label: string;
  addedAt: number;
}

export type FleetBuildCategorySelections = Partial<Record<UpfitCategoryId, FleetBuildProductSelection[]>>;

export interface FleetBuild {
  id: string;
  name: string;
  vehicle: FleetBuildVehicle | null;
  quantity: number;
  buildStyle: FleetBuildStyleId | null;
  selections: FleetBuildCategorySelections;
  createdAt: number;
}

export type FleetBuildCompletionColor = 'red' | 'yellow' | 'green';

export interface FleetBuildCompletion {
  percent: number;
  color: FleetBuildCompletionColor;
  /** The category set completion was measured against (style priority list, or all 12 with no style chosen). */
  referenceCategories: UpfitCategoryId[];
  missingCategories: UpfitCategoryId[];
  selectedCategories: UpfitCategoryId[];
  suggestedNextCategories: UpfitCategoryId[];
}

export type AddToAllSkipReason = 'category_undetermined' | 'no_vehicle_selected' | 'vertical_mismatch';

export interface AddToAllCompatibleBuildsEntry {
  buildId: string;
  buildName: string;
  reason?: AddToAllSkipReason;
  message?: string;
}

export interface AddToAllCompatibleBuildsResult {
  category: UpfitCategoryId | null;
  totalBuilds: number;
  added: AddToAllCompatibleBuildsEntry[];
  skipped: AddToAllCompatibleBuildsEntry[];
}

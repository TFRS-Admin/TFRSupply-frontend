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
  /**
   * Set by a clone or "Apply Template" compatibility re-evaluation against a
   * (possibly new) destination vehicle. Never causes removal — see
   * docs/architecture/FLEET_TEMPLATES_AND_CLONING.md. Absent on selections
   * that have never gone through that re-evaluation.
   */
  incompatible?: boolean;
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
  /** The saved template (if any) last applied to or cloned into this build — informational lineage only, not a hard link. */
  templateId?: string | null;
  /**
   * The Fleet Project this build belongs to (see src/types/fleetProjects.ts).
   * Optional so the domain constructors here stay unaware of Fleet Projects
   * — FleetBuildsContext stamps it on at creation time and normalizes any
   * build loaded without one onto DEFAULT_PROJECT_ID (pre-Fleet-Projects data).
   */
  projectId?: string;
}

/**
 * Fleet Templates & Vehicle Cloning — a reusable snapshot of a complete fleet
 * build (vehicle, build style, category selections, and a completion % taken
 * at save time) that can later be applied to another build or cloned into a
 * brand-new one. Client-side, localStorage-only, mirroring FleetBuild.
 */
export interface FleetBuildTemplate {
  id: string;
  name: string;
  vehicle: FleetBuildVehicle | null;
  buildStyle: FleetBuildStyleId | null;
  selections: FleetBuildCategorySelections;
  /** Completion percent snapshotted from the source build at save time (see calculateFleetBuildCompletion). */
  completionPercent: number;
  /** The build this template was saved from — informational only; the build may since have been edited, renamed, or removed. */
  sourceBuildId: string | null;
  createdAt: number;
  updatedAt: number;
  /** Incremented each time this template is applied to a build or cloned into a new one. */
  usageCount: number;
  lastUsedAt: number | null;
  /** The Fleet Project this template belongs to — see FleetBuild.projectId above. */
  projectId?: string;
}

/**
 * The minimal shape a clone source (an existing FleetBuild or a saved
 * FleetBuildTemplate) must provide — just what cloneFleetBuildFromSource
 * actually copies. Destination name/vehicle/quantity always come from
 * FleetBuildCloneDestination, never from the source.
 */
export interface FleetBuildCloneableSource {
  buildStyle: FleetBuildStyleId | null;
  selections: FleetBuildCategorySelections;
  templateId?: string | null;
}

export interface FleetBuildCloneDestination {
  name: string;
  vehicle: FleetBuildVehicle | null;
  quantity: number;
}

/** One product flagged incompatible during a clone or template-apply compatibility re-evaluation. */
export interface FleetBuildCompatibilityFlag {
  categoryId: UpfitCategoryId;
  productId: string;
  label: string;
}

/** Shared result shape for both "Clone Build" and "Apply Template" — the mutated/created build plus anything flagged incompatible along the way. */
export interface FleetBuildCloneResult {
  build: FleetBuild;
  flaggedIncompatible: FleetBuildCompatibilityFlag[];
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

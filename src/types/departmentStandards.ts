/**
 * Fleet Intelligence & Department Standards — client-side, localStorage-only
 * domain contracts. A "department standard" describes which upfit categories
 * (src/types/fleetBuilds.ts UpfitCategoryId) a department/vertical typically
 * requires, recommends, or treats as optional for a vehicle build (e.g.
 * "Patrol" requires a roof lightbar, siren, speaker, console, push bumper,
 * and rear warning). No backend, authentication, or Shopify data is involved.
 *
 * Standards come in two flavors that share one shape:
 *  - Shipped defaults (`isCustom: false`) — the 12 built-in standards in
 *    src/domain/departmentStandards/defaultStandards.ts. Read-only; `id`
 *    equals `key`.
 *  - Company standards (`isCustom: true`) — created by cloning a default or
 *    another company standard, then renamed/customized. Persisted by
 *    DepartmentStandardsContext, mirroring FleetBuildTemplate.
 */
import type { UpfitCategoryId } from './fleetBuilds';

export type DepartmentStandardKey =
  | 'patrol'
  | 'slicktop'
  | 'supervisor'
  | 'traffic_enforcement'
  | 'pursuit'
  | 'k9'
  | 'swat'
  | 'fire_command'
  | 'ems_supervisor'
  | 'dot_truck'
  | 'utility'
  | 'construction';

export type DepartmentStandardTier = 'required' | 'recommended' | 'optional';

export type DepartmentStandardCategories = Record<DepartmentStandardTier, UpfitCategoryId[]>;

export interface DepartmentStandard {
  /** Shipped defaults use their key as id (e.g. 'patrol'); company standards get a generated id. */
  id: string;
  /** The base standard this represents/derives from. Null only for a company standard built from scratch. */
  key: DepartmentStandardKey | null;
  name: string;
  description: string;
  categories: DepartmentStandardCategories;
  /** false = shipped default (read-only); true = user-created/cloned company standard. */
  isCustom: boolean;
  /** The standard (default or company) this was cloned from — informational lineage only. Null for shipped defaults. */
  basedOnId: string | null;
  createdAt: number;
  updatedAt: number;
}

/** One category's tier match for a single product, used by Product Intelligence. */
export interface ProductStandardMatch {
  standard: DepartmentStandard;
  tier: DepartmentStandardTier;
}

/**
 * Per-build scoring against one department standard — the Fleet Completion
 * Engine's output. Null (no report) when a build has no standard assigned;
 * callers fall back to calculateFleetBuildCompletion's build-style scoring.
 */
export interface FleetBuildIntelligence {
  buildId: string;
  standardId: string;
  standardName: string;
  completionPercent: number;
  requiredTotal: number;
  requiredInstalled: number;
  missingRequired: UpfitCategoryId[];
  recommendedTotal: number;
  recommendedInstalled: number;
  missingRecommended: UpfitCategoryId[];
  optionalTotal: number;
  optionalInstalled: number;
  missingOptional: UpfitCategoryId[];
  /** True when every required category has at least one product (or the standard has no required categories). */
  departmentCompliant: boolean;
  /** Missing required categories — the categories blocking department compliance. Same list as missingRequired. */
  criticalBlockers: UpfitCategoryId[];
}

export type FleetHealthColor = 'red' | 'yellow' | 'green';

/** One required category missing across one or more builds, aggregated for a "N Vehicles Missing X" warning. */
export interface FleetHealthCriticalGap {
  categoryId: UpfitCategoryId;
  label: string;
  vehicleCount: number;
}

/**
 * Aggregate fleet readiness across a set of builds — used for both the
 * per-project Fleet Health card (Feature 6) and the Workspace Fleet
 * Intelligence section (Feature 3), just at different build-list scopes.
 */
export interface FleetHealthSummary {
  buildCount: number;
  vehicleCount: number;
  overallCompletionPercent: number;
  color: FleetHealthColor;
  vehiclesReady: number;
  vehiclesInProgress: number;
  vehiclesMissingEquipment: number;
  vehiclesNeedReview: number;
  departmentCompliancePercent: number;
  criticalGaps: FleetHealthCriticalGap[];
}

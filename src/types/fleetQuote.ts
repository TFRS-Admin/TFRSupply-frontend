/**
 * Fleet Quote Builder — client-side, localStorage-free domain contracts. A
 * "project quote" is not a new quote system: it is a read-only aggregation of
 * an existing Fleet Project's existing Fleet Builds (vehicle, quantity, build
 * style, department standard, selected products per upfit category) into a
 * customer-facing quote package. No backend, authentication, Shopify data,
 * pricing, or persistence is involved — every value here is recomputed from
 * FleetBuildsContext/FleetProjectContext/DepartmentStandardsContext state on
 * every render, mirroring src/domain/departmentStandards/fleetHealth.ts and
 * src/domain/recommendations/workspaceSummary.ts.
 */
import type { FleetBuild, FleetBuildVehicle, UpfitCategoryId } from './fleetBuilds';
import type { DepartmentStandard, DepartmentStandardTier } from './departmentStandards';
import type { GuidedUpfitChecklist } from './upfitBuilder';
import type { ProductRecommendation } from './recommendations';
import type { Product } from './product';

/** A ranked recommendation paired with its resolved catalog Product — mirrors src/domain/recommendations/resolveRecommendationProducts.ts's RecommendationWithProduct shape. */
export interface QuoteRecommendedAddition {
  recommendation: ProductRecommendation;
  product: Product;
}

/**
 * One Fleet Build already paired with its effective Department Standard and
 * its Guided Upfit Builder checklist (src/domain/upfitBuilder/guidedChecklist.ts)
 * — the checklist is the single source of per-category tier/status/missing
 * data every aggregation function below reads, so it is computed once per
 * build by the caller rather than re-derived in each function.
 */
export interface FleetQuoteBuildEntry {
  build: FleetBuild;
  standard: DepartmentStandard | null;
  checklist: GuidedUpfitChecklist;
}

export type QuoteReadinessLevel = 'ready' | 'minor_issues' | 'incomplete' | 'blocked';

export interface QuoteReadiness {
  level: QuoteReadinessLevel;
  label: string;
  reasons: string[];
}

export interface ProjectQuoteSummary {
  projectId: string;
  projectName: string;
  /** The project's (or its builds') effective Department Standard name, "Mixed" when builds differ, or "Not Assigned". */
  departmentLabel: string;
  buildCount: number;
  vehicleCount: number;
  /** Vehicle-count-weighted average completion percent across every build (see src/domain/departmentStandards/fleetHealth.ts). */
  completionPercent: number;
  fleetHealthColor: 'red' | 'yellow' | 'green';
  quoteStatus: QuoteReadiness;
  /** Latest of the project's own updatedAt and its builds'/templates' timestamps, or null — see summarizeFleetProject. */
  lastUpdated: number | null;
}

export interface QuoteProductEntry {
  productId: string;
  label: string;
  categoryId: UpfitCategoryId;
  categoryLabel: string;
}

export interface VehicleQuoteMissingProduct {
  categoryId: UpfitCategoryId;
  categoryLabel: string;
  tier: DepartmentStandardTier;
}

export type VehicleQuoteRecommendationStatus = 'fully_equipped' | 'has_recommendations' | 'no_recommendations';

/** One Fleet Build's card on the Vehicle Summary — a per-vehicle-spec slice of the project quote. */
export interface VehicleQuoteSummary {
  buildId: string;
  buildName: string;
  vehicle: FleetBuildVehicle | null;
  vehicleLabel: string;
  buildStyleLabel: string;
  departmentStandardName: string | null;
  quantity: number;
  completionPercent: number;
  departmentCompliant: boolean | null;
  /** Total physical equipment pieces this vehicle spec requires — distinct selected products × quantity, mirroring FleetProjectSummary.estimatedProductCount's formula. */
  estimatedEquipmentCount: number;
  missingRequiredCategories: string[];
  missingRecommendedCategories: string[];
  installedProducts: QuoteProductEntry[];
  missingProducts: VehicleQuoteMissingProduct[];
  recommendedAdditions: QuoteRecommendedAddition[];
  recommendationStatus: VehicleQuoteRecommendationStatus;
}

/** One vehicle-group section of the "Quote Items" view — one per Fleet Build, mirroring the "Explorer Patrol x18" example. */
export interface VehicleQuoteSection {
  buildId: string;
  buildName: string;
  vehicleLabel: string;
  quantity: number;
  categories: Array<{
    categoryId: UpfitCategoryId;
    categoryLabel: string;
    products: QuoteProductEntry[];
  }>;
}

/**
 * One product grouped across every Fleet Build in the project that selected
 * it — "group identical equipment together." `quantity` is the total physical
 * units required (sum of build.quantity across every contributing build);
 * `vehicleCount` is how many distinct vehicle specs (Fleet Builds) use it.
 * The two only diverge when the same product is selected in more than one
 * Fleet Build.
 */
export interface QuoteItemGroup {
  productId: string;
  label: string;
  categoryId: UpfitCategoryId;
  categoryLabel: string;
  quantity: number;
  vehicleCount: number;
  buildIds: string[];
}

export interface ProjectQuoteTotals {
  totalVehicles: number;
  totalLineItems: number;
  totalEquipmentPieces: number;
  completionPercent: number;
  requiredEquipmentRemaining: number;
  recommendedEquipmentRemaining: number;
}

export interface MissingEquipmentEntry {
  buildId: string;
  buildName: string;
  vehicleLabel: string;
  categoryId: UpfitCategoryId;
  categoryLabel: string;
  tier: DepartmentStandardTier;
  standardName: string | null;
}

export interface MissingEquipmentReport {
  critical: MissingEquipmentEntry[];
  recommended: MissingEquipmentEntry[];
  optional: MissingEquipmentEntry[];
  byVehicle: Record<string, MissingEquipmentEntry[]>;
  byDepartmentStandard: Record<string, MissingEquipmentEntry[]>;
  byCategory: Record<string, MissingEquipmentEntry[]>;
}

export interface ProjectQuoteExportPreview {
  departmentLabel: string;
  projectName: string;
  vehicleSummaries: VehicleQuoteSummary[];
  equipmentSummary: QuoteItemGroup[];
  missingEquipment: MissingEquipmentReport;
  recommendations: QuoteRecommendedAddition[];
  quoteNotes: string;
  generatedAt: number;
}

/** Product Detail integration — is this product already part of the active Fleet Project's quote? */
export interface ProductQuoteInclusion {
  included: boolean;
  buildId: string | null;
  buildName: string | null;
  categoryId: UpfitCategoryId | null;
}

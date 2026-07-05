/**
 * Fleet Procurement Packages — client-side, localStorage-free domain
 * contracts. A "procurement package" is not a new ordering or cart system: it
 * groups an existing Fleet Project's existing Fleet Builds (already paired
 * with their effective Department Standard and Guided Upfit Builder checklist
 * — see FleetQuoteBuildEntry in src/types/fleetQuote.ts) by shared Department
 * Standard into named, procurement-ready groupings ("Patrol," "SWAT," "K9,"
 * "Unassigned Vehicles," …). Every value here is recomputed from
 * FleetBuildsContext/FleetProjectContext/DepartmentStandardsContext state on
 * every render, mirroring src/types/fleetQuote.ts — no backend,
 * authentication, Shopify data, pricing, checkout, or persistence is
 * involved.
 */
import type { UpfitCategoryId } from './fleetBuilds';
import type { DepartmentStandardTier } from './departmentStandards';
import type {
  FleetQuoteBuildEntry,
  MissingEquipmentReport,
  QuoteItemGroup,
  QuoteRecommendedAddition,
  VehicleQuoteSummary,
} from './fleetQuote';

export type PackageReadinessLevel = 'ready' | 'minor_issues' | 'needs_review' | 'blocked';

export interface PackageReadiness {
  level: PackageReadinessLevel;
  label: string;
  reasons: string[];
}

/** Two or more Fleet Builds in the same package sharing the same vehicle (year/make/model) and build style — likely an accidental duplicate entry, flagged for human review rather than silently merged or removed. */
export interface DuplicateConfigurationGroup {
  signature: string;
  vehicleLabel: string;
  buildIds: string[];
  buildNames: string[];
}

/**
 * One department-standard-scoped grouping of Fleet Builds — the unit the
 * whole feature revolves around. `id` is the effective Department Standard's
 * id, or the literal string `'unassigned'` for builds with no standard
 * resolved (own assignment or inherited from the project).
 */
export interface ProcurementPackage {
  id: string;
  name: string;
  departmentLabel: string;
  buildIds: string[];
  /** Total vehicles across every build in this package (sum of build.quantity), mirroring FleetHealthSummary.vehicleCount. */
  vehicleCount: number;
  /** Distinct equipment line items across this package (see src/domain/fleetQuote/quoteItemGrouping.ts's groupQuoteItems), mirroring ProjectQuoteTotals.totalLineItems. */
  equipmentCount: number;
  /** Vehicle-count-weighted average completion percent across this package's builds (see summarizeFleetHealth). */
  completionPercent: number;
  readiness: PackageReadiness;
  missingEquipment: MissingEquipmentReport;
  recommendedAdditions: QuoteRecommendedAddition[];
  duplicateConfigurations: DuplicateConfigurationGroup[];
}

/** One distinct vehicle spec (Fleet Build) within a package's expanded contents. */
export interface PackageVehicleTypeEntry {
  buildId: string;
  buildName: string;
  vehicleLabel: string;
  buildStyleLabel: string;
  quantity: number;
}

export type PackageCategoryStatus = 'complete' | 'partial' | 'missing';

/** One upfit category's install status aggregated across every build in a package. */
export interface PackageCategoryEntry {
  categoryId: UpfitCategoryId;
  categoryLabel: string;
  tier: DepartmentStandardTier;
  status: PackageCategoryStatus;
  /** Fleet Build ids within this package that already have this category filled. */
  equippedBuildIds: string[];
}

/** A package's expanded "Package Contents" — Vehicle Types, Products/Grouped Quantities, and tiered Equipment. */
export interface PackageContents {
  vehicleTypes: PackageVehicleTypeEntry[];
  products: QuoteItemGroup[];
  requiredEquipment: PackageCategoryEntry[];
  recommendedEquipment: PackageCategoryEntry[];
  optionalEquipment: PackageCategoryEntry[];
}

/** Workspace card / /procurement header rollup — see src/domain/procurementPackages/summarizeProcurementPackages.ts. */
export interface ProcurementPackagesSummary {
  packageCount: number;
  readyCount: number;
  minorIssuesCount: number;
  needsReviewCount: number;
  blockedCount: number;
}

/** Read-only "Export Preview" for one package — mirrors ProjectQuoteExportPreview's shape/fields, renamed to this feature's vocabulary. Preview only: no PDF, no backend. */
export interface ProcurementExportPreview {
  departmentLabel: string;
  packageName: string;
  vehicleSummaries: VehicleQuoteSummary[];
  equipment: QuoteItemGroup[];
  missingEquipment: MissingEquipmentReport;
  recommendations: QuoteRecommendedAddition[];
  procurementNotes: string;
  generatedAt: number;
}

/** Product Detail integration — is this product already part of one of the active Fleet Project's procurement packages? */
export interface ProductPackageInclusion {
  included: boolean;
  buildId: string | null;
  buildName: string | null;
  categoryId: UpfitCategoryId | null;
  packageId: string | null;
  packageName: string | null;
}

/**
 * Grouping shape produced by groupFleetQuoteEntriesIntoPackages, before
 * summary/contents aggregation — one Department Standard's worth of already-
 * resolved FleetQuoteBuildEntry (build + standard + checklist). `id` is the
 * effective standard's id or the literal `'unassigned'`.
 */
export interface ProcurementPackageGroup {
  id: string;
  name: string;
  entries: FleetQuoteBuildEntry[];
}

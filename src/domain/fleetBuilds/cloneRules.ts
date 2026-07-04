import type {
  FleetBuild,
  FleetBuildCategorySelections,
  FleetBuildCloneableSource,
  FleetBuildCloneDestination,
  FleetBuildCloneResult,
  FleetBuildCompatibilityFlag,
  FleetBuildTemplate,
  FleetBuildVehicle,
  UpfitCategoryId,
} from '@/types/fleetBuilds';
import { resolveCatalogVerticalId } from '@/data/vehicles/vehicleMaster';

/**
 * Deep-enough copy of a build's category selections (top-level object plus
 * each product-selection item) so a template snapshot or clone never shares
 * references with its source — pulled out so templateRules.ts can reuse it
 * for template snapshots without duplicating the shape logic.
 */
export function cloneCategorySelections(selections: FleetBuildCategorySelections): FleetBuildCategorySelections {
  const cloned: FleetBuildCategorySelections = {};
  (Object.keys(selections) as UpfitCategoryId[]).forEach((categoryId) => {
    const items = selections[categoryId];
    if (items) cloned[categoryId] = items.map((item) => ({ ...item }));
  });
  return cloned;
}

/**
 * Re-evaluates every product selection against a (possibly new) destination
 * vehicle using the same vertical-match rule as addProductToAllCompatibleBuilds
 * — never removes a product, only flags it. `getProductVerticalIds` is
 * supplied by the caller (the context/component layer, which may read the
 * catalog service) so this stays a pure, deterministic function with no I/O.
 */
export function reevaluateSelectionsCompatibility(
  selections: FleetBuildCategorySelections,
  destinationVehicle: FleetBuildVehicle | null | undefined,
  getProductVerticalIds: (productId: string) => string[] | null | undefined,
): { selections: FleetBuildCategorySelections; flagged: FleetBuildCompatibilityFlag[] } {
  const destinationVerticalId = destinationVehicle ? resolveCatalogVerticalId(destinationVehicle.vertical) : null;
  const flagged: FleetBuildCompatibilityFlag[] = [];
  const next: FleetBuildCategorySelections = {};

  (Object.keys(selections) as UpfitCategoryId[]).forEach((categoryId) => {
    const items = selections[categoryId] ?? [];
    next[categoryId] = items.map((item) => {
      const productVerticalIds = getProductVerticalIds(item.productId) ?? [];
      const incompatible = Boolean(
        destinationVerticalId && productVerticalIds.length > 0 && !productVerticalIds.includes(destinationVerticalId),
      );
      if (incompatible) flagged.push({ categoryId, productId: item.productId, label: item.label });
      return { ...item, incompatible };
    });
  });

  return { selections: next, flagged };
}

/** Adapts an existing fleet build into the shape cloneFleetBuildFromSource expects. */
export function cloneSourceFromBuild(build: FleetBuild): FleetBuildCloneableSource {
  return {
    buildStyle: build.buildStyle,
    selections: build.selections,
    templateId: build.templateId ?? null,
  };
}

/** Adapts a saved template into the shape cloneFleetBuildFromSource expects. */
export function cloneSourceFromTemplate(template: FleetBuildTemplate): FleetBuildCloneableSource {
  return {
    buildStyle: template.buildStyle,
    selections: template.selections,
    templateId: template.id,
  };
}

/**
 * Clones an existing build or saved template into a brand-new fleet build at
 * a destination vehicle/name/quantity. Selected products, category
 * selections, and build style are copied; completion state carries over for
 * free since it is always derived from buildStyle + selections
 * (see completion.ts). Compatibility is re-evaluated against the destination
 * vehicle — incompatible items are flagged, never dropped.
 */
export function cloneFleetBuildFromSource(
  id: string,
  createdAt: number,
  source: FleetBuildCloneableSource,
  destination: FleetBuildCloneDestination,
  getProductVerticalIds: (productId: string) => string[] | null | undefined,
): FleetBuildCloneResult {
  const { selections, flagged } = reevaluateSelectionsCompatibility(
    cloneCategorySelections(source.selections),
    destination.vehicle,
    getProductVerticalIds,
  );

  return {
    build: {
      id,
      name: destination.name,
      vehicle: destination.vehicle,
      quantity: destination.quantity,
      buildStyle: source.buildStyle,
      selections,
      createdAt,
      templateId: source.templateId ?? null,
    },
    flaggedIncompatible: flagged,
  };
}

/**
 * Applies a saved template's build style and selections onto an existing
 * build in place (same id/name/quantity). The build keeps its own vehicle if
 * it already has one — the template's vehicle is only adopted when the build
 * has none yet — and compatibility is re-evaluated against whichever vehicle
 * results, flagging (never dropping) incompatible items.
 */
export function applyTemplateToBuild(
  build: FleetBuild,
  template: FleetBuildTemplate,
  getProductVerticalIds: (productId: string) => string[] | null | undefined,
): FleetBuildCloneResult {
  const destinationVehicle = build.vehicle ?? template.vehicle;
  const { selections, flagged } = reevaluateSelectionsCompatibility(
    cloneCategorySelections(template.selections),
    destinationVehicle,
    getProductVerticalIds,
  );

  return {
    build: {
      ...build,
      vehicle: destinationVehicle,
      buildStyle: template.buildStyle,
      selections,
      templateId: template.id,
    },
    flaggedIncompatible: flagged,
  };
}

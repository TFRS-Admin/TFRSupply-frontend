import type {
  FleetBuild,
  FleetBuildProductSelection,
  FleetBuildStyleId,
  FleetBuildVehicle,
  UpfitCategoryId,
} from '@/types/fleetBuilds';

/** Keeps the workspace a "small fleet build workspace," not an unbounded list. */
export const MAX_FLEET_BUILDS = 25;

function nextDefaultBuildName(current: FleetBuild[]): string {
  return `Fleet Build ${current.length + 1}`;
}

/**
 * Pure fleet-build CRUD rules, pulled out of FleetBuildsContext so add/
 * remove/rename/update behavior can be unit tested without a localStorage-
 * backed context, mirroring compareSelection.ts/savedProducts.ts. `id` and
 * `createdAt` are supplied by the caller (context) so this stays
 * deterministic and side-effect-free.
 */
export function createFleetBuild(id: string, createdAt: number, current: FleetBuild[]): FleetBuild {
  return {
    id,
    name: nextDefaultBuildName(current),
    vehicle: null,
    quantity: 1,
    buildStyle: null,
    selections: {},
    createdAt,
  };
}

export function addFleetBuild(current: FleetBuild[], build: FleetBuild): FleetBuild[] {
  if (current.length >= MAX_FLEET_BUILDS) return current;
  return [...current, build];
}

export function removeFleetBuild(current: FleetBuild[], buildId: string): FleetBuild[] {
  return current.filter((build) => build.id !== buildId);
}

/** Resolves the next active build id after `removedBuildId` was removed, given the post-removal array. */
export function resolveNextActiveBuildId(
  buildsAfterRemoval: FleetBuild[],
  removedBuildId: string,
  previousActiveId: string | null,
): string | null {
  if (previousActiveId !== removedBuildId) return previousActiveId;
  return buildsAfterRemoval.length ? buildsAfterRemoval[buildsAfterRemoval.length - 1].id : null;
}

export function renameFleetBuild(current: FleetBuild[], buildId: string, name: string): FleetBuild[] {
  const trimmed = name.trim();
  if (!trimmed) return current;
  return current.map((build) => (build.id === buildId ? { ...build, name: trimmed } : build));
}

export function updateFleetBuildVehicle(
  current: FleetBuild[],
  buildId: string,
  vehicle: FleetBuildVehicle | null,
): FleetBuild[] {
  return current.map((build) => (build.id === buildId ? { ...build, vehicle } : build));
}

export function updateFleetBuildQuantity(current: FleetBuild[], buildId: string, quantity: number): FleetBuild[] {
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  return current.map((build) => (build.id === buildId ? { ...build, quantity: safeQuantity } : build));
}

export function updateFleetBuildStyle(
  current: FleetBuild[],
  buildId: string,
  buildStyle: FleetBuildStyleId | null,
): FleetBuild[] {
  return current.map((build) => (build.id === buildId ? { ...build, buildStyle } : build));
}

export function isProductInBuildCategory(build: FleetBuild, categoryId: UpfitCategoryId, productId: string): boolean {
  return (build.selections[categoryId] ?? []).some((item) => item.productId === productId);
}

export function addProductToBuildCategory(
  current: FleetBuild[],
  buildId: string,
  categoryId: UpfitCategoryId,
  selection: FleetBuildProductSelection,
): FleetBuild[] {
  return current.map((build) => {
    if (build.id !== buildId) return build;
    const existing = build.selections[categoryId] ?? [];
    if (existing.some((item) => item.productId === selection.productId)) return build;
    return { ...build, selections: { ...build.selections, [categoryId]: [...existing, selection] } };
  });
}

export function removeProductFromBuildCategory(
  current: FleetBuild[],
  buildId: string,
  categoryId: UpfitCategoryId,
  productId: string,
): FleetBuild[] {
  return current.map((build) => {
    if (build.id !== buildId) return build;
    const existing = build.selections[categoryId] ?? [];
    return { ...build, selections: { ...build.selections, [categoryId]: existing.filter((item) => item.productId !== productId) } };
  });
}

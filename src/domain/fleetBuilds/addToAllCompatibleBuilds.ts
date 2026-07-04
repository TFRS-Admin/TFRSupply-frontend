import type { Product } from '@/types';
import type { AddToAllCompatibleBuildsResult, FleetBuild, FleetBuildProductSelection } from '@/types/fleetBuilds';
import { classifyProductUpfitCategory } from './upfitCategories';
import { addProductToBuildCategory } from './fleetBuildRules';
import { resolveCatalogVerticalId } from '@/data/vehicles/vehicleMaster';

function toSelection(product: Product, addedAt: number): FleetBuildProductSelection {
  return {
    productId: product.id,
    label: product.title ?? product.label ?? product.id,
    addedAt,
  };
}

/**
 * Adds a product to the matching upfit category for every fleet build whose
 * compatibility can be positively determined. Never adds blindly: a build is
 * skipped (left unchanged) whenever compatibility can't be confirmed —
 * the product's upfit category can't be classified, the build has no
 * vehicle selected yet, or the product's catalog verticals don't include the
 * build vehicle's vertical. Idempotent — a product already in a build's
 * matching category still counts as "added" (the desired state already
 * holds) rather than being duplicated.
 */
export function addProductToAllCompatibleBuilds(
  builds: FleetBuild[],
  product: Product,
  addedAt: number,
): { builds: FleetBuild[]; result: AddToAllCompatibleBuildsResult } {
  const category = classifyProductUpfitCategory(product);
  const totalBuilds = builds.length;

  if (!category) {
    return {
      builds,
      result: {
        category: null,
        totalBuilds,
        added: [],
        skipped: builds.map((build) => ({
          buildId: build.id,
          buildName: build.name,
          reason: 'category_undetermined',
          message: 'Could not determine an upfit category for this product.',
        })),
      },
    };
  }

  const added: AddToAllCompatibleBuildsResult['added'] = [];
  const skipped: AddToAllCompatibleBuildsResult['skipped'] = [];
  let nextBuilds = builds;

  for (const build of builds) {
    if (!build.vehicle) {
      skipped.push({
        buildId: build.id,
        buildName: build.name,
        reason: 'no_vehicle_selected',
        message: 'No vehicle selected for this build yet.',
      });
      continue;
    }

    const buildVerticalId = resolveCatalogVerticalId(build.vehicle.vertical);
    const productVerticalIds = product.verticalIds ?? [];
    if (buildVerticalId && productVerticalIds.length > 0 && !productVerticalIds.includes(buildVerticalId)) {
      skipped.push({
        buildId: build.id,
        buildName: build.name,
        reason: 'vertical_mismatch',
        message: `Not associated with this build's ${build.vehicle.vertical} vertical.`,
      });
      continue;
    }

    nextBuilds = addProductToBuildCategory(nextBuilds, build.id, category, toSelection(product, addedAt));
    added.push({ buildId: build.id, buildName: build.name });
  }

  return { builds: nextBuilds, result: { category, totalBuilds, added, skipped } };
}

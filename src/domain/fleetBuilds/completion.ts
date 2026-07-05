import type { FleetBuild, FleetBuildCompletion, UpfitCategoryId } from '@/types/fleetBuilds';
import { ALL_UPFIT_CATEGORY_IDS } from './upfitCategories';
import { getBuildStyleDefinition } from './buildStyles';

/** The style's priority categories, or the full 12-category list before a style is chosen. */
function getReferenceCategories(build: FleetBuild): UpfitCategoryId[] {
  const style = getBuildStyleDefinition(build.buildStyle);
  return style ? style.priorityCategories : ALL_UPFIT_CATEGORY_IDS;
}

/**
 * Every upfit category with at least one product selected, regardless of
 * build style. Exported so other scoring modules (e.g.
 * src/domain/departmentStandards/completionEngine.ts) can reuse the same
 * "has this category been filled" rule instead of re-deriving it.
 */
export function getFilledUpfitCategories(build: FleetBuild): UpfitCategoryId[] {
  return ALL_UPFIT_CATEGORY_IDS.filter((categoryId) => (build.selections[categoryId]?.length ?? 0) > 0);
}

/**
 * Computes a fleet build's completion percent/color/missing-categories from
 * its build style's priority categories. Deterministic and side-effect-free
 * so it can be unit tested against fixture builds without a context.
 *
 * Color: red = nothing from the reference set selected yet, yellow =
 * partially selected, green = every reference category has at least one
 * product.
 */
export function calculateFleetBuildCompletion(build: FleetBuild): FleetBuildCompletion {
  const referenceCategories = getReferenceCategories(build);
  const selectedCategories = getFilledUpfitCategories(build);
  const selectedSet = new Set(selectedCategories);

  const filledReferenceCount = referenceCategories.filter((categoryId) => selectedSet.has(categoryId)).length;
  const percent = referenceCategories.length === 0
    ? 0
    : Math.round((filledReferenceCount / referenceCategories.length) * 100);

  const missingCategories = referenceCategories.filter((categoryId) => !selectedSet.has(categoryId));

  const color: FleetBuildCompletion['color'] = percent >= 100 ? 'green' : percent > 0 ? 'yellow' : 'red';

  return {
    percent,
    color,
    referenceCategories,
    missingCategories,
    selectedCategories,
    suggestedNextCategories: missingCategories.slice(0, 3),
  };
}

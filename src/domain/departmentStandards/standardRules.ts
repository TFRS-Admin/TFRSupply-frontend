import type { DepartmentStandard, DepartmentStandardTier } from '@/types/departmentStandards';
import type { UpfitCategoryId } from '@/types/fleetBuilds';
import { getDefaultStandardById } from './defaultStandards';

/** Keeps the standards library a manageable size, mirroring MAX_FLEET_TEMPLATES. */
export const MAX_DEPARTMENT_STANDARDS = 50;

function cloneCategories(categories: DepartmentStandard['categories']): DepartmentStandard['categories'] {
  return {
    required: [...categories.required],
    recommended: [...categories.recommended],
    optional: [...categories.optional],
  };
}

/**
 * Looks up a standard by id across both shipped defaults and a company's
 * saved custom standards — the single place any consumer should resolve a
 * `departmentStandardId` field (on a FleetBuild or FleetProject) into the
 * full DepartmentStandard record.
 */
export function getDepartmentStandardById(
  id: string | null | undefined,
  customStandards: DepartmentStandard[],
): DepartmentStandard | null {
  if (!id) return null;
  return getDefaultStandardById(id) ?? customStandards.find((standard) => standard.id === id) ?? null;
}

export function listAllDepartmentStandards(customStandards: DepartmentStandard[]): DepartmentStandard[] {
  return [...customStandards];
}

/**
 * Creates a new, editable company standard from any existing standard
 * (default or another company standard) — a deep-enough independent copy of
 * `categories` so editing the clone never mutates its source. Mirrors
 * createTemplateFromBuild's clone-then-customize shape.
 */
export function cloneDepartmentStandard(
  id: string,
  createdAt: number,
  source: DepartmentStandard,
  name?: string,
): DepartmentStandard {
  const trimmed = name?.trim();
  return {
    id,
    key: source.key,
    name: trimmed || `${source.name} (Copy)`,
    description: source.description,
    categories: cloneCategories(source.categories),
    isCustom: true,
    basedOnId: source.id,
    createdAt,
    updatedAt: createdAt,
  };
}

export function addDepartmentStandard(current: DepartmentStandard[], standard: DepartmentStandard): DepartmentStandard[] {
  if (current.length >= MAX_DEPARTMENT_STANDARDS) return current;
  return [...current, standard];
}

export function removeDepartmentStandard(current: DepartmentStandard[], standardId: string): DepartmentStandard[] {
  return current.filter((standard) => standard.id !== standardId);
}

export function renameDepartmentStandard(
  current: DepartmentStandard[],
  standardId: string,
  name: string,
  updatedAt: number,
): DepartmentStandard[] {
  const trimmed = name.trim();
  if (!trimmed) return current;
  return current.map((standard) => (
    standard.id === standardId && standard.isCustom ? { ...standard, name: trimmed, updatedAt } : standard
  ));
}

function updateTier(
  current: DepartmentStandard[],
  standardId: string,
  tier: DepartmentStandardTier,
  updatedAt: number,
  updateCategories: (categoryIds: UpfitCategoryId[]) => UpfitCategoryId[],
): DepartmentStandard[] {
  return current.map((standard) => {
    if (standard.id !== standardId || !standard.isCustom) return standard;
    return {
      ...standard,
      categories: { ...standard.categories, [tier]: updateCategories(standard.categories[tier]) },
      updatedAt,
    };
  });
}

/** Adds an upfit category to one tier of a company standard, deduping. Read-only defaults are left unchanged. */
export function addCategoryToTier(
  current: DepartmentStandard[],
  standardId: string,
  tier: DepartmentStandardTier,
  categoryId: UpfitCategoryId,
  updatedAt: number,
): DepartmentStandard[] {
  return updateTier(current, standardId, tier, updatedAt, (categoryIds) => (
    categoryIds.includes(categoryId) ? categoryIds : [...categoryIds, categoryId]
  ));
}

/** Removes an upfit category from one tier of a company standard. Read-only defaults are left unchanged. */
export function removeCategoryFromTier(
  current: DepartmentStandard[],
  standardId: string,
  tier: DepartmentStandardTier,
  categoryId: UpfitCategoryId,
  updatedAt: number,
): DepartmentStandard[] {
  return updateTier(current, standardId, tier, updatedAt, (categoryIds) => (
    categoryIds.filter((id) => id !== categoryId)
  ));
}

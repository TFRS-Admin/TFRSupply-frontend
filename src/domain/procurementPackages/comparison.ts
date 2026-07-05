import type { ProcurementPackage } from '@/types/procurementPackages';

/** Package Comparison's selection cap — a comparison table wider than this stops reading as "side-by-side." */
export const MAX_COMPARISON_PACKAGES = 4;

/**
 * Resolves the packages selected for side-by-side comparison, preserving
 * `packages`' own order and silently dropping any id no longer present (a
 * package's membership can shift as builds/standards change between
 * selection and render) — mirrors CompareContext/CompareTray's tolerant
 * id-resolution convention rather than introducing a new one.
 */
export function selectPackagesForComparison(packages: ProcurementPackage[], selectedIds: string[]): ProcurementPackage[] {
  return packages.filter((pkg) => selectedIds.includes(pkg.id));
}

import type { FleetBuild } from '@/types/fleetBuilds';
import type { FleetProject } from '@/types/fleetProjects';
import type { DepartmentStandard } from '@/types/departmentStandards';
import type { ProductPackageInclusion } from '@/types/procurementPackages';
import { resolveProductQuoteInclusion } from '@/domain/fleetQuote';
import { resolveEffectiveStandard } from '@/domain/departmentStandards';
import { UNASSIGNED_PACKAGE_ID, UNASSIGNED_PACKAGE_NAME } from './grouping';

/**
 * Product Detail integration — is this product already selected in one of
 * the active Fleet Project's Fleet Builds, and if so, which procurement
 * package (Department Standard grouping) does that build belong to? Reuses
 * resolveProductQuoteInclusion (src/domain/fleetQuote/productQuoteInclusion.ts)
 * for the underlying build/category lookup — no new selection state, no new
 * cart or quote data is introduced — then resolves that one build's
 * effective standard to name the package it belongs to.
 */
export function resolveProductPackageInclusion(
  builds: FleetBuild[],
  productId: string,
  project: FleetProject | null,
  companyStandards: DepartmentStandard[],
): ProductPackageInclusion {
  const quoteInclusion = resolveProductQuoteInclusion(builds, productId);
  if (!quoteInclusion.included) {
    return { included: false, buildId: null, buildName: null, categoryId: null, packageId: null, packageName: null };
  }

  const build = builds.find((candidate) => candidate.id === quoteInclusion.buildId) ?? null;
  const standard = build ? resolveEffectiveStandard(build, project, companyStandards) : null;

  return {
    ...quoteInclusion,
    packageId: standard?.id ?? UNASSIGNED_PACKAGE_ID,
    packageName: standard?.name ?? UNASSIGNED_PACKAGE_NAME,
  };
}

import type { FleetBuild } from '@/types/fleetBuilds';
import type { ProductQuoteInclusion } from '@/types/fleetQuote';
import { ALL_UPFIT_CATEGORY_IDS } from '@/domain/fleetBuilds';

/**
 * Product Detail integration — is this product already selected in one of
 * the active Fleet Project's Fleet Builds (i.e., already part of that
 * project's quote)? Reuses the existing FleetBuild.selections state; no new
 * cart or quote state is introduced. `builds` should be the caller's
 * project-scoped list (FleetBuildsContext's `builds`, not `allBuilds`).
 */
export function resolveProductQuoteInclusion(builds: FleetBuild[], productId: string): ProductQuoteInclusion {
  for (const build of builds) {
    for (const categoryId of ALL_UPFIT_CATEGORY_IDS) {
      if ((build.selections[categoryId] ?? []).some((selection) => selection.productId === productId)) {
        return { included: true, buildId: build.id, buildName: build.name, categoryId };
      }
    }
  }
  return { included: false, buildId: null, buildName: null, categoryId: null };
}

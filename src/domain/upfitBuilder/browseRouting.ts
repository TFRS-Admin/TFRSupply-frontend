import type { UpfitCategoryId } from '@/types/fleetBuilds';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds/upfitCategories';

export interface UpfitBrowseContext {
  fleetProjectId?: string | null;
  fleetBuildId?: string | null;
}

/**
 * Builds the "Browse matching products" href for a guided upfit step. Reuses
 * the existing `/search?q=` free-text route (ProductSearchPage, Product
 * Discovery Foundation) rather than a new category-filtered route — there is
 * no reverse UpfitCategoryId → catalog Category mapping (see
 * FLEET_INTELLIGENCE.md's Known Limitations). `upfitCategory`/`guidedBuild`/
 * `fleetProjectId`/`fleetBuildId` are additive query params: they preserve
 * which guided step/project/build sent the customer here so
 * ProductSearchPage can show a "Recommended for this build" banner and a way
 * back into the guided flow — they never filter or hard-gate the results.
 */
export function resolveUpfitBrowseHref(categoryId: UpfitCategoryId, context: UpfitBrowseContext = {}): string {
  const params = new URLSearchParams();
  params.set('q', getUpfitCategoryLabel(categoryId));
  params.set('upfitCategory', categoryId);
  params.set('guidedBuild', '1');
  if (context.fleetProjectId) params.set('fleetProjectId', context.fleetProjectId);
  if (context.fleetBuildId) params.set('fleetBuildId', context.fleetBuildId);
  return `/search?${params.toString()}`;
}

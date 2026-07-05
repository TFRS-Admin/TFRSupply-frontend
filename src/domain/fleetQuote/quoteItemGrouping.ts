import type { FleetQuoteBuildEntry, QuoteItemGroup, VehicleQuoteSection } from '@/types/fleetQuote';
import { ALL_UPFIT_CATEGORY_IDS, getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import { formatVehicleSectionLabel } from './vehicleLabel';

/**
 * Quote Items — one section per Fleet Build (a vehicle spec), listing its
 * selected products grouped by upfit category. Mirrors the "Explorer Patrol
 * x18 / Roof Bars / Sirens / ..." example: no category/tier logic is
 * re-derived here, only build.selections is read.
 */
export function buildVehicleQuoteSections(entries: FleetQuoteBuildEntry[]): VehicleQuoteSection[] {
  return entries.map(({ build }) => ({
    buildId: build.id,
    buildName: build.name,
    vehicleLabel: formatVehicleSectionLabel(build),
    quantity: build.quantity,
    categories: ALL_UPFIT_CATEGORY_IDS
      .filter((categoryId) => (build.selections[categoryId]?.length ?? 0) > 0)
      .map((categoryId) => ({
        categoryId,
        categoryLabel: getUpfitCategoryLabel(categoryId),
        products: (build.selections[categoryId] ?? []).map((selection) => ({
          productId: selection.productId,
          label: selection.label,
          categoryId,
          categoryLabel: getUpfitCategoryLabel(categoryId),
        })),
      })),
  }));
}

/**
 * Groups identical equipment together across every Fleet Build in the
 * project into one line per product — "quantity" is the total physical units
 * required (sum of build.quantity across every contributing build);
 * "vehicleCount" is how many distinct Fleet Builds (vehicle specs) selected
 * it. The two only diverge when the same product is selected in more than
 * one Fleet Build — see docs/architecture/FLEET_QUOTE_BUILDER.md's
 * Aggregation Model.
 */
export function groupQuoteItems(entries: FleetQuoteBuildEntry[]): QuoteItemGroup[] {
  const groups = new Map<string, QuoteItemGroup>();

  entries.forEach(({ build }) => {
    ALL_UPFIT_CATEGORY_IDS.forEach((categoryId) => {
      (build.selections[categoryId] ?? []).forEach((selection) => {
        const existing = groups.get(selection.productId);
        if (existing) {
          existing.quantity += build.quantity;
          existing.vehicleCount += 1;
          existing.buildIds.push(build.id);
          return;
        }
        groups.set(selection.productId, {
          productId: selection.productId,
          label: selection.label,
          categoryId,
          categoryLabel: getUpfitCategoryLabel(categoryId),
          quantity: build.quantity,
          vehicleCount: 1,
          buildIds: [build.id],
        });
      });
    });
  });

  return Array.from(groups.values()).sort((a, b) => (
    a.categoryLabel === b.categoryLabel ? b.quantity - a.quantity : a.categoryLabel.localeCompare(b.categoryLabel)
  ));
}

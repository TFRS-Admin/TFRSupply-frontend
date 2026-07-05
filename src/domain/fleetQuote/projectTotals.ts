import type { FleetQuoteBuildEntry, ProjectQuoteTotals, QuoteItemGroup } from '@/types/fleetQuote';
import { summarizeFleetHealth } from '@/domain/departmentStandards';

/**
 * Project Totals — no pricing, no taxes. `requiredEquipmentRemaining`/
 * `recommendedEquipmentRemaining` are vehicle-count-weighted (missing
 * category count × build.quantity), mirroring summarizeFleetHealth's
 * criticalGaps convention, so "3 required items remaining" reflects how many
 * vehicles still need equipment, not just how many distinct builds do.
 */
export function calculateProjectTotals(entries: FleetQuoteBuildEntry[], groupedItems: QuoteItemGroup[]): ProjectQuoteTotals {
  const totalVehicles = entries.reduce((sum, entry) => sum + entry.build.quantity, 0);
  const totalLineItems = groupedItems.length;
  const totalEquipmentPieces = groupedItems.reduce((sum, item) => sum + item.quantity, 0);

  const health = summarizeFleetHealth(entries.map(({ build, standard }) => ({ build, standard })));

  const requiredEquipmentRemaining = entries.reduce(
    (sum, entry) => sum + entry.checklist.missingRequired.length * entry.build.quantity,
    0,
  );
  const recommendedEquipmentRemaining = entries.reduce(
    (sum, entry) => sum + entry.checklist.missingRecommended.length * entry.build.quantity,
    0,
  );

  return {
    totalVehicles,
    totalLineItems,
    totalEquipmentPieces,
    completionPercent: health.overallCompletionPercent,
    requiredEquipmentRemaining,
    recommendedEquipmentRemaining,
  };
}

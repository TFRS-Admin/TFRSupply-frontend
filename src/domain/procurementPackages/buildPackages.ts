import type { FleetQuoteBuildEntry } from '@/types/fleetQuote';
import type { ProcurementPackage } from '@/types/procurementPackages';
import type { VehicleQuoteDeps } from '@/domain/fleetQuote';
import { groupFleetQuoteEntriesIntoPackages } from './grouping';
import { aggregatePackageSummary } from './packageSummary';

/**
 * The one entry point every page/component composing this feature should
 * call — groups already-resolved Fleet Quote Builder entries
 * (buildFleetQuoteEntries) into named procurement packages and aggregates
 * each into its full Package Summary. Mirrors how ProjectQuotePage composes
 * buildFleetQuoteEntries once and passes the result to every downstream
 * aggregation function.
 */
export function buildProcurementPackages(entries: FleetQuoteBuildEntry[], deps: VehicleQuoteDeps): ProcurementPackage[] {
  return groupFleetQuoteEntriesIntoPackages(entries).map((group) => aggregatePackageSummary(group, deps));
}

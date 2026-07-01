import type { PricingImportDuplicateRecordGroup } from '@/types/pricingImportDashboard';
import type { PricingNormalizedRecord } from '@/types/pricingImport';

export interface PricingImportRunRecords {
  runId: string;
  records: PricingNormalizedRecord[];
}

interface DuplicateGroupAccumulator {
  kind: PricingNormalizedRecord['kind'];
  sku: string;
  runIds: Set<string>;
  records: PricingNormalizedRecord[];
}

function recordSku(record: PricingNormalizedRecord): string | undefined {
  return 'sku' in record.record ? record.record.sku : undefined;
}

/**
 * Groups normalized records that share the same record kind and SKU across one or more
 * import runs. Records without a SKU (dealer-contract envelopes, quantity-break tables)
 * are not evaluated for duplication here — they are keyed by contract/window elsewhere.
 */
export function detectDuplicateRecords(runs: PricingImportRunRecords[]): PricingImportDuplicateRecordGroup[] {
  const groups = new Map<string, DuplicateGroupAccumulator>();

  runs.forEach(({ runId, records }) => {
    records.forEach((record) => {
      const sku = recordSku(record);
      if (!sku) return;

      const key = `${record.kind}::${sku}`;
      const existing = groups.get(key);
      if (existing) {
        existing.runIds.add(runId);
        existing.records.push(record);
      } else {
        groups.set(key, { kind: record.kind, sku, runIds: new Set([runId]), records: [record] });
      }
    });
  });

  return Array.from(groups.values())
    .filter((group) => group.records.length > 1)
    .map((group) => ({
      kind: group.kind,
      sku: group.sku,
      count: group.records.length,
      runIds: Array.from(group.runIds),
      records: group.records,
    }));
}

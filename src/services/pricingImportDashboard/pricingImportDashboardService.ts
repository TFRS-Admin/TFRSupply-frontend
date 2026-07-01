import { mockPricingImportRunDefinitions } from '@/adapters/pricingImportDashboard';
import type { MockPricingImportRunDefinition } from '@/adapters/pricingImportDashboard';
import { detectDuplicateRecords } from '@/domain/pricingImportDashboard';
import { pricingImportDashboardDataSchema } from '@/schemas/pricingImportDashboard.schema';
import { pricingImportService as defaultPricingImportService } from '@/services/pricingImport';
import type { PricingImportService } from '@/services/pricingImport';
import type { PricingImportIssue, PricingImportResult } from '@/types/pricingImport';
import type { PricingImportDashboardData, PricingImportHistoryEntry, PricingImportRun, PricingImportUploadStatus } from '@/types/pricingImportDashboard';

export interface PricingImportDashboardService {
  loadDashboard(): Promise<PricingImportDashboardData>;
}

export interface PricingImportDashboardServiceDependencies {
  runDefinitions?: MockPricingImportRunDefinition[];
  importService?: PricingImportService;
  now?: () => string;
}

function uploadStatusFor(result: PricingImportResult): PricingImportUploadStatus {
  return result.status === 'failed' ? 'failed' : 'completed';
}

async function runImport(definition: MockPricingImportRunDefinition, importService: PricingImportService): Promise<PricingImportResult> {
  try {
    return await importService.importPricing({
      input: definition.input,
      source: definition.source,
      parser: definition.parser,
      normalizer: definition.normalizer,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown pricing import failure.';
    return {
      importId: definition.source.id,
      source: definition.source,
      status: 'failed',
      parsedRowCount: 0,
      normalizedRecordCount: 0,
      validRecordCount: 0,
      invalidRecordCount: 0,
      records: [],
      issues: [
        {
          code: 'pricing-import-dashboard.run-failed',
          severity: 'error',
          message,
        },
      ],
    };
  }
}

function countBy<T>(items: T[], keyOf: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = keyOf(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function createPricingImportDashboardService(dependencies: PricingImportDashboardServiceDependencies = {}): PricingImportDashboardService {
  const {
    runDefinitions = mockPricingImportRunDefinitions,
    importService = defaultPricingImportService,
    now = () => new Date().toISOString(),
  } = dependencies;

  return {
    async loadDashboard(): Promise<PricingImportDashboardData> {
      const runs: PricingImportRun[] = [];

      for (const definition of runDefinitions) {
        const result = await runImport(definition, importService);
        runs.push({
          id: definition.id,
          label: definition.label,
          source: definition.source,
          uploadStatus: uploadStatusFor(result),
          result,
          startedAt: definition.startedAt,
          completedAt: definition.completedAt,
        });
      }

      const history: PricingImportHistoryEntry[] = [...runs]
        .sort((a, b) => (a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0))
        .map((run) => ({
          runId: run.id,
          label: run.label,
          sourceKind: run.source.kind,
          status: run.result.status,
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          parsedRowCount: run.result.parsedRowCount,
          validRecordCount: run.result.validRecordCount,
          invalidRecordCount: run.result.invalidRecordCount,
        }));

      const issues: PricingImportIssue[] = runs.flatMap((run) => run.result.issues);
      const duplicates = detectDuplicateRecords(runs.map((run) => ({ runId: run.id, records: run.result.records })));

      const totalParsedRows = runs.reduce((sum, run) => sum + run.result.parsedRowCount, 0);
      const totalValidRecords = runs.reduce((sum, run) => sum + run.result.validRecordCount, 0);
      const totalInvalidRecords = runs.reduce((sum, run) => sum + run.result.invalidRecordCount, 0);
      const totalRecordAttempts = totalValidRecords + totalInvalidRecords;

      const dashboardData = {
        generatedAt: now(),
        runs,
        history,
        issues,
        duplicates,
        summary: {
          totalRuns: runs.length,
          totalParsedRows,
          totalValidRecords,
          totalInvalidRecords,
          totalIssues: issues.length,
          runsByStatus: countBy(runs, (run) => run.result.status),
          recordsByKind: countBy(runs.flatMap((run) => run.result.records), (record) => record.kind),
        },
        statistics: {
          successRate: totalRecordAttempts > 0 ? totalValidRecords / totalRecordAttempts : 0,
          errorRate: totalRecordAttempts > 0 ? totalInvalidRecords / totalRecordAttempts : 0,
          averageRecordsPerRun: runs.length > 0 ? totalValidRecords / runs.length : 0,
          issuesBySeverity: countBy(issues, (issue) => issue.severity),
          duplicateRecordCount: duplicates.length,
        },
      };

      return pricingImportDashboardDataSchema.parse(dashboardData);
    },
  };
}

export const pricingImportDashboardService: PricingImportDashboardService = createPricingImportDashboardService();

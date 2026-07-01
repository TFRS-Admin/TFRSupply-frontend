import type { PricingImportIssue, PricingImportResult, PricingImportSource, PricingImportSourceKind, PricingImportStatus, PricingNormalizedRecord } from './pricingImport';

export type PricingImportUploadStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface PricingImportRun {
  id: string;
  label: string;
  source: PricingImportSource;
  uploadStatus: PricingImportUploadStatus;
  result: PricingImportResult;
  startedAt: string;
  completedAt?: string;
}

export interface PricingImportHistoryEntry {
  runId: string;
  label: string;
  sourceKind: PricingImportSourceKind;
  status: PricingImportStatus;
  startedAt: string;
  completedAt?: string;
  parsedRowCount: number;
  validRecordCount: number;
  invalidRecordCount: number;
}

export interface PricingImportDuplicateRecordGroup {
  kind: PricingNormalizedRecord['kind'];
  sku: string;
  count: number;
  runIds: string[];
  records: PricingNormalizedRecord[];
}

export interface PricingImportDashboardSummary {
  totalRuns: number;
  totalParsedRows: number;
  totalValidRecords: number;
  totalInvalidRecords: number;
  totalIssues: number;
  runsByStatus: Record<string, number>;
  recordsByKind: Record<string, number>;
}

export interface PricingImportDashboardStatistics {
  successRate: number;
  errorRate: number;
  averageRecordsPerRun: number;
  issuesBySeverity: Record<string, number>;
  duplicateRecordCount: number;
}

export interface PricingImportDashboardData {
  generatedAt: string;
  runs: PricingImportRun[];
  history: PricingImportHistoryEntry[];
  issues: PricingImportIssue[];
  duplicates: PricingImportDuplicateRecordGroup[];
  summary: PricingImportDashboardSummary;
  statistics: PricingImportDashboardStatistics;
}

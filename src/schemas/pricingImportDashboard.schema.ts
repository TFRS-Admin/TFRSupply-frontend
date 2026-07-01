import { z } from 'zod';
import type {
  PricingImportDashboardData,
  PricingImportDashboardStatistics,
  PricingImportDashboardSummary,
  PricingImportDuplicateRecordGroup,
  PricingImportHistoryEntry,
  PricingImportRun,
  PricingImportUploadStatus,
} from '@/types/pricingImportDashboard';
import {
  pricingImportIssueSchema,
  pricingImportRecordKindSchema,
  pricingImportResultSchema,
  pricingImportSourceKindSchema,
  pricingImportSourceSchema,
  pricingImportStatusSchema,
  pricingNormalizedRecordSchema,
} from './pricingImport.schema';

const nonEmptyString = z.string().min(1);
const nonNegativeInt = z.number().int().nonnegative();

export const pricingImportUploadStatusSchema = z.enum(['queued', 'processing', 'completed', 'failed']) as z.ZodType<PricingImportUploadStatus>;

export const pricingImportRunSchema = z.object({
  id: nonEmptyString,
  label: nonEmptyString,
  source: pricingImportSourceSchema,
  uploadStatus: pricingImportUploadStatusSchema,
  result: pricingImportResultSchema,
  startedAt: nonEmptyString,
  completedAt: z.string().optional(),
}) as z.ZodType<PricingImportRun>;

export const pricingImportHistoryEntrySchema = z.object({
  runId: nonEmptyString,
  label: nonEmptyString,
  sourceKind: pricingImportSourceKindSchema,
  status: pricingImportStatusSchema,
  startedAt: nonEmptyString,
  completedAt: z.string().optional(),
  parsedRowCount: nonNegativeInt,
  validRecordCount: nonNegativeInt,
  invalidRecordCount: nonNegativeInt,
}) as z.ZodType<PricingImportHistoryEntry>;

export const pricingImportDuplicateRecordGroupSchema = z.object({
  kind: pricingImportRecordKindSchema,
  sku: nonEmptyString,
  count: z.number().int().min(2),
  runIds: z.array(nonEmptyString),
  records: z.array(pricingNormalizedRecordSchema),
}) as z.ZodType<PricingImportDuplicateRecordGroup>;

export const pricingImportDashboardSummarySchema = z.object({
  totalRuns: nonNegativeInt,
  totalParsedRows: nonNegativeInt,
  totalValidRecords: nonNegativeInt,
  totalInvalidRecords: nonNegativeInt,
  totalIssues: nonNegativeInt,
  runsByStatus: z.record(nonNegativeInt),
  recordsByKind: z.record(nonNegativeInt),
}) as z.ZodType<PricingImportDashboardSummary>;

export const pricingImportDashboardStatisticsSchema = z.object({
  successRate: z.number().min(0).max(1),
  errorRate: z.number().min(0).max(1),
  averageRecordsPerRun: z.number().nonnegative(),
  issuesBySeverity: z.record(nonNegativeInt),
  duplicateRecordCount: nonNegativeInt,
}) as z.ZodType<PricingImportDashboardStatistics>;

export const pricingImportDashboardDataSchema = z.object({
  generatedAt: nonEmptyString,
  runs: z.array(pricingImportRunSchema),
  history: z.array(pricingImportHistoryEntrySchema),
  issues: z.array(pricingImportIssueSchema),
  duplicates: z.array(pricingImportDuplicateRecordGroupSchema),
  summary: pricingImportDashboardSummarySchema,
  statistics: pricingImportDashboardStatisticsSchema,
}) as z.ZodType<PricingImportDashboardData>;

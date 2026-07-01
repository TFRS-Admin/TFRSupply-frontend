import { z } from 'zod';
import type {
  PricingImportIssue,
  PricingImportResult,
  PricingImportSource,
  PricingImportValidationResult,
  PricingNormalizedRecord,
} from '@/types/pricingImport';
import { contractPriceSchema, dealerContractSchema, dealerCostSchema, listPriceSchema, priceSourceSchema, pricingWarningSchema, quantityBreakSchema } from './pricing.schema';

const nonEmptyString = z.string().min(1);

export const pricingImportSourceKindSchema = z.enum(['excel-workbook', 'csv-file', 'dealer-contract', 'msrp-price-book', 'bundle-definition', 'quantity-break-table', 'unknown']);
export const pricingImportRecordKindSchema = z.enum(['list-price', 'dealer-cost', 'contract-price', 'dealer-contract', 'bundle-pricing', 'quantity-break']);
export const pricingImportStatusSchema = z.enum(['pending', 'parsed', 'normalized', 'validated', 'invalid', 'failed']);
export const pricingImportSeveritySchema = z.enum(['info', 'warning', 'error']);

export const pricingImportSourceSchema = z.object({
  id: nonEmptyString,
  kind: pricingImportSourceKindSchema,
  filename: z.string().optional(),
  manufacturer: z.string().optional(),
  dealerId: z.string().optional(),
  agencyId: z.string().optional(),
  contractId: z.string().optional(),
  importedAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
}) as z.ZodType<PricingImportSource>;

export const pricingParsedRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  sheetName: z.string().optional(),
  values: z.record(z.unknown()),
});

export const pricingParsedDocumentSchema = z.object({
  source: pricingImportSourceSchema,
  rows: z.array(pricingParsedRowSchema),
});

export const pricingImportIssueSchema = z.object({
  code: nonEmptyString,
  severity: pricingImportSeveritySchema,
  message: nonEmptyString,
  rowNumber: z.number().int().positive().optional(),
  sheetName: z.string().optional(),
  fieldPath: z.string().optional(),
  sku: z.string().optional(),
}) as z.ZodType<PricingImportIssue>;

const normalizedBaseRecordSchema = z.object({
  importId: nonEmptyString,
  source: pricingImportSourceSchema,
  rowNumber: z.number().int().positive().optional(),
  sheetName: z.string().optional(),
  sourceRow: z.record(z.unknown()).optional(),
});

export const pricingNormalizedRecordSchema = z.discriminatedUnion('kind', [
  normalizedBaseRecordSchema.extend({ kind: z.literal('list-price'), record: listPriceSchema }),
  normalizedBaseRecordSchema.extend({ kind: z.literal('dealer-cost'), record: dealerCostSchema }),
  normalizedBaseRecordSchema.extend({ kind: z.literal('contract-price'), record: contractPriceSchema }),
  normalizedBaseRecordSchema.extend({ kind: z.literal('dealer-contract'), record: dealerContractSchema }),
  normalizedBaseRecordSchema.extend({ kind: z.literal('quantity-break'), record: quantityBreakSchema }),
  normalizedBaseRecordSchema.extend({
    kind: z.literal('bundle-pricing'),
    record: z.object({
      id: nonEmptyString,
      sku: nonEmptyString,
      items: z.array(z.object({ sku: nonEmptyString, quantity: z.number().int().positive() })).min(1),
      source: priceSourceSchema,
    }),
  }),
]) as z.ZodType<PricingNormalizedRecord>;

export const pricingImportValidationResultSchema = z.object({
  validRecords: z.array(pricingNormalizedRecordSchema),
  invalidRecords: z.array(pricingNormalizedRecordSchema),
  issues: z.array(pricingImportIssueSchema),
}) as z.ZodType<PricingImportValidationResult>;

export const pricingImportResultSchema = z.object({
  importId: nonEmptyString,
  source: pricingImportSourceSchema,
  status: pricingImportStatusSchema,
  parsedRowCount: z.number().int().nonnegative(),
  normalizedRecordCount: z.number().int().nonnegative(),
  validRecordCount: z.number().int().nonnegative(),
  invalidRecordCount: z.number().int().nonnegative(),
  records: z.array(pricingNormalizedRecordSchema),
  issues: z.array(pricingImportIssueSchema),
  pricingWarnings: z.array(pricingWarningSchema).optional(),
}) as z.ZodType<PricingImportResult>;

import { pricingNormalizedRecordSchema } from '@/schemas/pricingImport.schema';
import type { PricingImportIssue, PricingImportValidationResult, PricingImportValidator, PricingNormalizedRecord } from '@/types/pricingImport';

function toIssue(record: PricingNormalizedRecord, message: string, fieldPath?: string): PricingImportIssue {
  return {
    code: 'pricing-import.validation-failed',
    severity: 'error',
    message,
    rowNumber: record.rowNumber,
    sheetName: record.sheetName,
    fieldPath,
    sku: 'sku' in record.record ? record.record.sku : undefined,
  };
}

export const defaultPricingImportValidator: PricingImportValidator = {
  validate(records: PricingNormalizedRecord[]): PricingImportValidationResult {
    const validRecords: PricingNormalizedRecord[] = [];
    const invalidRecords: PricingNormalizedRecord[] = [];
    const issues: PricingImportIssue[] = [];

    records.forEach((record) => {
      const result = pricingNormalizedRecordSchema.safeParse(record);
      if (result.success) {
        validRecords.push(result.data);
        return;
      }

      invalidRecords.push(record);
      result.error.issues.forEach((issue) => {
        issues.push(toIssue(record, issue.message, issue.path.join('.')));
      });
    });

    return { validRecords, invalidRecords, issues };
  },
};

import { pricingParsedDocumentSchema } from '@/schemas/pricingImport.schema';
import type { PricingImportRequest, PricingImportResult, PricingImportValidator, PricingNormalizedRecord, PricingParsedDocument } from '@/types/pricingImport';
import { defaultPricingImportValidator } from './pricingImportValidator';

export interface PricingImportService {
  importPricing<TInput = unknown>(request: PricingImportRequest<TInput>): Promise<PricingImportResult>;
}

export function createPricingImportService(validator: PricingImportValidator = defaultPricingImportValidator): PricingImportService {
  return {
    async importPricing<TInput>(request: PricingImportRequest<TInput>): Promise<PricingImportResult> {
      const parsedDocument = pricingParsedDocumentSchema.parse(await request.parser.parse(request.input, request.source)) as PricingParsedDocument;
      const normalizedRecords: PricingNormalizedRecord[] = await request.normalizer.normalize(parsedDocument);
      const validation = validator.validate(normalizedRecords);
      const status = validation.issues.some((issue) => issue.severity === 'error') ? 'invalid' : 'validated';

      return {
        importId: request.source.id,
        source: request.source,
        status,
        parsedRowCount: parsedDocument.rows.length,
        normalizedRecordCount: normalizedRecords.length,
        validRecordCount: validation.validRecords.length,
        invalidRecordCount: validation.invalidRecords.length,
        records: validation.validRecords,
        issues: validation.issues,
      };
    },
  };
}

export const pricingImportService = createPricingImportService();

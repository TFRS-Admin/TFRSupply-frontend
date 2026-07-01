import { unavailableQuotePdfAdapter } from '@/adapters/quotePdf';
import type { QuotePdfAdapter } from '@/adapters/quotePdf';
import { quotePdfRenderInputSchema } from '@/schemas/quotePdf.schema';
import type { QuotePdfRenderInput, QuotePdfRenderResult, QuotePdfValidationResult } from '@/types';

export interface QuotePdfService {
  generateQuotePdf(input: QuotePdfRenderInput): Promise<QuotePdfRenderResult>;
  validateQuotePdfInput(input: QuotePdfRenderInput): QuotePdfValidationResult;
}

export function createQuotePdfService(adapter: QuotePdfAdapter = unavailableQuotePdfAdapter): QuotePdfService {
  return {
    generateQuotePdf(input) {
      return adapter.renderQuotePdf(quotePdfRenderInputSchema.parse(input));
    },
    validateQuotePdfInput(input) {
      const parsed = quotePdfRenderInputSchema.safeParse(input);
      if (!parsed.success) {
        return {
          valid: false,
          reviewFlags: [],
          errors: parsed.error.issues.map((issue) => ({
            code: 'QUOTE_PDF_INVALID_INPUT',
            message: issue.message,
            fieldPath: issue.path.join('.'),
          })),
        };
      }
      return { valid: true, reviewFlags: parsed.data.draft.reviewFlags ?? [], errors: [] };
    },
  };
}

export const quotePdfService: QuotePdfService = createQuotePdfService();

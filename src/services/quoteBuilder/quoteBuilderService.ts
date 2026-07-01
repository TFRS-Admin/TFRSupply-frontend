import { unavailableQuoteBuilderAdapter } from '@/adapters/quoteBuilder';
import type { QuoteBuilderAdapter } from '@/adapters/quoteBuilder';
import { quoteAssemblyInputSchema, quoteDraftSchema } from '@/schemas/quote.schema';
import type { QuoteAssemblyInput, QuoteAssemblyResult, QuoteDraft, QuoteValidationResult } from '@/types';

export interface QuoteBuilderService {
  getDraft(draftId: string): Promise<QuoteDraft | null>;
  saveDraft(draft: QuoteDraft): Promise<QuoteDraft>;
  assembleQuote(input: QuoteAssemblyInput): Promise<QuoteAssemblyResult>;
  validateQuote(input: QuoteAssemblyInput): Promise<QuoteValidationResult>;
}

export function createQuoteBuilderService(adapter: QuoteBuilderAdapter = unavailableQuoteBuilderAdapter): QuoteBuilderService {
  return {
    getDraft(draftId) {
      return adapter.getDraft(draftId);
    },
    saveDraft(draft) {
      return adapter.saveDraft(quoteDraftSchema.parse(draft));
    },
    assembleQuote(input) {
      return adapter.assembleQuote(quoteAssemblyInputSchema.parse(input));
    },
    validateQuote(input) {
      return adapter.validateQuote(quoteAssemblyInputSchema.parse(input));
    },
  };
}

export const quoteBuilderService: QuoteBuilderService = createQuoteBuilderService();

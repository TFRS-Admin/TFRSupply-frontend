import type { QuoteAssemblyInput, QuoteAssemblyResult, QuoteDraft, QuoteValidationResult } from '@/types';

export interface QuoteBuilderAdapter {
  getDraft(draftId: string): Promise<QuoteDraft | null>;
  saveDraft(draft: QuoteDraft): Promise<QuoteDraft>;
  assembleQuote(input: QuoteAssemblyInput): Promise<QuoteAssemblyResult>;
  validateQuote(input: QuoteAssemblyInput): Promise<QuoteValidationResult>;
}

const unavailableMessage = 'Quote Builder data source is not connected.';

export const unavailableQuoteBuilderAdapter: QuoteBuilderAdapter = {
  async getDraft() {
    return null;
  },
  async saveDraft(draft) {
    return draft;
  },
  async assembleQuote() {
    return {
      status: 'unavailable',
      draft: null,
      reviewFlags: [{ code: 'QUOTE_BUILDER_UNAVAILABLE', severity: 'info', message: unavailableMessage, source: 'quote-builder' }],
    };
  },
  async validateQuote() {
    return {
      valid: false,
      reviewFlags: [{ code: 'QUOTE_BUILDER_UNAVAILABLE', severity: 'info', message: unavailableMessage, source: 'quote-builder' }],
    };
  },
};

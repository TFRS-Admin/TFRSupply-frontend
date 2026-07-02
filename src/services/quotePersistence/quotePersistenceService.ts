import { inMemoryQuoteRepository, type QuoteRepository } from '@/adapters/quotePersistence';
import { quoteHistoryResultSchema, quoteLoadResultSchema, quotePersistenceRecordSchema, quoteSaveInputSchema, quoteSaveResultSchema, quoteUpdateInputSchema, quoteUpdateResultSchema } from '@/schemas/quote.schema';
import type { QuoteLoadResult, QuoteRevisionMetadata, QuoteSaveInput, QuoteSaveResult, QuoteUpdateInput, QuoteUpdateResult, QuoteHistoryResult } from '@/types';

export interface QuotePersistenceService {
  saveQuote(input: QuoteSaveInput): Promise<QuoteSaveResult>;
  loadQuote(quoteId: string): Promise<QuoteLoadResult>;
  updateQuote(input: QuoteUpdateInput): Promise<QuoteUpdateResult>;
  getQuoteHistory(quoteId: string): Promise<QuoteHistoryResult>;
}

function revisionMetadata(quoteId: string, version: number, input?: QuoteSaveInput['revision']): QuoteRevisionMetadata {
  return {
    quoteId,
    version,
    savedAt: input?.savedAt ?? new Date().toISOString(),
    savedBy: input?.savedBy,
    source: input?.source,
    note: input?.note,
  };
}

export function createQuotePersistenceService(repository: QuoteRepository = inMemoryQuoteRepository): QuotePersistenceService {
  return {
    async saveQuote(input) {
      const validated = quoteSaveInputSchema.parse(input);
      const revision = revisionMetadata(validated.quote.id, 1, validated.revision);
      const record = quotePersistenceRecordSchema.parse(await repository.saveQuote({ quote: validated.quote, revision }));
      return quoteSaveResultSchema.parse({ status: 'saved', record });
    },

    async loadQuote(quoteId) {
      const record = await repository.loadQuote(quoteId);
      return quoteLoadResultSchema.parse(record ? { status: 'found', quoteId, record } : { status: 'not-found', quoteId });
    },

    async updateQuote(input) {
      const validated = quoteUpdateInputSchema.parse(input);
      const nextVersion = validated.expectedVersion + 1;
      const revision = revisionMetadata(validated.quoteId, nextVersion, validated.revision);
      const result = await repository.updateQuote({ quoteId: validated.quoteId, quote: { ...validated.quote, id: validated.quoteId }, expectedVersion: validated.expectedVersion, revision });
      return quoteUpdateResultSchema.parse({ quoteId: validated.quoteId, expectedVersion: validated.expectedVersion, ...result });
    },

    async getQuoteHistory(quoteId) {
      return quoteHistoryResultSchema.parse(await repository.getQuoteHistory(quoteId));
    },
  };
}

export const quotePersistenceService: QuotePersistenceService = createQuotePersistenceService();

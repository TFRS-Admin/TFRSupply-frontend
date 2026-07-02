import type { Quote, QuoteHistoryResult, QuotePersistenceRecord, QuoteRevisionMetadata } from '@/types';

export interface QuoteRepositorySaveInput {
  quote: Quote;
  revision: QuoteRevisionMetadata;
}

export interface QuoteRepositoryUpdateInput {
  quoteId: string;
  quote: Quote;
  expectedVersion: number;
  revision: QuoteRevisionMetadata;
}

export interface QuoteRepositoryUpdateResult {
  status: 'updated' | 'not-found' | 'conflict';
  record?: QuotePersistenceRecord;
  expectedVersion?: number;
  currentVersion?: number;
}

export interface QuoteRepository {
  saveQuote(input: QuoteRepositorySaveInput): Promise<QuotePersistenceRecord>;
  loadQuote(quoteId: string): Promise<QuotePersistenceRecord | null>;
  updateQuote(input: QuoteRepositoryUpdateInput): Promise<QuoteRepositoryUpdateResult>;
  getQuoteHistory(quoteId: string): Promise<QuoteHistoryResult>;
}

function clone<T>(value: T): T {
  return globalThis.structuredClone ? globalThis.structuredClone(value) : JSON.parse(JSON.stringify(value));
}

export function createInMemoryQuoteRepository(seed: QuotePersistenceRecord[] = []): QuoteRepository {
  const records = new Map<string, QuotePersistenceRecord>();

  for (const record of seed) {
    records.set(record.quote.id, clone(record));
  }

  return {
    async saveQuote(input) {
      const record: QuotePersistenceRecord = {
        quote: clone(input.quote),
        revision: clone(input.revision),
        history: [{ quote: clone(input.quote), revision: clone(input.revision) }],
      };
      records.set(input.quote.id, record);
      return clone(record);
    },

    async loadQuote(quoteId) {
      const record = records.get(quoteId);
      return record ? clone(record) : null;
    },

    async updateQuote(input) {
      const existing = records.get(input.quoteId);
      if (!existing) {
        return { status: 'not-found', expectedVersion: input.expectedVersion };
      }

      if (existing.revision.version !== input.expectedVersion) {
        return {
          status: 'conflict',
          expectedVersion: input.expectedVersion,
          currentVersion: existing.revision.version,
          record: clone(existing),
        };
      }

      const record: QuotePersistenceRecord = {
        quote: clone(input.quote),
        revision: clone(input.revision),
        history: [...existing.history, { quote: clone(input.quote), revision: clone(input.revision) }],
      };
      records.set(input.quoteId, record);
      return { status: 'updated', record: clone(record), expectedVersion: input.expectedVersion, currentVersion: record.revision.version };
    },

    async getQuoteHistory(quoteId) {
      const record = records.get(quoteId);
      if (!record) return { status: 'not-found', quoteId, history: [] };
      return { status: 'found', quoteId, history: clone(record.history) };
    },
  };
}

export const inMemoryQuoteRepository = createInMemoryQuoteRepository();

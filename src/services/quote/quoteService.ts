import type { Quote, QuotePayload } from '@/types';

export interface QuoteService {
  getQuote(quoteId: string): Promise<Quote | null>;
  createQuote(payload: QuotePayload): Promise<Quote>;
  submitQuote(quoteId: string): Promise<Quote>;
}

export const quoteService: QuoteService = {
  async getQuote(): Promise<Quote | null> {
    throw new Error('Not implemented');
  },
  async createQuote(): Promise<Quote> {
    throw new Error('Not implemented');
  },
  async submitQuote(): Promise<Quote> {
    throw new Error('Not implemented');
  },
};

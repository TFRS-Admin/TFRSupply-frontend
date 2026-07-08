/**
 * adapters/base44/adminQuoteAdapter.ts
 * Data access for the admin quote queue.
 *
 * Base44 removed: these are stubbed to log to the console and return empty
 * results until a real Shopify-backed data source replaces them.
 */

export interface QuoteRecord {
  id: string;
  submittedAt?: string;
  status: string;
  [key: string]: unknown;
}

/** Load all QuoteRequest records, newest first. */
export async function fetchAllQuotes(): Promise<QuoteRecord[]> {
  console.log('[adminQuoteAdapter] Stub fetchAllQuotes (Base44 removed, Shopify integration pending)');
  return [];
}

/** Advance a single quote's status field. */
export async function updateQuoteStatus(id: string, status: string): Promise<QuoteRecord> {
  console.log('[adminQuoteAdapter] Stub updateQuoteStatus (Base44 removed, Shopify integration pending):', { id, status });
  return { id, status };
}

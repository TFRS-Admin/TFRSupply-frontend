/**
 * adapters/base44/adminQuoteAdapter.js
 * Base44 data access for the admin quote queue.
 * Only file that imports base44Client for quote admin operations.
 */

import { base44 } from '@/api/base44Client';

/** Load all QuoteRequest records, newest first. */
export async function fetchAllQuotes() {
  return base44.entities.QuoteRequest.list('-submittedAt', 200);
}

/** Advance a single quote's status field. */
export async function updateQuoteStatus(id, status) {
  return base44.entities.QuoteRequest.update(id, { status });
}
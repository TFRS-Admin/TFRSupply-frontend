/**
 * adapters/base44/adminQuoteAdapter.js
 * Previously Base44 data access for the admin quote queue.
 *
 * Base44 has been removed as part of the platform migration, so there is
 * no backend to read quote records from until a replacement is wired up.
 */

/** Load all QuoteRequest records, newest first. */
export async function fetchAllQuotes() {
  return [];
}

/** Advance a single quote's status field. */
export async function updateQuoteStatus(id, status) {
  throw new Error('Quote status updates are temporarily unavailable during our platform migration.');
}
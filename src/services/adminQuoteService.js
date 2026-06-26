/**
 * services/adminQuoteService.js
 * Business logic for the admin quote queue.
 * UI imports this — never imports base44 directly.
 */

import { fetchAllQuotes, updateQuoteStatus } from '@/adapters/base44/adminQuoteAdapter';

export const STATUS_ORDER = ['new', 'reviewed', 'quoted', 'closed'];

export const STATUS_LABELS = {
  new:      'New',
  reviewed: 'Reviewed',
  quoted:   'Quoted',
  closed:   'Closed',
};

export const STATUS_COLORS = {
  new:      { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  reviewed: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  quoted:   { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  closed:   { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
};

/** Return the next status in the pipeline, or null if already closed. */
export function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  return idx >= 0 && idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;
}

/** Derive the human-readable reference ID from a record. */
export function deriveReferenceId(record) {
  return record?.id ? `QR-${record.id.slice(-6).toUpperCase()}` : '—';
}

export async function loadQuotes() {
  return fetchAllQuotes();
}

export async function advanceQuoteStatus(id, currentStatus) {
  const next = nextStatus(currentStatus);
  if (!next) throw new Error('Quote is already closed.');
  return updateQuoteStatus(id, next);
}
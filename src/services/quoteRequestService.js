/**
 * services/quoteRequestService.js
 * Shared quote-request utilities: submission ID generation, contact-form
 * validation, and delivery. Payload construction is caller-specific (the
 * configurator PDP and the cart have different source data) and lives with
 * each caller — see `QuoteContactModal`'s `buildPayload` prop.
 *
 * UI components call ONLY this module for delivery — it never imports the
 * delivery mechanism (hosted form / mailto) directly.
 */

import { quoteDeliveryAdapter } from '@/adapters/quoteDelivery';

// ─── Idempotency Key ─────────────────────────────────────────────────────────

/**
 * Generate a client-side submissionId for idempotency.
 * Stable for the lifetime of the browser tab session.
 * Format: sub-<timestamp>-<random6>
 */
export function generateSubmissionId() {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Validation ─────────────────────────────────────────────────────────────

/**
 * Validate contact form fields before submission.
 * Returns { valid: bool, errors: { field: message } }
 */
export function validateContactForm(contactForm) {
  const errors = {};

  if (!contactForm.name?.trim())   errors.name   = 'Full name is required.';
  if (!contactForm.agency?.trim()) errors.agency = 'Agency or company is required.';

  const email = contactForm.email?.trim() || '';
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── Submit ──────────────────────────────────────────────────────────────────

/**
 * Primary submission entry point. UI calls this and nothing else.
 *
 * @param {QuotePayload} payload — built via buildQuotePayload
 * @returns {Promise<{ success: boolean, referenceId?: string, error?: string }>}
 */
export async function submitQuoteRequest(payload) {
  return quoteDeliveryAdapter.submitQuoteRequest(payload);
}
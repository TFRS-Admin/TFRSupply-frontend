/**
 * services/quoteRequestService.js
 * Portable quote request service layer.
 *
 * UI components call ONLY this module.
 * All delivery logic is delegated to an adapter — this module never imports Base44 directly.
 *
 * To swap the delivery mechanism (e.g. Shopify quote, CRM, email):
 *   Replace the adapter import below; nothing else changes.
 */

import { submitViaBase44Email } from '@/adapters/base44/quoteRequestAdapter';

// ─── Payload Builder ────────────────────────────────────────────────────────

/**
 * Assemble the full quote payload from configurator summary + contact form fields.
 *
 * @param {object} session      — ConfigurationSession from context
 * @param {object} summary      — computeSummary output from context
 * @param {object} productMeta  — { productId, configuratorId, productTitle }
 * @param {object} contactForm  — { name, agency, email, phone, vehicleCount, notes }
 * @returns {QuotePayload}
 */
export function buildQuotePayload(session, summary, productMeta, contactForm) {
  const { resolvedSelections, accessories, depRequirements, violations, skuPreview } = summary;

  const dependencyNotes = depRequirements.map(d =>
    `${d.targetStepLabel} required because: ${d.triggerLabel} was selected. ${d.message || ''}`.trim()
  );

  const warningNotes = violations
    .filter(v => v.type === 'warns')
    .map(v => `Advisory — ${v.optionALabel} + ${v.optionBLabel}: ${v.message}`);

  return {
    // Product identity
    productId: productMeta.productId,
    configuratorId: productMeta.configuratorId,
    productTitle: productMeta.productTitle || productMeta.productId,

    // Configuration output
    selectedOptions: resolvedSelections.map(s => ({
      stepId: s.stepId,
      stepLabel: s.stepLabel,
      selected: s.selected,
    })),
    accessories: accessories.map(a => ({
      stepId: a.stepId,
      optionId: a.optionId,
      optionLabel: a.optionLabel,
      priceModifier: a.priceModifier,
    })),
    skuPreview: skuPreview || null,
    dependencyNotes,
    warningNotes,

    // Contact fields
    contact: {
      name: contactForm.name.trim(),
      agency: contactForm.agency.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone?.trim() || '',
      vehicleCount: contactForm.vehicleCount || '',
      notes: contactForm.notes?.trim() || '',
    },

    // Metadata
    timestamp: new Date().toISOString(),
    source: 'configurator-prototype',
  };
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
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function submitQuoteRequest(payload) {
  return submitViaBase44Email(payload);
}
/**
 * adapters/base44/quoteRequestAdapter.js
 * Delivery adapter: previously Base44 entity storage + SendEmail.
 *
 * Base44 has been removed as part of the platform migration, so this
 * adapter has no delivery backend to persist to or send email through.
 * It fails gracefully (matching the other "coming soon" auth pages) until
 * a replacement delivery backend (e.g. a Shopify-based flow) is wired up.
 * To swap delivery: create a new adapter, update quoteRequestService.js import.
 */


// ─── Helpers ─────────────────────────────────────────────────────────────────

function deriveReferenceId(recordId) {
  return recordId ? `QR-${recordId.slice(-6).toUpperCase()}` : null;
}

function buildEmailBody(payload, referenceId) {
  const {
    contact, selectedOptions, accessories, selectedSku, matchingSkus, skuStatus,
    dependencyNotes, warningNotes, productTitle, configuratorId,
    timestamp, submissionId,
  } = payload;

  const optionsBlock = selectedOptions.map(o =>
    `  ${o.stepLabel}: ${o.selected.join(', ')}`
  ).join('\n');

  const accessoriesBlock = accessories.length > 0
    ? accessories.map(a => `  - ${a.optionLabel}${a.priceModifier > 0 ? ` (+$${a.priceModifier})` : ''}`).join('\n')
    : '  None';

  const depBlock = dependencyNotes.length > 0
    ? dependencyNotes.map(n => `  • ${n}`).join('\n') : '  None';

  const warnBlock = warningNotes.length > 0
    ? warningNotes.map(n => `  ⚠ ${n}`).join('\n') : '  None';

  const skuLine = skuStatus === 'matched'
    ? `Selected SKU:  ${selectedSku}`
    : skuStatus === 'multiple'
      ? `SKU Candidates: ${(matchingSkus || []).map(s => s.sku ?? s).join(', ')} (${matchingSkus?.length} matches — selection narrowed but not resolved)`
      : `Selected SKU:  (no match — selections may not map to an existing SKU)`;

  return `
QUOTE REQUEST — TFR Supply Configurator
========================================
Reference #:  ${referenceId || 'N/A'}
Submission:   ${submissionId}
Product:      ${productTitle}
Configurator: ${configuratorId}
${skuLine}
Submitted:    ${new Date(timestamp).toLocaleString()}

CONTACT INFORMATION
-------------------
Name:          ${contact.name}
Agency:        ${contact.agency}
Email:         ${contact.email}
Phone:         ${contact.phone || 'Not provided'}
Vehicle Count: ${contact.vehicleCount || 'Not specified'}
Notes:         ${contact.notes || 'None'}

CONFIGURATION SELECTIONS
------------------------
${optionsBlock || '  (none)'}

ACCESSORIES
-----------
${accessoriesBlock}

DEPENDENCY NOTICES
------------------
${depBlock}

ADVISORIES / WARNINGS
---------------------
${warnBlock}

--
This quote request was submitted via the TFR Supply Prototype Configurator.
Data is illustrative — not a production order.
`.trim();
}

function buildConfirmationBody(payload, referenceId) {
  const { contact, productTitle, selectedSku, selectedOptions } = payload;
  const optionsBlock = selectedOptions.map(o =>
    `  ${o.stepLabel}: ${o.selected.join(', ')}`
  ).join('\n');
  return `
Hi ${contact.name},

Thank you for submitting a quote request for the ${productTitle}.

Your configuration summary:
${optionsBlock || '  (none)'}

Selected SKU:  ${selectedSku || '(pending — will be confirmed by a representative)'}
Reference #:   ${referenceId || 'N/A'}

A TFR Supply representative will review your request and be in touch shortly.
If you need to follow up, please reference your quote number above.

—
TFR Supply Pro Shop
`.trim();
}

// ─── Adapter Entry Point ──────────────────────────────────────────────────────

/**
 * Base44 (the previous storage + email backend) has been removed. There is
 * currently no delivery backend to persist to or send email through, so this
 * always reports failure without attempting a submission.
 *
 * @param {QuotePayload} payload — must include submissionId
 * @returns {Promise<{ success: boolean, referenceId?: string, savedRecord?: boolean, error?: string }>}
 */
export async function submitViaBase44Email(payload) {
  return {
    success: false,
    savedRecord: false,
    error: 'Quote request submission is temporarily unavailable during our platform migration. Please call 800-621-9959 or email us directly.',
  };
}
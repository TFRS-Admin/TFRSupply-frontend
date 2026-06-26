/**
 * adapters/base44/quoteRequestAdapter.js
 * Delivery adapter: Base44 SendEmail.
 *
 * This is the ONLY file that imports base44Client.
 * To swap delivery (e.g. REST endpoint, Shopify, CRM):
 *   Create a new adapter and update quoteRequestService.js import.
 */

import { base44 } from '@/api/base44Client';

// ─── Email Recipient ─────────────────────────────────────────────────────────
// In production replace with an env-configurable address or app setting.
const QUOTE_RECIPIENT = 'quotes@tfrsupply.com';

// ─── Email Body Builder ──────────────────────────────────────────────────────

function buildEmailBody(payload) {
  const { contact, selectedOptions, accessories, skuPreview, dependencyNotes, warningNotes, productTitle, configuratorId, timestamp } = payload;

  const optionsBlock = selectedOptions.map(o =>
    `  ${o.stepLabel}: ${o.selected.join(', ')}`
  ).join('\n');

  const accessoriesBlock = accessories.length > 0
    ? accessories.map(a => `  - ${a.optionLabel}${a.priceModifier > 0 ? ` (+$${a.priceModifier})` : ''}`).join('\n')
    : '  None';

  const depBlock = dependencyNotes.length > 0
    ? dependencyNotes.map(n => `  • ${n}`).join('\n')
    : '  None';

  const warnBlock = warningNotes.length > 0
    ? warningNotes.map(n => `  ⚠ ${n}`).join('\n')
    : '  None';

  return `
QUOTE REQUEST — TFR Supply Configurator
========================================
Product:      ${productTitle}
Configurator: ${configuratorId}
SKU Preview:  ${skuPreview || '(incomplete)'}
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

// ─── Adapter Entry Point ─────────────────────────────────────────────────────

/**
 * Send a quote request payload via Base44 SendEmail.
 * @param {QuotePayload} payload
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function submitViaBase44Email(payload) {
  const body = buildEmailBody(payload);

  await base44.integrations.Core.SendEmail({
    to: QUOTE_RECIPIENT,
    subject: `Quote Request — ${payload.productTitle} (${payload.skuPreview || 'Incomplete SKU'})`,
    body,
  });

  return { success: true };
}
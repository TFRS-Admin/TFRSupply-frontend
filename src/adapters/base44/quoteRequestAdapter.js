/**
 * adapters/base44/quoteRequestAdapter.js
 * Delivery adapter: Base44 SendEmail + QuoteRequest entity storage.
 *
 * This is the ONLY file that imports base44Client.
 * To swap delivery (e.g. REST endpoint, Shopify, CRM):
 *   Create a new adapter and update quoteRequestService.js import.
 */

import { base44 } from '@/api/base44Client';
import appConfig from '@/config/appConfig';

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

function buildConfirmationBody(payload, referenceId) {
  const { contact, productTitle, skuPreview, selectedOptions } = payload;
  const optionsBlock = selectedOptions.map(o => `  ${o.stepLabel}: ${o.selected.join(', ')}`).join('\n');
  return `
Hi ${contact.name},

Thank you for submitting a quote request for the ${productTitle}.

Your configuration summary:
${optionsBlock || '  (none)'}

SKU Reference: ${skuPreview || '(pending)'}
Reference #:   ${referenceId || 'N/A'}

A TFR Supply representative will review your request and be in touch shortly.

—
TFR Supply Pro Shop
`.trim();
}

// ─── Adapter Entry Point ─────────────────────────────────────────────────────

/**
 * Persist quote record, send internal email, optionally send confirmation.
 * @param {QuotePayload} payload
 * @returns {Promise<{ success: boolean, referenceId?: string, error?: string }>}
 */
export async function submitViaBase44Email(payload) {
  // 1. Persist record first — if this fails, we surface the error before sending email
  const record = await base44.entities.QuoteRequest.create({
    productId:       payload.productId,
    configuratorId:  payload.configuratorId,
    productTitle:    payload.productTitle,
    skuPreview:      payload.skuPreview || '',
    selectedOptions: payload.selectedOptions,
    accessories:     payload.accessories,
    dependencyNotes: payload.dependencyNotes,
    warningNotes:    payload.warningNotes,
    contactName:     payload.contact.name,
    agency:          payload.contact.agency,
    email:           payload.contact.email,
    phone:           payload.contact.phone || '',
    vehicleCount:    payload.contact.vehicleCount || '',
    notes:           payload.contact.notes || '',
    status:          'new',
    source:          payload.source,
    submittedAt:     payload.timestamp,
  });

  const referenceId = record?.id ? `QR-${record.id.slice(-6).toUpperCase()}` : null;

  // 2. Send internal email to quote recipient
  const body = buildEmailBody(payload);
  const subject = `Quote Request — ${payload.productTitle} (${payload.skuPreview || 'Incomplete SKU'})${referenceId ? ` [${referenceId}]` : ''}`;

  await base44.integrations.Core.SendEmail({
    from_name: appConfig.quoteSenderName,
    to: appConfig.quoteRecipientEmail,
    subject,
    body,
  });

  // 3. Send confirmation to requestor (if enabled)
  if (appConfig.quoteSendConfirmation && payload.contact?.email) {
    await base44.integrations.Core.SendEmail({
      from_name: appConfig.quoteSenderName,
      to: payload.contact.email,
      subject: `Your Quote Request — ${payload.productTitle}${referenceId ? ` [${referenceId}]` : ''}`,
      body: buildConfirmationBody(payload, referenceId),
    });
  }

  return { success: true, referenceId };
}
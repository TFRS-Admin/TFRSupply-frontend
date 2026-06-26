/**
 * adapters/base44/quoteRequestAdapter.js
 * Delivery adapter: Base44 entity storage + SendEmail.
 *
 * This is the ONLY file that imports base44Client.
 * Idempotency: checks submissionId before creating a new record — safe to retry.
 * To swap delivery: create a new adapter, update quoteRequestService.js import.
 */

import { base44 } from '@/api/base44Client';
import appConfig from '@/config/appConfig';

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

// ─── Idempotent Record Step ───────────────────────────────────────────────────

async function getOrCreateRecord(payload) {
  // Check for an existing record with the same submissionId
  const existing = await base44.entities.QuoteRequest.filter({ submissionId: payload.submissionId });
  if (existing && existing.length > 0) {
    return { record: existing[0], wasExisting: true };
  }

  const record = await base44.entities.QuoteRequest.create({
    submissionId:    payload.submissionId,
    productId:       payload.productId,
    configuratorId:  payload.configuratorId,
    productTitle:    payload.productTitle,
    skuPreview:      payload.selectedSku || payload.skuPreview || '',
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

  return { record, wasExisting: false };
}

// ─── Adapter Entry Point ──────────────────────────────────────────────────────

/**
 * Idempotent: persist quote record then send emails.
 * Safe to retry — will reuse the existing record if submissionId already exists.
 *
 * @param {QuotePayload} payload — must include submissionId
 * @returns {Promise<{ success: boolean, referenceId?: string, savedRecord?: boolean, error?: string }>}
 */
export async function submitViaBase44Email(payload) {
  // 1. Persist (or retrieve existing) record — idempotent on submissionId
  const { record, wasExisting } = await getOrCreateRecord(payload);
  const referenceId = deriveReferenceId(record?.id);

  // 2. Send internal email — always attempt even on retry
  let emailError = null;
  try {
    const body = buildEmailBody(payload, referenceId);
    const subject = `Quote Request — ${payload.productTitle} (${payload.selectedSku || 'SKU pending'})${referenceId ? ` [${referenceId}]` : ''}`;
    await base44.integrations.Core.SendEmail({
      from_name: appConfig.quoteSenderName,
      to: appConfig.quoteRecipientEmail,
      subject,
      body,
    });

    // 3. Confirmation email to requestor
    if (appConfig.quoteSendConfirmation && payload.contact?.email) {
      await base44.integrations.Core.SendEmail({
        from_name: appConfig.quoteSenderName,
        to: payload.contact.email,
        subject: `Your Quote Request — ${payload.productTitle}${referenceId ? ` [${referenceId}]` : ''}`,
        body: buildConfirmationBody(payload, referenceId),
      });
    }
  } catch (err) {
    emailError = err.message;
  }

  // Record was saved — partial success if email failed
  if (emailError) {
    return {
      success: false,
      savedRecord: true,
      referenceId,
      error: `Your request was saved (${referenceId || 'see reference above'}) but the notification email failed. Please contact us directly and mention your reference number.`,
    };
  }

  return { success: true, referenceId, savedRecord: true, wasExisting };
}
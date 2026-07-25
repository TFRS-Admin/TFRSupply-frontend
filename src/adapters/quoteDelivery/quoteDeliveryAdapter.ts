/**
 * adapters/quoteDelivery/quoteDeliveryAdapter.ts
 * Delivery adapter for quote requests (PR-12 — replaces the Base44 stub).
 *
 * This is the ONLY file that quoteRequestService.js imports for delivery.
 * v1, no backend: posts to a hosted form endpoint when one is configured
 * (VITE_QUOTE_DELIVERY_ENDPOINT), otherwise opens the requester's email
 * client with a pre-filled message — the same mailto pattern ComparePage
 * already uses. Every outcome reported to the caller reflects something
 * that actually happened; there is no fabricated success.
 */

export interface QuoteContact {
  name: string;
  agency: string;
  email: string;
  phone?: string;
  vehicleCount?: string | number;
  notes?: string;
}

export interface QuoteSelectedOption {
  stepId: string;
  stepLabel: string;
  selected: string[];
}

export interface QuoteAccessory {
  stepId: string;
  optionId: string;
  optionLabel: string;
  priceModifier: number;
}

export interface QuotePayload {
  productId: string;
  configuratorId: string;
  productTitle: string;
  selectedOptions: QuoteSelectedOption[];
  accessories: QuoteAccessory[];
  selectedSku: string | null;
  matchingSkus: unknown[];
  skuStatus: string;
  skuPreview?: string | null;
  dependencyNotes: string[];
  warningNotes: string[];
  contact: QuoteContact;
  submissionId: string;
  timestamp: string;
  source: string;
}

export type QuoteDeliveryMethod = 'hosted-form' | 'mailto';

export interface QuoteSubmissionResult {
  success: boolean;
  referenceId?: string;
  deliveryMethod?: QuoteDeliveryMethod;
  mailtoUrl?: string;
  error?: string;
}

export interface QuoteDeliveryConfig {
  endpoint?: string;
  recipientEmail: string;
}

export type QuoteDeliveryFetchImpl = typeof fetch;

function deriveReferenceId(submissionId: string): string {
  return `QR-${submissionId.slice(-6).toUpperCase()}`;
}

function formatOptionLines(payload: QuotePayload): string[] {
  const lines = payload.selectedOptions.map((option) => `${option.stepLabel}: ${option.selected.join(', ')}`);
  if (payload.accessories.length > 0) {
    lines.push(`Accessories: ${payload.accessories.map((accessory) => accessory.optionLabel).join(', ')}`);
  }
  return lines;
}

export function buildQuoteEmailBody(payload: QuotePayload, referenceId: string): string {
  const { contact } = payload;
  return [
    `Reference: ${referenceId}`,
    `Product: ${payload.productTitle}`,
    `SKU: ${payload.selectedSku || payload.skuPreview || '(pending)'}`,
    '',
    ...formatOptionLines(payload),
    '',
    `Contact: ${contact.name} — ${contact.agency}`,
    `Email: ${contact.email}`,
    contact.phone ? `Phone: ${contact.phone}` : null,
    contact.vehicleCount ? `Vehicle count: ${contact.vehicleCount}` : null,
    contact.notes ? `Notes: ${contact.notes}` : null,
  ].filter((line): line is string => line !== null).join('\n');
}

export function buildQuoteMailtoUrl(payload: QuotePayload, referenceId: string, recipientEmail: string): string {
  const subject = `Quote Request ${referenceId}: ${payload.productTitle}`;
  const body = buildQuoteEmailBody(payload, referenceId);
  return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function networkErrorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : 'Network error contacting the quote delivery service.';
}

export function createQuoteDeliveryAdapter(
  config: QuoteDeliveryConfig,
  fetchImpl: QuoteDeliveryFetchImpl = fetch,
  openMailto: (url: string) => void = (url) => {
    if (typeof window !== 'undefined') window.location.href = url;
  },
) {
  return {
    async submitQuoteRequest(payload: QuotePayload): Promise<QuoteSubmissionResult> {
      const referenceId = deriveReferenceId(payload.submissionId);

      if (config.endpoint) {
        try {
          const response = await fetchImpl(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...payload, referenceId, recipientEmail: config.recipientEmail }),
          });

          if (!response.ok) {
            return {
              success: false,
              referenceId,
              deliveryMethod: 'hosted-form',
              error: `Quote delivery service responded with HTTP ${response.status}.`,
            };
          }

          return { success: true, referenceId, deliveryMethod: 'hosted-form' };
        } catch (reason) {
          return { success: false, referenceId, deliveryMethod: 'hosted-form', error: networkErrorMessage(reason) };
        }
      }

      const mailtoUrl = buildQuoteMailtoUrl(payload, referenceId, config.recipientEmail);
      openMailto(mailtoUrl);
      return { success: true, referenceId, deliveryMethod: 'mailto', mailtoUrl };
    },
  };
}

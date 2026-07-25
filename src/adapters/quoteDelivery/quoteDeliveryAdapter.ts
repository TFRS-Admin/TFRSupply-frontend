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

export interface QuoteLineSummary {
  sku: string;
  label: string;
  quantity: number;
  unitPrice?: number;
  /** Free-form extra context for this line (e.g. accessory SKUs, vehicle) that doesn't fit the other fields. */
  note?: string;
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
  /** Vehicle context (year/make/model), when the quote originates from a vehicle-scoped configurator. */
  vehicleSummary?: string;
  /** Requested quantity for the single-SKU shape (PDP). Cart quotes carry quantity per line in `lines` instead. */
  quantity?: number;
  /** Multi-line quotes (e.g. a whole cart) — when present, rendered instead of/alongside a single SKU. */
  lines?: QuoteLineSummary[];
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

function formatCartLines(payload: QuotePayload): string[] {
  if (!payload.lines || payload.lines.length === 0) return [];
  return [
    'Cart Lines:',
    ...payload.lines.flatMap((line) => {
      const price = line.unitPrice != null ? ` — $${line.unitPrice.toFixed(2)} each` : '';
      const header = `- ${line.label} (SKU ${line.sku}) x${line.quantity}${price}`;
      return line.note ? [header, `    ${line.note}`] : [header];
    }),
  ];
}

function formatAdvisoryLines(payload: QuotePayload): string[] {
  const lines: string[] = [];
  if (payload.dependencyNotes.length > 0) {
    lines.push('Dependency notes:', ...payload.dependencyNotes.map((note) => `- ${note}`));
  }
  if (payload.warningNotes.length > 0) {
    lines.push('Compatibility warnings:', ...payload.warningNotes.map((note) => `- ${note}`));
  }
  return lines;
}

export function buildQuoteEmailBody(payload: QuotePayload, referenceId: string): string {
  const { contact } = payload;
  const advisoryLines = formatAdvisoryLines(payload);
  const cartLines = formatCartLines(payload);
  const skuLine = payload.selectedSku || payload.skuPreview ? `SKU: ${payload.selectedSku || payload.skuPreview}` : null;
  return [
    `Reference: ${referenceId}`,
    `Product: ${payload.productTitle}`,
    skuLine,
    payload.quantity != null ? `Quantity: ${payload.quantity}` : null,
    payload.vehicleSummary ? `Vehicle: ${payload.vehicleSummary}` : null,
    '',
    ...formatOptionLines(payload),
    ...(cartLines.length > 0 ? ['', ...cartLines] : []),
    ...(advisoryLines.length > 0 ? ['', ...advisoryLines] : []),
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

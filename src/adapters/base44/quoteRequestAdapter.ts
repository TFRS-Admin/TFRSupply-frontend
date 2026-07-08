/**
 * adapters/base44/quoteRequestAdapter.ts
 * Delivery adapter for quote requests.
 *
 * This is the ONLY file that quoteRequestService.js imports for delivery.
 * Base44 removed: submission is now stubbed to log to the console until a
 * real Shopify-backed delivery mechanism replaces it.
 * To swap delivery: create a new adapter, update quoteRequestService.js import.
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

export interface QuoteSubmissionResult {
  success: boolean;
  referenceId?: string;
  savedRecord?: boolean;
  wasExisting?: boolean;
  error?: string;
}

function deriveReferenceId(submissionId: string): string {
  return `QR-${submissionId.slice(-6).toUpperCase()}`;
}

/**
 * Stub: logs the quote request to the console and returns a synthesized
 * reference ID. Replace with a real Shopify-backed adapter when the next
 * auth/commerce phase lands.
 *
 * @param payload — must include submissionId
 */
export async function submitViaBase44Email(payload: QuotePayload): Promise<QuoteSubmissionResult> {
  const referenceId = deriveReferenceId(payload.submissionId);
  console.log('[quoteRequestAdapter] Stub submission (Base44 removed, Shopify integration pending):', {
    referenceId,
    ...payload,
  });

  return { success: true, referenceId, savedRecord: false, wasExisting: false };
}

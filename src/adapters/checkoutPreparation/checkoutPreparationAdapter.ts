import type { CheckoutPayloadPreview, CheckoutPayloadPreviewLine } from '@/types';

export interface CheckoutPayloadPreviewInput {
  currencyCode: string;
  lines: CheckoutPayloadPreviewLine[];
}

/**
 * The typed boundary for building the checkout payload preview that would
 * eventually be sent to Shopify. checkoutPreparationService owns every
 * cart/configuration/package/pricing/commerce readiness decision itself
 * (reusing cartWorkspaceService and commerceService) — this adapter's only
 * job is translating already-ready lines into the preview shape, the same
 * request/response-translation role every adapter in this repository plays.
 */
export interface CheckoutPreparationAdapter {
  buildPayloadPreview(input: CheckoutPayloadPreviewInput): Promise<CheckoutPayloadPreview>;
}

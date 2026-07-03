import { money } from '@/domain/pricing';
import type { CheckoutPayloadPreview } from '@/types';
import type { CheckoutPreparationAdapter } from './checkoutPreparationAdapter';

/**
 * Explicit opt-out adapter, following the unavailableCartWorkspaceAdapter /
 * unavailableCommerceAdapter pattern — returns an empty payload preview for
 * callers that want to bypass the deterministic mock adapter.
 */
export const unavailableCheckoutPreparationAdapter: CheckoutPreparationAdapter = {
  async buildPayloadPreview({ currencyCode }): Promise<CheckoutPayloadPreview> {
    return {
      currencyCode,
      lines: [],
      estimatedTotal: money(0, currencyCode),
    };
  },
};

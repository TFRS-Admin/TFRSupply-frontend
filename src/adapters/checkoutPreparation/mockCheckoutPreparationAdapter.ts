import { addMoney, multiplyMoney } from '@/domain/pricing';
import type { CheckoutPayloadPreview } from '@/types';
import type { CheckoutPayloadPreviewInput, CheckoutPreparationAdapter } from './checkoutPreparationAdapter';

/**
 * Deterministic default adapter so /cart's Checkout Readiness panel works
 * out of the box, matching the mockCartWorkspaceAdapter pattern. It performs
 * no I/O and calls no Shopify API — it only totals the already-priced
 * variant mappings using the existing Live Pricing Engine money helpers.
 */
export const mockCheckoutPreparationAdapter: CheckoutPreparationAdapter = {
  async buildPayloadPreview({ currencyCode, lines }: CheckoutPayloadPreviewInput): Promise<CheckoutPayloadPreview> {
    const lineTotals = lines.map((line) => multiplyMoney(line.variantMapping.price, line.quantity, currencyCode));

    return {
      currencyCode,
      lines,
      estimatedTotal: addMoney(lineTotals, currencyCode),
    };
  },
};

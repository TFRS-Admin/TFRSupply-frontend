import { multiplyMoney } from '@/domain/pricing';
import type { CartLineInput, CartLineItem } from '@/types';
import type { CartWorkspaceAdapter } from './cartWorkspaceAdapter';
import { cartWorkspaceFixtureLines } from './cartWorkspaceFixtures';

function clone(line: CartLineItem): CartLineItem {
  return { ...line, image: line.image ? { ...line.image } : undefined, metadata: line.metadata ? { ...line.metadata } : undefined };
}

/**
 * Deterministic, process-local in-memory adapter. Seeded with the fixed
 * cartWorkspaceFixtureLines fixtures so the Cart Workspace route and Mini
 * Cart work out of the box, following the same "mock adapter wired in by
 * default" precedent as mockCustomerWorkspaceAdapter and
 * inMemoryQuoteBuilderAdapter. It does not persist across sessions or call
 * a real cart data source.
 */
export function createMockCartWorkspaceAdapter(seed: CartLineItem[] = cartWorkspaceFixtureLines): CartWorkspaceAdapter {
  let lines: CartLineItem[] = seed.map(clone);
  let counter = lines.length;

  return {
    async getLines() {
      return lines.map(clone);
    },

    async addLine(input: CartLineInput) {
      const existing = lines.find((line) => line.sku === input.sku && line.isPackage === Boolean(input.isPackage));
      if (existing) {
        const quantity = existing.quantity + input.quantity;
        existing.quantity = quantity;
        existing.lineTotal = multiplyMoney(existing.unitPrice, quantity, existing.unitPrice.currencyCode);
      } else {
        counter += 1;
        lines.push({
          id: `cart-line-${counter}`,
          productId: input.productId,
          sku: input.sku,
          label: input.label,
          image: input.image,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          lineTotal: multiplyMoney(input.unitPrice, input.quantity, input.unitPrice.currencyCode),
          availability: input.availability ?? 'unknown',
          configurationStatus: input.configurationStatus ?? 'not-required',
          isPackage: Boolean(input.isPackage),
          packageId: input.packageId,
          source: input.source,
          metadata: input.metadata,
        });
      }
      return lines.map(clone);
    },

    async updateQuantity(lineId: string, quantity: number) {
      const line = lines.find((candidate) => candidate.id === lineId);
      if (line) {
        line.quantity = quantity;
        line.lineTotal = multiplyMoney(line.unitPrice, quantity, line.unitPrice.currencyCode);
      }
      return lines.map(clone);
    },

    async removeLine(lineId: string) {
      lines = lines.filter((line) => line.id !== lineId);
      return lines.map(clone);
    },

    async clearCart() {
      lines = [];
      return lines.map(clone);
    },
  };
}

export const mockCartWorkspaceAdapter: CartWorkspaceAdapter = createMockCartWorkspaceAdapter();

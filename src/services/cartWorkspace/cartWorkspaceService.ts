import { mockCartWorkspaceAdapter, type CartWorkspaceAdapter } from '@/adapters/cartWorkspace';
import { addMoney } from '@/domain/pricing';
import { cartCheckoutPreparationResultSchema, cartLineInputSchema, cartStateSchema, cartValidationResultSchema } from '@/schemas/cartWorkspace.schema';
import { commerceService, type CommerceService } from '@/services/commerce';
import type {
  CartCheckoutLinePayload,
  CartCheckoutPreparationResult,
  CartLineInput,
  CartLineItem,
  CartState,
  CartSummary,
  CartValidationIssue,
  CartValidationResult,
} from '@/types';

export interface CartWorkspaceService {
  getState(): Promise<CartState>;
  addLine(input: CartLineInput): Promise<CartState>;
  updateQuantity(lineId: string, quantity: number): Promise<CartState>;
  removeLine(lineId: string): Promise<CartState>;
  clearCart(): Promise<CartState>;
  validateCart(lines: CartLineItem[]): CartValidationResult;
  buildSummary(lines: CartLineItem[]): CartSummary;
  prepareCheckout(): Promise<CartCheckoutPreparationResult>;
  subscribe(listener: () => void): () => void;
}

/**
 * Pure aggregation — sums already-priced cart lines using the existing Live
 * Pricing Engine money helpers (money/multiplyMoney/addMoney from
 * @/domain/pricing) rather than reimplementing currency arithmetic. Shipping
 * and tax are explicit placeholders (null) — this is not a shipping or tax
 * calculation, per the Cart Workspace Experience non-goals.
 */
export function buildCartSummary(lines: CartLineItem[]): CartSummary {
  const currencyCode = lines[0]?.unitPrice.currencyCode ?? 'USD';
  const subtotal = addMoney(lines.map((line) => line.lineTotal), currencyCode);
  const summary: CartSummary = {
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    lineCount: lines.length,
    currencyCode,
    subtotal,
    estimatedShipping: null,
    estimatedTax: null,
    grandTotalEstimate: subtotal,
  };
  return summary;
}

/**
 * Validates cart lines for display-level review flags. This does not
 * validate commerce/Shopify readiness — that is prepareCheckout()'s job via
 * the existing commerceService.
 */
export function validateCartLines(lines: CartLineItem[]): CartValidationResult {
  const issues: CartValidationIssue[] = [];

  for (const line of lines) {
    if (line.quantity < 1) {
      issues.push({ code: 'cart.invalid-quantity', severity: 'error', message: `Quantity for "${line.label}" must be at least 1.`, lineId: line.id, fieldPath: 'quantity' });
    }
    if (line.availability === 'unavailable') {
      issues.push({ code: 'cart.line-unavailable', severity: 'error', message: `"${line.label}" is currently unavailable.`, lineId: line.id, fieldPath: 'availability' });
    }
    if (line.availability === 'backorder') {
      issues.push({ code: 'cart.line-backorder', severity: 'warning', message: `"${line.label}" is on backorder.`, lineId: line.id, fieldPath: 'availability' });
    }
    if (line.configurationStatus === 'incomplete') {
      issues.push({ code: 'cart.configuration-incomplete', severity: 'warning', message: `"${line.label}" has an incomplete configuration.`, lineId: line.id, fieldPath: 'configurationStatus' });
    }
  }

  return cartValidationResultSchema.parse({ valid: issues.every((issue) => issue.severity !== 'error'), issues });
}

export function createCartWorkspaceService(
  adapter: CartWorkspaceAdapter = mockCartWorkspaceAdapter,
  commerce: CommerceService = commerceService,
): CartWorkspaceService {
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  async function toState(lines: CartLineItem[]): Promise<CartState> {
    return cartStateSchema.parse({ lines, summary: buildCartSummary(lines) });
  }

  return {
    async getState() {
      const lines = await adapter.getLines();
      return toState(lines);
    },

    async addLine(input) {
      const validated = cartLineInputSchema.parse(input);
      const lines = await adapter.addLine(validated);
      notify();
      return toState(lines);
    },

    async updateQuantity(lineId, quantity) {
      const lines = await adapter.updateQuantity(lineId, quantity);
      notify();
      return toState(lines);
    },

    async removeLine(lineId) {
      const lines = await adapter.removeLine(lineId);
      notify();
      return toState(lines);
    },

    async clearCart() {
      const lines = await adapter.clearCart();
      notify();
      return toState(lines);
    },

    validateCart(lines) {
      return validateCartLines(lines);
    },

    buildSummary(lines) {
      return buildCartSummary(lines);
    },

    /**
     * Composes the existing Commerce Foundation (commerceService.prepareCartLine)
     * per line to prepare a future Shopify checkout payload. No Shopify API is
     * called and no checkout is performed — commerceService's default adapter
     * is unavailable, so every line resolves to a pending/not-ready CartLineDraft
     * until a real commerce adapter is connected in a dedicated issue.
     */
    async prepareCheckout(): Promise<CartCheckoutPreparationResult> {
      const lines = await adapter.getLines();
      const validation = validateCartLines(lines);

      const linePayloads: CartCheckoutLinePayload[] = await Promise.all(
        lines.map(async (line): Promise<CartCheckoutLinePayload> => {
          const result = await commerce.prepareCartLine(line.sku, line.quantity);
          return {
            lineId: line.id,
            sku: line.sku,
            quantity: line.quantity,
            cartLineDraft: result.data,
            ready: result.status === 'ready',
            message: result.message,
          };
        }),
      );

      const status: CartCheckoutPreparationResult['status'] = lines.length === 0
        ? 'unavailable'
        : linePayloads.every((line) => line.ready)
          ? 'ready'
          : 'incomplete';

      return cartCheckoutPreparationResultSchema.parse({
        status,
        lines: linePayloads,
        summary: buildCartSummary(lines),
        issues: validation.issues,
      });
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const cartWorkspaceService: CartWorkspaceService = createCartWorkspaceService();

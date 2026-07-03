import { mockCheckoutPreparationAdapter, type CheckoutPreparationAdapter } from '@/adapters/checkoutPreparation';
import { checkoutPreparationRequestSchema, checkoutPreparationResultSchema } from '@/schemas/checkoutPreparation.schema';
import { cartWorkspaceService, type CartWorkspaceService } from '@/services/cartWorkspace';
import { commerceService, type CommerceService } from '@/services/commerce';
import type {
  CartLineDraft,
  CartLineItem,
  CheckoutBlocker,
  CheckoutLineReadiness,
  CheckoutLineValidation,
  CheckoutPayloadPreviewLine,
  CheckoutPreparationRequest,
  CheckoutPreparationResult,
  CheckoutWarning,
} from '@/types';

export interface CheckoutPreparationService {
  prepareCheckout(request?: CheckoutPreparationRequest): Promise<CheckoutPreparationResult>;
}

interface LineValidationOutcome {
  validation: CheckoutLineValidation;
  cartLineDraft: CartLineDraft | null;
}

/**
 * Validates a single cart line against every readiness dimension the
 * Checkout Preparation layer covers. Reuses existing contracts only —
 * cart-level severity comes from cartWorkspaceService.validateCart(),
 * configuration/package completeness comes from the CartLineItem contract
 * already populated by the Cart Workspace / Configurator / Package Builder
 * experiences, and commerce availability comes from the existing
 * commerceService.prepareCartLine() (Commerce Foundation). No pricing,
 * inventory, or Shopify logic is reimplemented here.
 */
async function validateLine(line: CartLineItem, cartIssues: { code: string; severity: string; message: string }[], commerce: CommerceService): Promise<LineValidationOutcome> {
  const blockers: CheckoutBlocker[] = [];
  const warnings: CheckoutWarning[] = [];

  for (const issue of cartIssues) {
    if (issue.severity === 'error') {
      blockers.push({ code: issue.code, category: 'cart', message: issue.message, lineId: line.id });
    } else if (issue.severity === 'warning') {
      warnings.push({ code: issue.code, category: 'cart', message: issue.message, lineId: line.id });
    }
  }
  const cartValid = !blockers.some((blocker) => blocker.category === 'cart');

  const configurationValid = line.configurationStatus !== 'incomplete';
  if (line.configurationStatus === 'incomplete') {
    blockers.push({ code: 'checkout.configuration-incomplete', category: 'configuration', message: `"${line.label}" has an incomplete configuration and cannot proceed to checkout.`, lineId: line.id });
  } else if (line.configurationStatus === 'unknown') {
    warnings.push({ code: 'checkout.configuration-unknown', category: 'configuration', message: `Configuration status for "${line.label}" could not be confirmed.`, lineId: line.id });
  }

  const packageValid = !(line.isPackage && !line.packageId);
  if (!packageValid) {
    blockers.push({ code: 'checkout.package-incomplete', category: 'package', message: `Package "${line.label}" is missing its package reference and cannot proceed to checkout.`, lineId: line.id });
  }

  const pricingAvailable = Boolean(line.unitPrice) && line.unitPrice.amount > 0;
  if (!pricingAvailable) {
    blockers.push({ code: 'checkout.pricing-unavailable', category: 'pricing', message: `No available price for "${line.label}".`, lineId: line.id });
  }

  const commerceResult = await commerce.prepareCartLine(line.sku, line.quantity);
  const commerceAvailable = commerceResult.status === 'ready' && Boolean(commerceResult.data);
  if (!commerceAvailable) {
    blockers.push({ code: 'checkout.commerce-unavailable', category: 'commerce', message: commerceResult.message ?? `"${line.label}" is not yet ready for Shopify checkout.`, lineId: line.id });
  }

  const readiness: CheckoutLineReadiness = blockers.length > 0 ? 'blocked' : warnings.length > 0 ? 'warning' : 'ready';

  return {
    validation: {
      lineId: line.id,
      sku: line.sku,
      cartValid,
      configurationValid,
      packageValid,
      pricingAvailable,
      commerceAvailable,
      readiness,
      blockers,
      warnings,
    },
    cartLineDraft: commerceResult.data,
  };
}

export function createCheckoutPreparationService(
  adapter: CheckoutPreparationAdapter = mockCheckoutPreparationAdapter,
  cartWorkspace: CartWorkspaceService = cartWorkspaceService,
  commerce: CommerceService = commerceService,
): CheckoutPreparationService {
  return {
    async prepareCheckout(request): Promise<CheckoutPreparationResult> {
      const parsedRequest = checkoutPreparationRequestSchema.parse(request ?? {});
      const lines = parsedRequest.lines ?? (await cartWorkspace.getState()).lines;

      const cartValidation = cartWorkspace.validateCart(lines);

      const blockers: CheckoutBlocker[] = [];
      const warnings: CheckoutWarning[] = [];

      if (lines.length === 0) {
        blockers.push({ code: 'checkout.cart-empty', category: 'cart', message: 'Your cart is empty — add an item before preparing checkout.' });
      }

      const outcomes = await Promise.all(
        lines.map((line) => validateLine(line, cartValidation.issues.filter((issue) => issue.lineId === line.id), commerce)),
      );

      for (const outcome of outcomes) {
        blockers.push(...outcome.validation.blockers);
        warnings.push(...outcome.validation.warnings);
      }

      const status = blockers.length === 0 ? 'ready' : 'blocked';

      let payloadPreview = null;
      if (status === 'ready') {
        const currencyCode = lines[0]?.unitPrice.currencyCode ?? 'USD';
        const previewLines: CheckoutPayloadPreviewLine[] = outcomes
          .filter((outcome) => outcome.cartLineDraft !== null)
          .map((outcome) => ({
            sku: outcome.cartLineDraft!.sku,
            quantity: outcome.cartLineDraft!.quantity,
            variantMapping: outcome.cartLineDraft!.variantMapping,
          }));
        payloadPreview = await adapter.buildPayloadPreview({ currencyCode, lines: previewLines });
      }

      return checkoutPreparationResultSchema.parse({
        status,
        cartValidation,
        lineValidations: outcomes.map((outcome) => outcome.validation),
        blockers,
        warnings,
        payloadPreview,
      });
    },
  };
}

export const checkoutPreparationService: CheckoutPreparationService = createCheckoutPreparationService();

import {
  liveShopifyCheckoutPreviewAdapter,
  mockShopifyCheckoutPreviewAdapter,
  unavailableShopifyCheckoutPreviewAdapter,
  type ShopifyCheckoutPreviewAdapter,
} from '@/adapters/shopifyCheckoutPreview';
import { shopifyCheckoutPreviewRequestSchema, shopifyCheckoutPreviewResultSchema } from '@/schemas/shopifyCheckoutPreview.schema';
import { cartWorkspaceService, type CartWorkspaceService } from '@/services/cartWorkspace';
import { checkoutPreparationService, type CheckoutPreparationService } from '@/services/checkoutPreparation';
import { shopifyStorefrontCartService, type ShopifyStorefrontCartService } from '@/services/shopifyStorefrontCart';
import type {
  CartLineItem,
  ShopifyCheckoutPreviewAdapterMode,
  ShopifyCheckoutPreviewBlocker,
  ShopifyCheckoutPreviewCapabilities,
  ShopifyCheckoutPreviewRequest,
  ShopifyCheckoutPreviewResult,
  ShopifyCheckoutPreviewStatus,
  ShopifyCheckoutPreviewWarning,
  ShopifyStorefrontClientConfig,
} from '@/types';

export interface ShopifyCheckoutPreviewService {
  buildRequest(lines?: CartLineItem[], overrides?: Partial<Omit<ShopifyCheckoutPreviewRequest, 'lines'>>): ShopifyCheckoutPreviewRequest;
  execute(request: ShopifyCheckoutPreviewRequest): Promise<ShopifyCheckoutPreviewResult>;
  previewCheckout(lines?: CartLineItem[], config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyCheckoutPreviewResult>;
  getCapabilities(): ShopifyCheckoutPreviewCapabilities;
}

let requestSequence = 0;

function nextRequestId(): string {
  requestSequence += 1;
  return `checkout-preview-request-${requestSequence}`;
}

function inferAdapterMode(adapter: ShopifyCheckoutPreviewAdapter): ShopifyCheckoutPreviewAdapterMode {
  if (adapter === mockShopifyCheckoutPreviewAdapter) return 'mock';
  if (adapter === liveShopifyCheckoutPreviewAdapter) return 'live';
  return 'unavailable';
}

/**
 * Combines the adapter's base status decision with the blockers this
 * service has already computed. A blocked outcome (missing/incomplete cart,
 * or a missing Storefront cart preview) always wins over whatever the
 * adapter itself would otherwise report, mirroring how
 * checkoutPreparationService forces status: 'blocked' whenever blockers
 * exist regardless of any single line's own readiness.
 */
function resolveStatus(adapterStatus: ShopifyCheckoutPreviewStatus, hasBlockers: boolean): ShopifyCheckoutPreviewStatus {
  if (adapterStatus === 'adapter-unavailable' || adapterStatus === 'failed') return adapterStatus;
  return hasBlockers ? 'blocked' : adapterStatus;
}

export function createShopifyCheckoutPreviewService(
  adapter: ShopifyCheckoutPreviewAdapter = unavailableShopifyCheckoutPreviewAdapter,
  cartWorkspace: CartWorkspaceService = cartWorkspaceService,
  checkoutPreparation: CheckoutPreparationService = checkoutPreparationService,
  storefrontCart: ShopifyStorefrontCartService = shopifyStorefrontCartService,
): ShopifyCheckoutPreviewService {
  const adapterMode = inferAdapterMode(adapter);

  function buildRequest(lines?: CartLineItem[], overrides?: Partial<Omit<ShopifyCheckoutPreviewRequest, 'lines'>>): ShopifyCheckoutPreviewRequest {
    const request: ShopifyCheckoutPreviewRequest = {
      requestId: overrides?.requestId ?? nextRequestId(),
      lines,
      config: overrides?.config,
      requestedAt: overrides?.requestedAt,
      metadata: overrides?.metadata,
    };
    return shopifyCheckoutPreviewRequestSchema.parse(request);
  }

  async function execute(request: ShopifyCheckoutPreviewRequest): Promise<ShopifyCheckoutPreviewResult> {
    const validated = shopifyCheckoutPreviewRequestSchema.parse(request);
    const lines = validated.lines ?? (await cartWorkspace.getState()).lines;

    const [preparationResult, storefrontCartResult] = await Promise.all([
      checkoutPreparation.prepareCheckout({ lines }),
      storefrontCart.previewCart(lines, validated.config),
    ]);

    const blockers: ShopifyCheckoutPreviewBlocker[] = [...preparationResult.blockers];
    const warnings: ShopifyCheckoutPreviewWarning[] = [...preparationResult.warnings];

    const storefrontCartAvailable = storefrontCartResult.status !== 'adapter-unavailable' && storefrontCartResult.checkoutPreview !== null;
    if (!storefrontCartAvailable) {
      blockers.push({
        code: 'checkout-preview.storefront-cart-unavailable',
        category: 'storefront',
        message: 'Shopify Storefront cart preview is not available; a checkout URL preview cannot be generated.',
      });
    }

    const hasBlockers = blockers.length > 0;

    const adapterOutput = await adapter.execute({
      requestId: validated.requestId,
      hasBlockers,
      storefrontCheckoutPreview: storefrontCartResult.checkoutPreview,
      config: validated.config,
    });

    const status = resolveStatus(adapterOutput.status, hasBlockers);

    return shopifyCheckoutPreviewResultSchema.parse({
      requestId: validated.requestId,
      status,
      adapterMode,
      urlPreview: status === 'preview-ready' ? adapterOutput.urlPreview : null,
      blockers,
      warnings,
      errors: adapterOutput.errors,
      checkoutRedirectDisabled: true,
      respondedAt: adapterOutput.respondedAt,
      metadata: { ...adapterOutput.metadata, source: 'shopifyCheckoutPreviewService', attributes: { ...adapterOutput.metadata?.attributes, adapterMode } },
    });
  }

  return {
    buildRequest,
    execute,

    /**
     * Convenience entry point for the /cart Checkout Readiness panel: reads
     * the live Cart Workspace state when no explicit lines are supplied,
     * builds a request, and executes it. Never calls Shopify by default
     * because the default adapter is unavailableShopifyCheckoutPreviewAdapter.
     */
    async previewCheckout(lines, config) {
      const request = buildRequest(lines, { config });
      return execute(request);
    },

    getCapabilities(): ShopifyCheckoutPreviewCapabilities {
      return {
        dryRunOnly: true,
        liveCallsEnabled: false,
        checkoutRedirectDisabled: true,
        adapterMode,
      };
    },
  };
}

export const shopifyCheckoutPreviewService: ShopifyCheckoutPreviewService = createShopifyCheckoutPreviewService();

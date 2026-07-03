import { liveShopifyStorefrontCartAdapter, mockShopifyStorefrontCartAdapter, unavailableShopifyStorefrontCartAdapter, type ShopifyStorefrontCartAdapter } from '@/adapters/shopifyStorefrontCart';
import { addMoney } from '@/domain/pricing';
import { shopifyStorefrontCartRequestSchema, shopifyStorefrontCartResultSchema } from '@/schemas/shopifyStorefrontCart.schema';
import { cartWorkspaceService, type CartWorkspaceService } from '@/services/cartWorkspace';
import { commerceService, type CommerceService } from '@/services/commerce';
import type {
  CartLineItem,
  ShopifyStorefrontCartAdapterMode,
  ShopifyStorefrontCartCapabilities,
  ShopifyStorefrontCartLine,
  ShopifyStorefrontCartMutationPreview,
  ShopifyStorefrontCartRequest,
  ShopifyStorefrontCartResult,
  ShopifyStorefrontClientConfig,
} from '@/types';

export interface ShopifyStorefrontCartService {
  buildRequest(lines: CartLineItem[], overrides?: Partial<Omit<ShopifyStorefrontCartRequest, 'lines' | 'dryRun'>>): ShopifyStorefrontCartRequest;
  execute(request: ShopifyStorefrontCartRequest): Promise<ShopifyStorefrontCartResult>;
  previewCart(lines?: CartLineItem[], config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontCartResult>;
  getCapabilities(): ShopifyStorefrontCartCapabilities;
}

let requestSequence = 0;

function nextRequestId(): string {
  requestSequence += 1;
  return `storefront-cart-request-${requestSequence}`;
}

function inferAdapterMode(adapter: ShopifyStorefrontCartAdapter): ShopifyStorefrontCartAdapterMode {
  if (adapter === mockShopifyStorefrontCartAdapter) return 'mock';
  if (adapter === liveShopifyStorefrontCartAdapter) return 'live';
  return 'unavailable';
}

/**
 * Maps a single Cart Workspace line to a ShopifyStorefrontCartLine by
 * reusing the existing Commerce Foundation (commerceService.prepareCartLine),
 * the same call cartWorkspaceService.prepareCheckout() and
 * checkoutPreparationService already make. No commerce lookup logic is
 * reimplemented here.
 */
async function mapCartLine(line: CartLineItem, commerce: CommerceService): Promise<ShopifyStorefrontCartLine> {
  const result = await commerce.prepareCartLine(line.sku, line.quantity);
  const variantMapping = result.status === 'ready' ? result.data?.variantMapping : null;
  const merchandiseId = variantMapping?.shopifyVariantGid ?? variantMapping?.shopifyVariantId ?? null;

  return {
    cartLineId: line.id,
    sku: line.sku,
    quantity: line.quantity,
    merchandiseId,
    merchandiseAvailable: Boolean(merchandiseId),
    attributes: line.packageId ? { packageId: line.packageId } : undefined,
  };
}

/**
 * Builds the Storefront cart mutation preview — the exact GraphQL
 * operation/variables shape a real cartLinesAdd mutation would send. This is
 * a pure string/object builder; it performs no network I/O.
 */
function buildCartMutationPreview(cartLines: ShopifyStorefrontCartLine[]): ShopifyStorefrontCartMutationPreview {
  return {
    operationName: 'CartLinesAddPreview',
    query: 'mutation CartLinesAddPreview($lines: [CartLineInput!]!) { cartLinesAdd(lines: $lines) { cart { id checkoutUrl } userErrors { field message } } }',
    variables: {
      lines: cartLines.map((line) => ({ merchandiseId: line.merchandiseId, quantity: line.quantity })),
    },
  };
}

export function createShopifyStorefrontCartService(
  adapter: ShopifyStorefrontCartAdapter = unavailableShopifyStorefrontCartAdapter,
  cartWorkspace: CartWorkspaceService = cartWorkspaceService,
  commerce: CommerceService = commerceService,
): ShopifyStorefrontCartService {
  const adapterMode = inferAdapterMode(adapter);

  function buildRequest(lines: CartLineItem[], overrides?: Partial<Omit<ShopifyStorefrontCartRequest, 'lines' | 'dryRun'>>): ShopifyStorefrontCartRequest {
    const request: ShopifyStorefrontCartRequest = {
      requestId: overrides?.requestId ?? nextRequestId(),
      dryRun: true,
      lines,
      config: overrides?.config,
      requestedAt: overrides?.requestedAt,
      metadata: overrides?.metadata,
    };
    return shopifyStorefrontCartRequestSchema.parse(request);
  }

  async function execute(request: ShopifyStorefrontCartRequest): Promise<ShopifyStorefrontCartResult> {
    const validated = shopifyStorefrontCartRequestSchema.parse(request);
    const cartLines = await Promise.all(validated.lines.map((line) => mapCartLine(line, commerce)));
    const mutationPreview = buildCartMutationPreview(cartLines);
    const currencyCode = validated.lines[0]?.unitPrice.currencyCode ?? 'USD';
    const estimatedTotal = addMoney(validated.lines.map((line) => line.lineTotal), currencyCode);

    const result = await adapter.execute({
      requestId: validated.requestId,
      cartLines,
      mutationPreview,
      currencyCode,
      estimatedTotal,
      config: validated.config,
    });

    return shopifyStorefrontCartResultSchema.parse({
      ...result,
      metadata: { ...result.metadata, source: 'shopifyStorefrontCartService', attributes: { ...result.metadata?.attributes, adapterMode } },
    });
  }

  return {
    buildRequest,
    execute,

    /**
     * Convenience entry point for the /cart Checkout Readiness panel: reads
     * the live Cart Workspace state when no explicit lines are supplied,
     * builds a request, and executes it. Never calls Shopify by default
     * because the default adapter is unavailableShopifyStorefrontCartAdapter.
     */
    async previewCart(lines, config) {
      const resolvedLines = lines ?? (await cartWorkspace.getState()).lines;
      const request = buildRequest(resolvedLines, { config });
      return execute(request);
    },

    getCapabilities(): ShopifyStorefrontCartCapabilities {
      return {
        dryRunOnly: true,
        liveCallsEnabled: false,
        adapterMode,
      };
    },
  };
}

export const shopifyStorefrontCartService: ShopifyStorefrontCartService = createShopifyStorefrontCartService();

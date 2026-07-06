import {
  createLiveShopifyStorefrontCartAdapter,
  mockShopifyStorefrontCartAdapter,
  unavailableShopifyStorefrontCartAdapter,
  type ShopifyStorefrontCartAdapter,
} from '@/adapters/shopifyStorefrontCart';
import { cartAdapterStatusSnapshotSchema } from '@/schemas/cartAdapter.schema';
import { cartWorkspaceService, type CartWorkspaceService } from '@/services/cartWorkspace';
import type { CommerceService } from '@/services/commerce';
import { shopifyStorefrontConfigService } from '@/services/shopifyStorefrontConfig';
import { createShopifyStorefrontCartService, type ShopifyStorefrontCartService } from '@/services/shopifyStorefrontCart';
import { shopifyVariantResolverCommerceService } from '@/services/shopifyVariantResolver';
import type {
  CartAdapterDiagnostic,
  CartAdapterMode,
  CartAdapterStatusSnapshot,
  CartLineItem,
  CartMappingIssue,
  CartMappingValidationResult,
  ShopifyStorefrontCartCapabilities,
  ShopifyStorefrontCartLine,
  ShopifyStorefrontCartResult,
  ShopifyStorefrontClientConfig,
} from '@/types';

const LIVE_CONFIG_INCOMPLETE_MESSAGE =
  'Live cart adapter requires both a store domain and a Storefront access token; falling back to the unavailable adapter.';

/**
 * Resolves the starting mode from the same frontend-safe Storefront env
 * variables catalogAdapterService reads (VITE_SHOPIFY_STOREFRONT_ENABLED,
 * VITE_SHOPIFY_STORE_DOMAIN, VITE_SHOPIFY_STOREFRONT_API_VERSION), via
 * shopifyStorefrontConfigService — reusing it introduces no module cycle
 * here (unlike catalogAdapterService, this module is not on
 * shopifyStorefrontConfigService's import chain).
 */
function resolveInitialMode(): CartAdapterMode {
  const env = shopifyStorefrontConfigService.readEnvironmentConfig();
  if (!env.storefrontEnabled) return 'mock';
  return env.storeDomain && env.apiVersion ? 'unavailable' : 'mock';
}

function adapterForMode(mode: CartAdapterMode): ShopifyStorefrontCartAdapter {
  return mode === 'mock' ? mockShopifyStorefrontCartAdapter : unavailableShopifyStorefrontCartAdapter;
}

/**
 * Cart line mapping validation: every ShopifyStorefrontCartLine the last
 * preview produced is checked for a resolved merchandiseId — the same flag
 * shopifyStorefrontCartService already computes per line via the Commerce
 * Foundation. This does not re-derive mapping; it only summarizes it.
 */
function validateMapping(cartLines: ShopifyStorefrontCartLine[]): CartMappingValidationResult {
  const issues: CartMappingIssue[] = [];
  for (const line of cartLines) {
    if (!line.merchandiseAvailable || !line.merchandiseId) {
      issues.push({
        cartLineId: line.cartLineId,
        sku: line.sku,
        reason: 'No Shopify variant is mapped for this SKU; the Commerce Foundation has not resolved a merchandiseId.',
      });
    }
  }
  return {
    totalLineCount: cartLines.length,
    mappedLineCount: cartLines.length - issues.length,
    unmappedLineCount: issues.length,
    issues,
  };
}

function buildDiagnostics(
  mode: CartAdapterMode,
  mappingValidation: CartMappingValidationResult | null,
  fallbackReason: string | undefined,
): CartAdapterDiagnostic[] {
  const diagnostics: CartAdapterDiagnostic[] = [
    { code: 'adapter-mode', level: 'info', message: `Cart adapter mode: ${mode}.` },
    mode === 'live'
      ? {
          code: 'live-calls-disabled',
          level: 'warning',
          message: 'Live adapter active: previewMutation() now performs a real Shopify Storefront cartCreate call against the configured store and will create a real cart.',
        }
      : {
          code: 'live-calls-disabled',
          level: 'info',
          message: 'Live Shopify Storefront cart mutations are disabled in this adapter mode; this foundation only ever dry-runs or reports adapter-unavailable.',
        },
  ];

  if (fallbackReason) {
    diagnostics.push({ code: 'live-config-incomplete', level: 'warning', message: fallbackReason });
  }

  if (mappingValidation) {
    if (mappingValidation.totalLineCount === 0) {
      diagnostics.push({ code: 'empty-cart', level: 'info', message: 'Cart Workspace has no lines to preview.' });
    } else if (mappingValidation.unmappedLineCount > 0) {
      diagnostics.push({
        code: 'unmapped-merchandise',
        level: 'warning',
        message: `${mappingValidation.unmappedLineCount} of ${mappingValidation.totalLineCount} cart line(s) are missing a Shopify merchandise ID.`,
      });
    }
  }

  return diagnostics;
}

export interface CartAdapterService {
  getMode(): CartAdapterMode;
  configureLiveAdapter(config: Partial<ShopifyStorefrontClientConfig>): void;
  resetToDefaultAdapter(): void;
  previewMutation(lines?: CartLineItem[], config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontCartResult>;
  getStatus(): CartAdapterStatusSnapshot;
  getCapabilities(): ShopifyStorefrontCartCapabilities;
}

/**
 * Owns runtime Shopify Storefront Cart Adapter selection, cart mutation
 * request previews, cart line mapping validation, and cart mutation
 * diagnostics for the /dev/storefront dashboard and the /cart Checkout
 * Readiness panel. It never bypasses shopifyStorefrontCartService — every
 * preview is built by reconstructing that existing factory with whichever
 * ShopifyStorefrontCartAdapter is currently selected, so cart-line mapping,
 * mutation-preview generation, and checkout-preview metadata are never
 * reimplemented here.
 *
 * The default mode mirrors catalogAdapterService: 'mock' unless the
 * Storefront Runtime Configuration foundation reports the Storefront API
 * enabled and configured, in which case it starts 'unavailable' — opted in,
 * but requiring an explicit configureLiveAdapter() call before 'live' is
 * ever selected. 'live' still never performs a real Storefront API call:
 * liveShopifyStorefrontCartAdapter remains a request-building stub (see
 * SHOPIFY_STOREFRONT_CART_ADAPTER.md's "Future live implementation plan").
 */
export function createCartAdapterService(
  cartWorkspace: CartWorkspaceService = cartWorkspaceService,
  commerce: Pick<CommerceService, 'prepareCartLine'> = shopifyVariantResolverCommerceService,
): CartAdapterService {
  let mode: CartAdapterMode = resolveInitialMode();
  let activeAdapter: ShopifyStorefrontCartAdapter = adapterForMode(mode);
  let cartService: ShopifyStorefrontCartService = createShopifyStorefrontCartService(activeAdapter, cartWorkspace, commerce);
  let fallbackReason: string | undefined;
  let lastPreview: ShopifyStorefrontCartResult | null = null;
  let lastPreviewedAt: string | null = null;

  function rebuildCartService(): void {
    cartService = createShopifyStorefrontCartService(activeAdapter, cartWorkspace, commerce);
    lastPreview = null;
    lastPreviewedAt = null;
  }

  function getMode(): CartAdapterMode {
    return mode;
  }

  /**
   * Selects the live-capable adapter only when both a store domain and a
   * Storefront access token are supplied. An incomplete config never
   * silently reports 'live' — it falls back to the unavailable adapter and
   * records why, the same graceful-fallback contract catalogAdapterService
   * guarantees for its own live activation path.
   */
  function configureLiveAdapter(config: Partial<ShopifyStorefrontClientConfig>): void {
    const hasMinimalConfig = Boolean(config?.storeDomain && config?.storefrontAccessToken);
    if (!hasMinimalConfig) {
      mode = 'unavailable';
      activeAdapter = unavailableShopifyStorefrontCartAdapter;
      fallbackReason = LIVE_CONFIG_INCOMPLETE_MESSAGE;
    } else {
      mode = 'live';
      activeAdapter = createLiveShopifyStorefrontCartAdapter(config);
      fallbackReason = undefined;
    }
    rebuildCartService();
  }

  function resetToDefaultAdapter(): void {
    mode = resolveInitialMode();
    activeAdapter = adapterForMode(mode);
    fallbackReason = undefined;
    rebuildCartService();
  }

  async function previewMutation(lines?: CartLineItem[], config?: Partial<ShopifyStorefrontClientConfig>): Promise<ShopifyStorefrontCartResult> {
    const result = await cartService.previewCart(lines, config);
    lastPreview = result;
    lastPreviewedAt = new Date().toISOString();
    return result;
  }

  function getStatus(): CartAdapterStatusSnapshot {
    const mappingValidation = lastPreview ? validateMapping(lastPreview.cartLines) : null;
    const snapshot: CartAdapterStatusSnapshot = {
      adapterMode: mode,
      lastPreview,
      lastPreviewedAt,
      mappingValidation,
      diagnostics: buildDiagnostics(mode, mappingValidation, fallbackReason),
      usedFallback: Boolean(fallbackReason),
      fallbackReason,
    };
    return cartAdapterStatusSnapshotSchema.parse(snapshot);
  }

  function getCapabilities(): ShopifyStorefrontCartCapabilities {
    return { dryRunOnly: true, liveCallsEnabled: false, adapterMode: mode };
  }

  return {
    getMode,
    configureLiveAdapter,
    resetToDefaultAdapter,
    previewMutation,
    getStatus,
    getCapabilities,
  };
}

export const cartAdapterService: CartAdapterService = createCartAdapterService();

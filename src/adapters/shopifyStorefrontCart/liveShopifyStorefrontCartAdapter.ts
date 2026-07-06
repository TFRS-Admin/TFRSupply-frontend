import { buildStorefrontFetchRequest } from '@/adapters/shopifyStorefront';
import type {
  ShopifyStorefrontCartError,
  ShopifyStorefrontCartLine,
  ShopifyStorefrontCartMutationPreview,
  ShopifyStorefrontCartResult,
  ShopifyStorefrontClientConfig,
} from '@/types';
import type { ShopifyStorefrontCartAdapter } from './shopifyStorefrontCartAdapter';

export type ShopifyStorefrontCartFetchImpl = typeof fetch;

const CART_CREATE_OPERATION_NAME = 'CartCreate';
const CART_CREATE_QUERY = `mutation CartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}`;

interface CartCreatePayload {
  data?: {
    cartCreate?: {
      cart?: { id?: string; checkoutUrl?: string } | null;
      userErrors?: Array<{ field?: string[]; message: string }>;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

function isConfigured(config?: Partial<ShopifyStorefrontClientConfig>): boolean {
  return Boolean(config?.storeDomain && config?.storefrontAccessToken);
}

function toCartLineInput(line: ShopifyStorefrontCartLine & { merchandiseId: string }): Record<string, unknown> {
  const input: Record<string, unknown> = { merchandiseId: line.merchandiseId, quantity: line.quantity };
  if (line.attributes) {
    input.attributes = Object.entries(line.attributes).map(([key, value]) => ({ key, value }));
  }
  return input;
}

/**
 * Builds the real cartCreate mutation for an already-mapped set of cart
 * lines. This is deliberately cartCreate rather than the cartLinesAdd
 * preview shopifyStorefrontCartService's dry-run/mock/unavailable path
 * builds: there is no existing Shopify cart ID anywhere in Cart Workspace
 * state, so every real cart is created fresh from the current lines (see
 * SHOPIFY_STOREFRONT_CART_ADAPTER.md's "Future live implementation plan").
 * Lines without a resolved merchandiseId are omitted — Shopify's CartInput
 * requires a merchandiseId per line.
 */
export function buildCartCreateMutationPreview(cartLines: ShopifyStorefrontCartLine[]): ShopifyStorefrontCartMutationPreview {
  const mappableLines = cartLines.filter((line): line is ShopifyStorefrontCartLine & { merchandiseId: string } => Boolean(line.merchandiseId));
  return {
    operationName: CART_CREATE_OPERATION_NAME,
    query: CART_CREATE_QUERY,
    variables: { input: { lines: mappableLines.map(toCartLineInput) } },
  };
}

function networkError(reason: unknown): ShopifyStorefrontCartError {
  const message = reason instanceof Error ? reason.message : 'Unknown network error contacting the Shopify Storefront API.';
  return { code: 'network-error', message, retryable: true };
}

/**
 * The live Shopify Storefront Cart Adapter: performs a real fetch() against
 * the Storefront GraphQL endpoint's cartCreate mutation when both a store
 * domain and a Storefront access token are configured, following the same
 * request-building (buildStorefrontFetchRequest), fetchImpl-injection, and
 * no-throw failure-mapping pattern createLiveShopifyStorefrontCatalogAdapter
 * already established. Every failure mode — missing config, network error,
 * a non-2xx response, top-level GraphQL errors, Shopify userErrors, or a
 * malformed success payload — resolves to a `failed`
 * ShopifyStorefrontCartResult instead of throwing, so callers always fail
 * gracefully. checkoutUrlPreview/cartId on a `succeeded` result are the
 * real Shopify cart ID and checkout URL Shopify returned — never a
 * fabricated value.
 */
export function createLiveShopifyStorefrontCartAdapter(
  defaultConfig?: Partial<ShopifyStorefrontClientConfig>,
  fetchImpl: ShopifyStorefrontCartFetchImpl = fetch,
): ShopifyStorefrontCartAdapter {
  return {
    async execute(input): Promise<ShopifyStorefrontCartResult> {
      const config = { ...defaultConfig, ...input.config };
      const respondedAt = new Date().toISOString();
      const mutationPreview = buildCartCreateMutationPreview(input.cartLines);
      const baseResult = {
        requestId: input.requestId,
        cartLines: input.cartLines,
        lineCount: input.cartLines.length,
        mutationPreview,
        checkoutPreview: null,
        respondedAt,
      };

      if (!isConfigured(config)) {
        return {
          ...baseResult,
          status: 'failed',
          errors: [{
            code: 'configuration-error',
            message: 'Live Shopify Storefront cart creation requires both a store domain (VITE_SHOPIFY_STORE_DOMAIN) and a Storefront access token (VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN); no fetch was attempted.',
            retryable: false,
          }],
          metadata: { source: 'live-shopify-storefront-cart-adapter', attributes: { configured: false } },
        };
      }

      const fetchRequest = buildStorefrontFetchRequest(
        { operationName: mutationPreview.operationName, query: mutationPreview.query, variables: mutationPreview.variables },
        config,
      );
      const metadata = { source: 'live-shopify-storefront-cart-adapter', attributes: { requestUrl: fetchRequest.url, configured: true } };

      let response: Response;
      try {
        response = await fetchImpl(fetchRequest.url, { method: fetchRequest.method, headers: fetchRequest.headers, body: fetchRequest.body });
      } catch (reason) {
        return { ...baseResult, status: 'failed', errors: [networkError(reason)], metadata };
      }

      if (!response.ok) {
        return {
          ...baseResult,
          status: 'failed',
          errors: [{ code: 'network-error', message: `Shopify Storefront API responded with HTTP ${response.status}.`, retryable: true }],
          metadata,
        };
      }

      const json = (await response.json()) as CartCreatePayload;

      if (json.errors && json.errors.length > 0) {
        return {
          ...baseResult,
          status: 'failed',
          errors: json.errors.map((error) => ({ code: 'shopify-error' as const, message: error.message, retryable: false })),
          metadata,
        };
      }

      const userErrors = json.data?.cartCreate?.userErrors ?? [];
      if (userErrors.length > 0) {
        return {
          ...baseResult,
          status: 'failed',
          errors: userErrors.map((error) => ({ code: 'shopify-error' as const, message: error.message, fieldPath: error.field?.join('.'), retryable: false })),
          metadata,
        };
      }

      const cart = json.data?.cartCreate?.cart;
      if (!cart?.id || !cart?.checkoutUrl) {
        return {
          ...baseResult,
          status: 'failed',
          errors: [{ code: 'shopify-error', message: 'Shopify Storefront API did not return a cart id and checkoutUrl.', retryable: true }],
          metadata,
        };
      }

      return {
        ...baseResult,
        status: 'succeeded',
        checkoutPreview: {
          checkoutUrlPreview: cart.checkoutUrl,
          cartId: cart.id,
          currencyCode: input.currencyCode,
          estimatedTotal: input.estimatedTotal,
          lineCount: input.cartLines.length,
          ready: true,
        },
        errors: [],
        metadata,
      };
    },
  };
}

export const liveShopifyStorefrontCartAdapter: ShopifyStorefrontCartAdapter = createLiveShopifyStorefrontCartAdapter();

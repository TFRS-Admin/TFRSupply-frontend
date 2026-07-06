import { createLiveShopifyStorefrontCartAdapter, type ShopifyStorefrontCartFetchImpl } from '@/adapters/shopifyStorefrontCart';
import { cartWorkspaceService, type CartWorkspaceService } from '@/services/cartWorkspace';
import type { CommerceService } from '@/services/commerce';
import { shopifyVariantResolverCommerceService } from '@/services/shopifyVariantResolver';
import { createShopifyStorefrontCartService } from './shopifyStorefrontCartService';
import type { CartLineItem, ShopifyStorefrontCartResult } from '@/types';

const DEFAULT_API_VERSION = '2024-10';

export interface ShopifyStorefrontCartCredentials {
  storeDomain: string | null;
  storefrontAccessToken: string | null;
  apiVersion: string;
}

function readStringEnv(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Reads the two env vars real Shopify cart creation requires
 * (VITE_SHOPIFY_STORE_DOMAIN, VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN), plus
 * the existing optional API version override. Unlike
 * shopifyStorefrontConfigService.readEnvironmentConfig(), this deliberately
 * does read the Storefront access token: it is Shopify's public Storefront
 * API token (designed to ship inside a client bundle), not the private
 * Admin API secret shopifyStorefrontConfigService's non-goal refers to.
 */
export function readCartCreateCredentials(
  env: Record<string, unknown> = (import.meta as unknown as { env: Record<string, unknown> }).env ?? {},
): ShopifyStorefrontCartCredentials {
  return {
    storeDomain: readStringEnv(env.VITE_SHOPIFY_STORE_DOMAIN),
    storefrontAccessToken: readStringEnv(env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN),
    apiVersion: readStringEnv(env.VITE_SHOPIFY_STOREFRONT_API_VERSION) ?? DEFAULT_API_VERSION,
  };
}

export interface CreateShopifyStorefrontCartOptions {
  credentials?: ShopifyStorefrontCartCredentials;
  fetchImpl?: ShopifyStorefrontCartFetchImpl;
}

export interface ShopifyStorefrontCartCreateService {
  isConfigured(credentials?: ShopifyStorefrontCartCredentials): boolean;
  createCart(lines?: CartLineItem[], options?: CreateShopifyStorefrontCartOptions): Promise<ShopifyStorefrontCartResult>;
}

/**
 * Creates a real Shopify cart (Storefront API cartCreate) from the Cart
 * Workspace's current lines, resolving each line's Shopify Variant GID via
 * the existing Commerce Foundation exactly as shopifyStorefrontCartService
 * already does for its dry-run preview. This reuses that service's factory
 * and createLiveShopifyStorefrontCartAdapter rather than duplicating
 * cart-line mapping, mutation-preview, or request-building logic — the only
 * new responsibility here is resolving credentials (from env by default)
 * and constructing the live adapter with them.
 *
 * Missing credentials are never a thrown error: the live adapter's own
 * configuration gate reports a graceful `failed`/`configuration-error`
 * ShopifyStorefrontCartResult instead, exactly as it does for any other
 * live-call failure.
 */
export function createShopifyStorefrontCartCreateService(
  cartWorkspace: CartWorkspaceService = cartWorkspaceService,
  commerce: Pick<CommerceService, 'prepareCartLine'> = shopifyVariantResolverCommerceService,
): ShopifyStorefrontCartCreateService {
  function isConfigured(credentials: ShopifyStorefrontCartCredentials = readCartCreateCredentials()): boolean {
    return Boolean(credentials.storeDomain && credentials.storefrontAccessToken);
  }

  async function createCart(lines?: CartLineItem[], options: CreateShopifyStorefrontCartOptions = {}): Promise<ShopifyStorefrontCartResult> {
    const credentials = options.credentials ?? readCartCreateCredentials();
    const liveAdapter = createLiveShopifyStorefrontCartAdapter(
      {
        storeDomain: credentials.storeDomain ?? undefined,
        apiVersion: credentials.apiVersion,
        storefrontAccessToken: credentials.storefrontAccessToken ?? undefined,
      },
      options.fetchImpl,
    );
    const cartService = createShopifyStorefrontCartService(liveAdapter, cartWorkspace, commerce);
    return cartService.previewCart(lines);
  }

  return { isConfigured, createCart };
}

export const shopifyStorefrontCartCreateService: ShopifyStorefrontCartCreateService = createShopifyStorefrontCartCreateService();

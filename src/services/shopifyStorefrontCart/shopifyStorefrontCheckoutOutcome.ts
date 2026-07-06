import type { ShopifyStorefrontCartResult } from '@/types';

export type ShopifyCheckoutOutcome =
  | { type: 'redirect'; checkoutUrl: string }
  | { type: 'configuration-error'; message: string }
  | { type: 'shopify-error'; message: string }
  | { type: 'network-error'; message: string }
  | { type: 'error'; message: string };

const CONFIGURATION_ERROR_MESSAGE =
  'Checkout is unavailable — Shopify Storefront is not configured. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN and try again.';

/**
 * Decides what the /cart "Proceed to Checkout" button should do with a
 * ShopifyStorefrontCartResult from shopifyStorefrontCartCreateService.createCart():
 * redirect to the real checkoutUrl Shopify returned on success, or surface a
 * specific, readable message for each known failure mode. Pure and
 * side-effect free (no DOM/window access) so it can be unit tested without
 * simulating a button click.
 */
export function resolveShopifyCheckoutOutcome(result: ShopifyStorefrontCartResult): ShopifyCheckoutOutcome {
  if (result.status === 'succeeded' && result.checkoutPreview?.checkoutUrlPreview) {
    return { type: 'redirect', checkoutUrl: result.checkoutPreview.checkoutUrlPreview };
  }

  const error = result.errors[0];
  if (error?.code === 'configuration-error') {
    return { type: 'configuration-error', message: CONFIGURATION_ERROR_MESSAGE };
  }
  if (error?.code === 'shopify-error') {
    return { type: 'shopify-error', message: `Shopify could not create your cart: ${error.message}` };
  }
  if (error?.code === 'network-error') {
    return { type: 'network-error', message: `Checkout failed due to a network error contacting Shopify: ${error.message}` };
  }

  return { type: 'error', message: error?.message ?? 'Checkout failed. Please try again.' };
}

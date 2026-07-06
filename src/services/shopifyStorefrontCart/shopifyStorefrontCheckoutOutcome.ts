import type { ShopifyStorefrontCartResult } from '@/types';

export type ShopifyCheckoutOutcome =
  | { type: 'redirect'; checkoutUrl: string; warning?: string }
  | { type: 'no-valid-lines'; message: string }
  | { type: 'configuration-error'; message: string }
  | { type: 'shopify-error'; message: string }
  | { type: 'network-error'; message: string }
  | { type: 'error'; message: string };

const CONFIGURATION_ERROR_MESSAGE =
  'Checkout is unavailable — Shopify Storefront is not configured. Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN and try again.';

const NO_VALID_LINES_MESSAGE =
  "The items in your cart aren't checkout-ready yet — none of them have a matching Shopify product. Please review your cart before checking out.";

function describeDroppedLines(count: number): string {
  const itemWord = count === 1 ? 'item' : 'items';
  const verb = count === 1 ? "isn't" : "aren't";
  return `${count} ${itemWord} in your cart ${verb} checkout-ready yet and ${count === 1 ? 'was' : 'were'} left out of your Shopify order. Please review your cart.`;
}

/**
 * Decides what the /cart "Proceed to Checkout" button should do with a
 * ShopifyStorefrontCartResult from shopifyStorefrontCartCreateService.createCart():
 * redirect to the real checkoutUrl Shopify returned on success (with a
 * warning if some — but not all — lines were dropped for lacking a
 * resolved Shopify Variant GID), or surface a specific, readable message
 * for each known failure mode, including the Checkout Safety gate
 * (`unmapped-line`) that fires when not one cart line is checkout-ready.
 * Pure and side-effect free (no DOM/window access) so it can be unit
 * tested without simulating a button click.
 */
export function resolveShopifyCheckoutOutcome(result: ShopifyStorefrontCartResult): ShopifyCheckoutOutcome {
  if (result.status === 'succeeded' && result.checkoutPreview?.checkoutUrlPreview) {
    const droppedLineCount = result.cartLines.filter((line) => !line.merchandiseId).length;
    return droppedLineCount > 0
      ? { type: 'redirect', checkoutUrl: result.checkoutPreview.checkoutUrlPreview, warning: describeDroppedLines(droppedLineCount) }
      : { type: 'redirect', checkoutUrl: result.checkoutPreview.checkoutUrlPreview };
  }

  const error = result.errors[0];
  if (error?.code === 'unmapped-line') {
    return { type: 'no-valid-lines', message: NO_VALID_LINES_MESSAGE };
  }
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

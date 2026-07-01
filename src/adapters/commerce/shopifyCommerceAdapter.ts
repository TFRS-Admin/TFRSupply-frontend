import { unavailableCommerceAdapter } from './commerceAdapter';
import type { CommerceAdapter } from './commerceAdapter';

/**
 * Placeholder Shopify commerce adapter boundary.
 *
 * This intentionally does not call Shopify APIs. Future Shopify integration should
 * replace this factory with a concrete adapter that validates API responses with
 * the commerce Zod schemas before returning domain types.
 */
export function createShopifyCommerceAdapter(): CommerceAdapter {
  return unavailableCommerceAdapter;
}

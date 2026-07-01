import { unavailableCommerceAdapter } from '@/adapters/commerce';
import type { CommerceAdapter } from '@/adapters/commerce';
import type { CartLineDraft, CommerceLookupResult, ShopifyProduct, ShopifyVariant, VariantMapping } from '@/types';

export interface CommerceService {
  getShopifyProduct(productId: string): Promise<CommerceLookupResult<ShopifyProduct>>;
  getShopifyVariant(sku: string): Promise<CommerceLookupResult<ShopifyVariant>>;
  getVariantMapping(sku: string): Promise<CommerceLookupResult<VariantMapping>>;
  prepareCartLine(sku: string, quantity: number): Promise<CommerceLookupResult<CartLineDraft>>;
}

export function createCommerceService(adapter: CommerceAdapter = unavailableCommerceAdapter): CommerceService {
  return {
    getShopifyProduct(productId: string): Promise<CommerceLookupResult<ShopifyProduct>> {
      return adapter.getProduct({ productId, channel: 'shopify' });
    },
    getShopifyVariant(sku: string): Promise<CommerceLookupResult<ShopifyVariant>> {
      return adapter.getVariant({ sku, channel: 'shopify' });
    },
    getVariantMapping(sku: string): Promise<CommerceLookupResult<VariantMapping>> {
      return adapter.getVariantMapping({ sku, channel: 'shopify' });
    },
    async prepareCartLine(sku: string, quantity: number): Promise<CommerceLookupResult<CartLineDraft>> {
      const mappingResult = await adapter.getVariantMapping({ sku, channel: 'shopify' });

      if (mappingResult.status !== 'ready' || !mappingResult.data) {
        return {
          status: mappingResult.status,
          data: null,
          message: mappingResult.message ?? 'Variant mapping is not ready for cart preparation.',
        };
      }

      return {
        status: 'ready',
        data: {
          sku,
          quantity,
          variantMapping: mappingResult.data,
        },
      };
    },
  };
}

export const commerceService: CommerceService = createCommerceService();

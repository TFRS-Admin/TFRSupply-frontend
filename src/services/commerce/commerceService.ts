import type { ShopifyProduct, ShopifyVariant, VariantMapping } from '@/types';

export interface CommerceService {
  getShopifyProduct(productId: string): Promise<ShopifyProduct | null>;
  getShopifyVariant(sku: string): Promise<ShopifyVariant | null>;
  getVariantMapping(sku: string): Promise<VariantMapping | null>;
  prepareVariantMapping(sku: string, quantity: number): Promise<VariantMapping>;
}

export const commerceService: CommerceService = {
  async getShopifyProduct(): Promise<ShopifyProduct | null> {
    throw new Error('Not implemented');
  },
  async getShopifyVariant(): Promise<ShopifyVariant | null> {
    throw new Error('Not implemented');
  },
  async getVariantMapping(): Promise<VariantMapping | null> {
    throw new Error('Not implemented');
  },
  async prepareVariantMapping(): Promise<VariantMapping> {
    throw new Error('Not implemented');
  },
};

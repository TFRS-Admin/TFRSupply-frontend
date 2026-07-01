import type { CommerceLookupRequest, CommerceLookupResult, ShopifyProduct, ShopifyVariant, VariantMapping } from '@/types';

export interface CommerceAdapter {
  getProduct(request: CommerceLookupRequest): Promise<CommerceLookupResult<ShopifyProduct>>;
  getVariant(request: CommerceLookupRequest): Promise<CommerceLookupResult<ShopifyVariant>>;
  getVariantMapping(request: CommerceLookupRequest): Promise<CommerceLookupResult<VariantMapping>>;
}

export const unavailableCommerceAdapter: CommerceAdapter = {
  async getProduct(): Promise<CommerceLookupResult<ShopifyProduct>> {
    return { status: 'pending', data: null, message: 'Commerce adapter is not connected.' };
  },
  async getVariant(): Promise<CommerceLookupResult<ShopifyVariant>> {
    return { status: 'pending', data: null, message: 'Commerce adapter is not connected.' };
  },
  async getVariantMapping(): Promise<CommerceLookupResult<VariantMapping>> {
    return { status: 'pending', data: null, message: 'Commerce adapter is not connected.' };
  },
};

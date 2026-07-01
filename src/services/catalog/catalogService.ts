import type { Category, Product, Vertical } from '@/types';

export interface CatalogService {
  getProduct(productId: string): Promise<Product | null>;
  listProducts(): Promise<Product[]>;
  getCategory(categoryId: string): Promise<Category | null>;
  listCategories(): Promise<Category[]>;
  getVertical(verticalId: string): Promise<Vertical | null>;
  listVerticals(): Promise<Vertical[]>;
}

export const catalogService: CatalogService = {
  async getProduct(): Promise<Product | null> {
    throw new Error('Not implemented');
  },
  async listProducts(): Promise<Product[]> {
    throw new Error('Not implemented');
  },
  async getCategory(): Promise<Category | null> {
    throw new Error('Not implemented');
  },
  async listCategories(): Promise<Category[]> {
    throw new Error('Not implemented');
  },
  async getVertical(): Promise<Vertical | null> {
    throw new Error('Not implemented');
  },
  async listVerticals(): Promise<Vertical[]> {
    throw new Error('Not implemented');
  },
};

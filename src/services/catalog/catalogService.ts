import type { Category, Product, Vertical } from '@/types';
import {
  listTypedCategories,
  listTypedProducts,
  listTypedVerticals,
  loadTypedCategory,
  loadTypedProduct,
  loadTypedVertical,
} from '@/data/loaders';

export interface CatalogService {
  getProduct(productId: string): Promise<Product | null>;
  listProducts(): Promise<Product[]>;
  getCategory(categoryId: string): Promise<Category | null>;
  listCategories(): Promise<Category[]>;
  getVertical(verticalId: string): Promise<Vertical | null>;
  listVerticals(): Promise<Vertical[]>;
}

export const catalogService: CatalogService = {
  async getProduct(productId: string): Promise<Product | null> {
    return loadTypedProduct(productId);
  },
  async listProducts(): Promise<Product[]> {
    return listTypedProducts();
  },
  async getCategory(categoryId: string): Promise<Category | null> {
    return loadTypedCategory(categoryId);
  },
  async listCategories(): Promise<Category[]> {
    return listTypedCategories();
  },
  async getVertical(verticalId: string): Promise<Vertical | null> {
    return loadTypedVertical(verticalId);
  },
  async listVerticals(): Promise<Vertical[]> {
    return listTypedVerticals();
  },
};

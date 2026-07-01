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
  getProduct(productId: string): Product | null;
  listProducts(): Product[];
  getCategory(categoryId: string): Category | null;
  listCategories(): Category[];
  getVertical(verticalId: string): Vertical | null;
  listVerticals(): Vertical[];
}

export const catalogService: CatalogService = {
  getProduct(productId: string): Product | null {
    return loadTypedProduct(productId);
  },
  listProducts(): Product[] {
    return listTypedProducts();
  },
  getCategory(categoryId: string): Category | null {
    return loadTypedCategory(categoryId);
  },
  listCategories(): Category[] {
    return listTypedCategories();
  },
  getVertical(verticalId: string): Vertical | null {
    return loadTypedVertical(verticalId);
  },
  listVerticals(): Vertical[] {
    return listTypedVerticals();
  },
};

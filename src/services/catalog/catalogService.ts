import type { Category, Product, ProductListResult, ProductSearchFilter, ProductSearchQuery, Vertical } from '@/types';
import { productListResultSchema, productSearchQuerySchema } from '@/schemas/product.schema';
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
  searchProducts(query?: ProductSearchQuery): ProductListResult;
}

function matchesProductFilter(product: Product, filter: ProductSearchFilter): boolean {
  if (filter.verticalId && !product.verticalIds.includes(filter.verticalId)) return false;
  if (filter.categoryId && !product.categoryIds.includes(filter.categoryId)) return false;
  if (filter.vendor && product.vendor !== filter.vendor) return false;
  return true;
}

function matchesProductQuery(product: Product, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    product.label,
    product.title,
    product.subtitle,
    product.description,
    product.vendor,
    product.product_family,
    product.sku,
    ...(product.marketing?.features ?? []),
  ].filter((value): value is string => Boolean(value)).map((value) => value.toLowerCase());

  return haystack.some((value) => value.includes(needle));
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
  searchProducts(query?: ProductSearchQuery): ProductListResult {
    const validated = productSearchQuerySchema.parse(query ?? {});
    const allProducts = listTypedProducts();
    const filtered = allProducts
      .filter((product) => (validated.filter ? matchesProductFilter(product, validated.filter) : true))
      .filter((product) => (validated.query ? matchesProductQuery(product, validated.query) : true));
    const status = allProducts.length === 0 ? 'unavailable' : filtered.length === 0 ? 'empty' : 'ready';

    return productListResultSchema.parse({ status, products: filtered, total: allProducts.length });
  },
};

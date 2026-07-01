import { listTypedCategories, listTypedConfigurators, listTypedProducts, listTypedVerticals } from '../loaders';

export interface ProductDataValidationStats {
  products: number;
  categories: number;
  verticals: number;
  configurators: number;
  total: number;
}

export function validateAllProductData(): ProductDataValidationStats {
  const products = listTypedProducts();
  const categories = listTypedCategories();
  const verticals = listTypedVerticals();
  const configurators = listTypedConfigurators();

  return {
    products: products.length,
    categories: categories.length,
    verticals: verticals.length,
    configurators: configurators.length,
    total: products.length + categories.length + verticals.length + configurators.length,
  };
}

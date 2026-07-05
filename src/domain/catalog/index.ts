export { resolveProductDetailPath } from './productNavigation';
export type { ProductDetailPathOptions } from './productNavigation';
export { filterCategoryProducts, matchesCategoryProductKeyword } from './categoryProductFilter';
export type { CategoryActiveFilter } from './categoryProductFilter';
export {
  MAX_COMPARE_PRODUCTS,
  addProductToCompare,
  removeProductFromCompare,
  isProductInCompare,
  isCompareFull,
} from './compareSelection';
export {
  MAX_RECENTLY_VIEWED_PRODUCTS,
  trackRecentlyViewedProduct,
} from './recentlyViewed';
export {
  saveProduct,
  unsaveProduct,
  isProductSaved,
} from './savedProducts';
export { resolveRelatedProducts } from './relatedProducts';
export type { RelatedProductsDeps } from './relatedProducts';

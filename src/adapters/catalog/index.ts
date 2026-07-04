export type { CatalogAdapter } from './catalogAdapter';
export { mockCatalogAdapter } from './mockCatalogAdapter';
export { unavailableCatalogAdapter } from './unavailableCatalogAdapter';
export { createLiveShopifyStorefrontCatalogAdapter, liveShopifyStorefrontCatalogAdapter, type CatalogAdapterFetchImpl } from './liveShopifyStorefrontCatalogAdapter';
export {
  buildCollectionListOperation,
  buildProductListOperation,
  mapStorefrontCollectionNode,
  mapStorefrontProductNode,
  type CatalogAdapterCollectionNode,
  type CatalogAdapterOperation,
  type CatalogAdapterProductNode,
} from './shopifyProductMapping';

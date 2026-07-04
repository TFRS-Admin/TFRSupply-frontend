import type { Category, Product, ShopifyStorefrontOperationType } from '@/types';

const PRODUCT_LIST_QUERY_NAME = 'CatalogAdapterProductList';
const COLLECTION_LIST_QUERY_NAME = 'CatalogAdapterCollectionList';
const DEFAULT_PAGE_SIZE = 100;

export interface CatalogAdapterOperation {
  operationType: ShopifyStorefrontOperationType;
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}

/**
 * Real Shopify Storefront GraphQL query for a page of products, including
 * variant SKUs and the handles of collections each product belongs to (used
 * to resolve categoryIds/verticalIds against existing local categories).
 * Reuses the existing `product-list-query` operation type from the Shopify
 * Storefront API Foundation — no new operation type is introduced.
 */
export function buildProductListOperation(first: number = DEFAULT_PAGE_SIZE): CatalogAdapterOperation {
  return {
    operationType: 'product-list-query',
    operationName: PRODUCT_LIST_QUERY_NAME,
    query: `query ${PRODUCT_LIST_QUERY_NAME}($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            vendor
            productType
            images(first: 5) { edges { node { url } } }
            variants(first: 25) { edges { node { sku } } }
            collections(first: 10) { edges { node { handle } } }
          }
        }
      }
    }`,
    variables: { first },
  };
}

/**
 * Real Shopify Storefront GraphQL query for a page of collections. Reuses
 * the existing `collection-query` operation type from the Shopify
 * Storefront API Foundation — no new operation type is introduced.
 */
export function buildCollectionListOperation(first: number = DEFAULT_PAGE_SIZE): CatalogAdapterOperation {
  return {
    operationType: 'collection-query',
    operationName: COLLECTION_LIST_QUERY_NAME,
    query: `query ${COLLECTION_LIST_QUERY_NAME}($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
          }
        }
      }
    }`,
    variables: { first },
  };
}

export interface CatalogAdapterProductNode {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  vendor?: string | null;
  productType?: string | null;
  images?: { edges?: Array<{ node?: { url?: string | null } | null }> } | null;
  variants?: { edges?: Array<{ node?: { sku?: string | null } | null }> } | null;
  collections?: { edges?: Array<{ node?: { handle?: string | null } | null }> } | null;
}

export interface CatalogAdapterCollectionNode {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
}

/**
 * Maps a raw Shopify Storefront product node into the existing Product
 * contract. `categoryIds`/`verticalIds` are resolved by matching the
 * product's collection handles against already-known local categories'
 * `slug` — the same category data Catalog Service already exposes via
 * `listCategories()` — rather than inventing a second category taxonomy.
 * Products whose collections don't match any local category simply get
 * empty arrays, which the existing Product schema already allows.
 */
export function mapStorefrontProductNode(node: CatalogAdapterProductNode, existingCategories: Category[]): Product {
  const collectionHandles = (node.collections?.edges ?? [])
    .map((edge) => edge?.node?.handle)
    .filter((handle): handle is string => Boolean(handle));

  const matchedCategories = existingCategories.filter((category) => collectionHandles.includes(category.slug));
  const categoryIds = matchedCategories.map((category) => category.id);
  const verticalIds = Array.from(new Set(matchedCategories.map((category) => category.verticalId)));

  const variantSkus = (node.variants?.edges ?? [])
    .map((edge) => edge?.node?.sku)
    .filter((sku): sku is string => Boolean(sku));

  const gallery = (node.images?.edges ?? [])
    .map((edge) => edge?.node?.url)
    .filter((url): url is string => Boolean(url))
    .map((url) => ({ src: url, alt: node.title }));

  return {
    id: `shopify-product-${node.handle}`,
    label: node.title,
    slug: node.handle,
    title: node.title,
    description: node.description ?? undefined,
    vendor: node.vendor ?? undefined,
    verticalIds,
    categoryIds,
    sku: variantSkus[0],
    media: gallery.length > 0 ? { gallery } : undefined,
    shopify: { productId: node.id, productGid: node.id, collectionHandles },
  };
}

/**
 * Maps a raw Shopify Storefront collection node onto an existing local
 * Category, matched by `slug === handle`. This is an enrichment merge, not
 * a wholesale replacement: `verticalId` and every other required Category
 * field come from the existing local record, since Shopify collections
 * carry no vertical concept the platform could safely infer. Collections
 * with no matching local category return `null` and are reported as
 * unmatched by the caller rather than mapped with a fabricated verticalId.
 */
export function mapStorefrontCollectionNode(node: CatalogAdapterCollectionNode, existingCategories: Category[]): Category | null {
  const existing = existingCategories.find((category) => category.slug === node.handle);
  if (!existing) return null;

  return {
    ...existing,
    label: node.title || existing.label,
    description: node.description ?? existing.description,
    shopify: { ...(existing.shopify ?? {}), collectionId: node.id, collectionGid: node.id },
  };
}

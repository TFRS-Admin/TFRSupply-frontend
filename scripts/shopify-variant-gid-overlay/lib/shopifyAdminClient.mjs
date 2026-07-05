/**
 * lib/shopifyAdminClient.mjs
 *
 * A minimal, dependency-free Shopify Admin GraphQL client scoped to exactly
 * one query: page through every Product Variant in the store and return its
 * Variant GID, SKU, parent Product GID, product handle, and product title.
 *
 * This is the only module in this pipeline (and, per
 * docs/architecture/SHOPIFY_CATALOG_CSV_INGESTION.md, in the whole repo)
 * that makes a live Shopify API call. `fetchImpl`/`sleepImpl` are injectable
 * so tests never touch the network or a real clock.
 */

const DEFAULT_API_VERSION = '2024-10';
const DEFAULT_PAGE_SIZE = 250;
const DEFAULT_MAX_ATTEMPTS_PER_PAGE = 5;
const DEFAULT_THROTTLE_BACKOFF_MS = 1000;

const PRODUCT_VARIANTS_QUERY = `
  query ShopifyVariantGidOverlay($first: Int!, $after: String) {
    productVariants(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          sku
          product {
            id
            handle
            title
          }
        }
      }
    }
  }
`;

export class ShopifyAdminApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ShopifyAdminApiError';
    this.status = details.status ?? null;
    this.graphqlErrors = details.graphqlErrors ?? null;
    this.cause = details.cause ?? null;
  }
}

export function buildAdminGraphqlUrl({ storeDomain, apiVersion = DEFAULT_API_VERSION }) {
  return `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
}

function isThrottled(graphqlErrors) {
  return Array.isArray(graphqlErrors) && graphqlErrors.some((e) => e?.extensions?.code === 'THROTTLED');
}

async function defaultSleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {{ storeDomain: string, accessToken: string, apiVersion?: string, pageSize?: number, fetchImpl?: typeof fetch, sleepImpl?: (ms: number) => Promise<void>, maxAttemptsPerPage?: number }} config
 */
export function createShopifyAdminClient({
  storeDomain,
  accessToken,
  apiVersion = DEFAULT_API_VERSION,
  pageSize = DEFAULT_PAGE_SIZE,
  fetchImpl = fetch,
  sleepImpl = defaultSleep,
  maxAttemptsPerPage = DEFAULT_MAX_ATTEMPTS_PER_PAGE,
} = {}) {
  const url = buildAdminGraphqlUrl({ storeDomain, apiVersion });

  async function requestPage(after) {
    let lastGraphqlErrors = null;

    for (let attempt = 1; attempt <= maxAttemptsPerPage; attempt++) {
      let response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify({ query: PRODUCT_VARIANTS_QUERY, variables: { first: pageSize, after } }),
        });
      } catch (cause) {
        throw new ShopifyAdminApiError(`Shopify Admin API request failed: ${cause.message}`, { cause });
      }

      if (!response.ok) {
        throw new ShopifyAdminApiError(`Shopify Admin API request failed with HTTP ${response.status}`, { status: response.status });
      }

      const payload = await response.json();

      if (payload.errors && payload.errors.length > 0) {
        lastGraphqlErrors = payload.errors;
        if (isThrottled(payload.errors) && attempt < maxAttemptsPerPage) {
          await sleepImpl(DEFAULT_THROTTLE_BACKOFF_MS * attempt);
          continue;
        }
        throw new ShopifyAdminApiError('Shopify Admin API returned GraphQL errors', { graphqlErrors: payload.errors });
      }

      return payload.data.productVariants;
    }

    throw new ShopifyAdminApiError('Shopify Admin API request was throttled past the retry limit', { graphqlErrors: lastGraphqlErrors });
  }

  /**
   * Pages through every Product Variant in the store.
   * @param {{ onPage?: (info: { pageCount: number, fetchedSoFar: number }) => void }} [options]
   * @returns {Promise<{ variants: Array<{ variantGid: string, sku: string|null, productGid: string|null, productHandle: string|null, productTitle: string|null }>, pageCount: number }>}
   */
  async function fetchAllProductVariants({ onPage } = {}) {
    const variants = [];
    let after = null;
    let hasNextPage = true;
    let pageCount = 0;

    while (hasNextPage) {
      const page = await requestPage(after);
      pageCount++;

      for (const edge of page.edges) {
        const node = edge.node;
        variants.push({
          variantGid: node.id,
          sku: node.sku ?? null,
          productGid: node.product?.id ?? null,
          productHandle: node.product?.handle ?? null,
          productTitle: node.product?.title ?? null,
        });
      }

      hasNextPage = Boolean(page.pageInfo?.hasNextPage);
      after = page.pageInfo?.endCursor ?? null;
      onPage?.({ pageCount, fetchedSoFar: variants.length });
    }

    return { variants, pageCount };
  }

  return { fetchAllProductVariants };
}

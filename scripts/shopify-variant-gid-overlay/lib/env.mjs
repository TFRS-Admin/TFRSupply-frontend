/**
 * lib/env.mjs
 *
 * Reads Shopify Admin API credentials strictly from environment variables —
 * never from a CLI flag, never hardcoded. Missing/blank credentials are a
 * normal, expected outcome (this script may run in an environment that
 * hasn't been configured yet) and must fail gracefully with an actionable
 * message, not throw or crash the process.
 *
 * Two auth modes are supported:
 *
 * 1. OAuth client credentials (preferred) — required for apps created in
 *    the Shopify Dev Dashboard, which do not expose a static Admin API
 *    access token at all:
 *      SHOPIFY_SHOP            the store domain, e.g. "tfrsupply.myshopify.com"
 *      SHOPIFY_CLIENT_ID       the app's Client ID
 *      SHOPIFY_CLIENT_SECRET   the app's Client Secret
 *    This module only validates presence; the actual token exchange
 *    (client_id/client_secret → short-lived Admin API access token) lives
 *    in lib/shopifyAuth.mjs / lib/shopifyOAuthClient.mjs.
 *
 * 2. Static Admin API access token (legacy, still supported for backwards
 *    compatibility with custom/private Shopify apps that issue one):
 *      SHOPIFY_STORE_DOMAIN        the store domain (also accepted as the
 *                                  domain for mode 1, as an alias of
 *                                  SHOPIFY_SHOP)
 *      SHOPIFY_ADMIN_ACCESS_TOKEN  a static Admin API access token
 *
 * This is Admin API auth only. It is unrelated to Storefront API auth
 * (VITE_SHOPIFY_STORE_DOMAIN / VITE_SHOPIFY_STOREFRONT_* / a Storefront
 * access token) used by the customer-facing storefront adapters — see
 * docs/architecture/SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md.
 */

export const SHOPIFY_SHOP_VAR = 'SHOPIFY_SHOP';
export const SHOPIFY_CLIENT_ID_VAR = 'SHOPIFY_CLIENT_ID';
export const SHOPIFY_CLIENT_SECRET_VAR = 'SHOPIFY_CLIENT_SECRET';
export const SHOPIFY_STORE_DOMAIN_VAR = 'SHOPIFY_STORE_DOMAIN';
export const SHOPIFY_ADMIN_ACCESS_TOKEN_VAR = 'SHOPIFY_ADMIN_ACCESS_TOKEN';

function isBlank(value) {
  return value == null || String(value).trim() === '';
}

function readShopDomain(env) {
  if (!isBlank(env[SHOPIFY_SHOP_VAR])) return String(env[SHOPIFY_SHOP_VAR]).trim();
  if (!isBlank(env[SHOPIFY_STORE_DOMAIN_VAR])) return String(env[SHOPIFY_STORE_DOMAIN_VAR]).trim();
  return null;
}

export function describeMissingCredentialsMessage(missing, { mode } = {}) {
  const lines = [
    'Shopify Variant GID Overlay cannot run: missing required environment variable(s):',
    ...missing.map((name) => `  - ${name}`),
    '',
  ];

  if (mode === 'client-credentials' || mode == null) {
    lines.push(
      'Preferred — OAuth client credentials (required for Shopify Dev Dashboard apps,',
      'which do not expose a static Admin API access token):',
      `  ${SHOPIFY_SHOP_VAR}            e.g. "tfrsupply.myshopify.com"`,
      `  ${SHOPIFY_CLIENT_ID_VAR}       the app's Client ID (Shopify Dev Dashboard → Client credentials)`,
      `  ${SHOPIFY_CLIENT_SECRET_VAR}   the app's Client Secret (Shopify Dev Dashboard → Client credentials)`,
    );
  }

  if (mode === 'static-token' || mode == null) {
    if (mode == null) lines.push('');
    lines.push(
      'Legacy — a static Admin API access token, still supported for backwards',
      'compatibility with custom/private Shopify apps:',
      `  ${SHOPIFY_STORE_DOMAIN_VAR}        e.g. "tfrsupply.myshopify.com"`,
      `  ${SHOPIFY_ADMIN_ACCESS_TOKEN_VAR}  an Admin API access token (read_products scope)`,
    );
  }

  lines.push('', 'Never commit these values to source. See docs/architecture/SHOPIFY_VARIANT_GID_OVERLAY.md for setup instructions.');
  return lines.join('\n');
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {
 *   | { ok: true, authMode: 'client-credentials', storeDomain: string, clientId: string, clientSecret: string }
 *   | { ok: true, authMode: 'static-token', storeDomain: string, accessToken: string }
 *   | { ok: false, missing: string[], message: string }
 * }
 */
export function readShopifyAdminCredentials(env = process.env) {
  const storeDomain = readShopDomain(env);
  const clientId = env[SHOPIFY_CLIENT_ID_VAR];
  const clientSecret = env[SHOPIFY_CLIENT_SECRET_VAR];
  const accessToken = env[SHOPIFY_ADMIN_ACCESS_TOKEN_VAR];

  const attemptingClientCredentials = !isBlank(clientId) || !isBlank(clientSecret);
  const attemptingStaticToken = !attemptingClientCredentials && (!isBlank(accessToken) || !isBlank(storeDomain));

  if (attemptingClientCredentials) {
    const missing = [];
    if (isBlank(storeDomain)) missing.push(SHOPIFY_SHOP_VAR);
    if (isBlank(clientId)) missing.push(SHOPIFY_CLIENT_ID_VAR);
    if (isBlank(clientSecret)) missing.push(SHOPIFY_CLIENT_SECRET_VAR);
    if (missing.length > 0) {
      return { ok: false, missing, message: describeMissingCredentialsMessage(missing, { mode: 'client-credentials' }) };
    }
    return {
      ok: true,
      authMode: 'client-credentials',
      storeDomain,
      clientId: String(clientId).trim(),
      clientSecret: String(clientSecret).trim(),
    };
  }

  if (attemptingStaticToken) {
    const missing = [];
    if (isBlank(storeDomain)) missing.push(SHOPIFY_STORE_DOMAIN_VAR);
    if (isBlank(accessToken)) missing.push(SHOPIFY_ADMIN_ACCESS_TOKEN_VAR);
    if (missing.length > 0) {
      return { ok: false, missing, message: describeMissingCredentialsMessage(missing, { mode: 'static-token' }) };
    }
    return {
      ok: true,
      authMode: 'static-token',
      storeDomain,
      accessToken: String(accessToken).trim(),
    };
  }

  const missing = [SHOPIFY_SHOP_VAR, SHOPIFY_CLIENT_ID_VAR, SHOPIFY_CLIENT_SECRET_VAR];
  return { ok: false, missing, message: describeMissingCredentialsMessage(missing) };
}

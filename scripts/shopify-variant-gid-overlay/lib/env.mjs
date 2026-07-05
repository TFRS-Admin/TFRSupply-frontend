/**
 * lib/env.mjs
 *
 * Reads Shopify Admin API credentials strictly from environment variables —
 * never from a CLI flag, never hardcoded. Missing/blank credentials are a
 * normal, expected outcome (this script may run in an environment that
 * hasn't been configured yet) and must fail gracefully with an actionable
 * message, not throw or crash the process.
 */

export const SHOPIFY_STORE_DOMAIN_VAR = 'SHOPIFY_STORE_DOMAIN';
export const SHOPIFY_ADMIN_ACCESS_TOKEN_VAR = 'SHOPIFY_ADMIN_ACCESS_TOKEN';

const REQUIRED_ENV_VARS = [SHOPIFY_STORE_DOMAIN_VAR, SHOPIFY_ADMIN_ACCESS_TOKEN_VAR];

function isBlank(value) {
  return value == null || String(value).trim() === '';
}

export function describeMissingCredentialsMessage(missing) {
  const lines = [
    'Shopify Variant GID Overlay cannot run: missing required environment variable(s):',
    ...missing.map((name) => `  - ${name}`),
    '',
    'Set these before running this script:',
    `  ${SHOPIFY_STORE_DOMAIN_VAR}        e.g. "tfrsupply.myshopify.com"`,
    `  ${SHOPIFY_ADMIN_ACCESS_TOKEN_VAR}  an Admin API access token (read_products scope) from a custom/private Shopify app`,
    '',
    'Never commit these values to source. See docs/architecture/SHOPIFY_VARIANT_GID_OVERLAY.md for setup instructions.',
  ];
  return lines.join('\n');
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {{ ok: true, storeDomain: string, accessToken: string } | { ok: false, missing: string[], message: string }}
 */
export function readShopifyAdminCredentials(env = process.env) {
  const missing = REQUIRED_ENV_VARS.filter((name) => isBlank(env[name]));
  if (missing.length > 0) {
    return { ok: false, missing, message: describeMissingCredentialsMessage(missing) };
  }
  return {
    ok: true,
    storeDomain: String(env[SHOPIFY_STORE_DOMAIN_VAR]).trim(),
    accessToken: String(env[SHOPIFY_ADMIN_ACCESS_TOKEN_VAR]).trim(),
  };
}

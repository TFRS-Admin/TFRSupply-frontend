/**
 * lib/shopifyAuth.mjs
 *
 * Orchestrates Admin API auth: reads credentials from the environment
 * (lib/env.mjs) and, for OAuth client credentials mode, exchanges them for
 * an access token (lib/shopifyOAuthClient.mjs). Static-token mode needs no
 * network call — the configured token is used as-is.
 *
 * Callers only need `resolveShopifyAdminAccessToken`; it returns a single
 * shape regardless of which auth mode was configured, so the rest of the
 * pipeline (shopifyAdminClient.mjs) never needs to know the difference.
 */

import { readShopifyAdminCredentials } from './env.mjs';
import { fetchClientCredentialsAccessToken, ShopifyOAuthError } from './shopifyOAuthClient.mjs';

export function describeOAuthErrorMessage(error, storeDomain) {
  const lines = [`Shopify OAuth token exchange failed for store "${storeDomain}": ${error.message}`];
  if (error.status != null) lines.push(`  HTTP status: ${error.status}`);
  lines.push('');
  lines.push('Check SHOPIFY_SHOP, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET, and that the app is installed on this store.');
  return lines.join('\n');
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {{ fetchImpl?: typeof fetch }} [options]
 * @returns {Promise<
 *   | { ok: true, authMode: 'client-credentials' | 'static-token', storeDomain: string, accessToken: string }
 *   | { ok: false, reason: 'missing-credentials' | 'oauth-error', message: string }
 * >}
 */
export async function resolveShopifyAdminAccessToken(env = process.env, { fetchImpl } = {}) {
  const credentials = readShopifyAdminCredentials(env);
  if (!credentials.ok) {
    return { ok: false, reason: 'missing-credentials', message: credentials.message };
  }

  if (credentials.authMode === 'static-token') {
    return {
      ok: true,
      authMode: 'static-token',
      storeDomain: credentials.storeDomain,
      accessToken: credentials.accessToken,
    };
  }

  try {
    const token = await fetchClientCredentialsAccessToken({
      storeDomain: credentials.storeDomain,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      fetchImpl,
    });
    return {
      ok: true,
      authMode: 'client-credentials',
      storeDomain: credentials.storeDomain,
      accessToken: token.accessToken,
    };
  } catch (error) {
    if (error instanceof ShopifyOAuthError) {
      return { ok: false, reason: 'oauth-error', message: describeOAuthErrorMessage(error, credentials.storeDomain) };
    }
    throw error;
  }
}

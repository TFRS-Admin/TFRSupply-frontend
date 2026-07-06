/**
 * lib/shopifyOAuthClient.mjs
 *
 * Exchanges a Shopify app's Client ID/Client Secret for a short-lived Admin
 * API access token via the OAuth client credentials grant. This is the auth
 * flow required by apps created in the Shopify Dev Dashboard, which do not
 * issue a static Admin API access token the way custom/private apps do.
 *
 * `fetchImpl` is injectable so tests never touch the network.
 */

const DEFAULT_GRANT_TYPE = 'client_credentials';

export class ShopifyOAuthError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ShopifyOAuthError';
    this.status = details.status ?? null;
    this.cause = details.cause ?? null;
  }
}

export function buildOAuthTokenUrl({ storeDomain }) {
  return `https://${storeDomain}/admin/oauth/access_token`;
}

/**
 * @param {{ storeDomain: string, clientId: string, clientSecret: string, fetchImpl?: typeof fetch }} config
 * @returns {Promise<{ accessToken: string, scope: string|null, expiresIn: number|null }>}
 */
export async function fetchClientCredentialsAccessToken({ storeDomain, clientId, clientSecret, fetchImpl = fetch }) {
  const url = buildOAuthTokenUrl({ storeDomain });

  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: DEFAULT_GRANT_TYPE,
      }),
    });
  } catch (cause) {
    throw new ShopifyOAuthError(`Shopify OAuth token request failed: ${cause.message}`, { cause });
  }

  if (!response.ok) {
    throw new ShopifyOAuthError(`Shopify OAuth token request failed with HTTP ${response.status}`, { status: response.status });
  }

  const payload = await response.json();
  if (!payload.access_token) {
    throw new ShopifyOAuthError('Shopify OAuth token response did not include an access_token');
  }

  return {
    accessToken: payload.access_token,
    scope: payload.scope ?? null,
    expiresIn: payload.expires_in ?? null,
  };
}

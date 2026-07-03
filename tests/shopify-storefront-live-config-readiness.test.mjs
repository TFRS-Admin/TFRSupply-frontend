import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

function fullEnv(overrides = {}) {
  return {
    VITE_SHOPIFY_STORE_DOMAIN: 'acme-trucks.myshopify.com',
    VITE_SHOPIFY_STOREFRONT_API_VERSION: '2024-10',
    VITE_SHOPIFY_STOREFRONT_ENABLED: 'true',
    ...overrides,
  };
}

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    types: await server.ssrLoadModule('/src/types/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/shopifyStorefrontConfig.schema.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyStorefrontConfig/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefrontConfig/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Shopify Storefront Live Config Readiness — env parsing', () => {
  it('parses a fully configured frontend-safe env', () => {
    const config = modules.service.readEnvironmentConfig(fullEnv());
    assert.deepEqual(config, {
      storeDomain: 'acme-trucks.myshopify.com',
      apiVersion: '2024-10',
      storefrontEnabled: true,
    });
  });

  it('treats missing or blank env vars as unset', () => {
    const config = modules.service.readEnvironmentConfig({});
    assert.equal(config.storeDomain, null);
    assert.equal(config.apiVersion, null);
    assert.equal(config.storefrontEnabled, false);

    const blank = modules.service.readEnvironmentConfig({ VITE_SHOPIFY_STORE_DOMAIN: '   ' });
    assert.equal(blank.storeDomain, null);
  });

  it('parses VITE_SHOPIFY_STOREFRONT_ENABLED case-insensitively', () => {
    assert.equal(modules.service.readEnvironmentConfig({ VITE_SHOPIFY_STOREFRONT_ENABLED: 'TRUE' }).storefrontEnabled, true);
    assert.equal(modules.service.readEnvironmentConfig({ VITE_SHOPIFY_STOREFRONT_ENABLED: 'false' }).storefrontEnabled, false);
    assert.equal(modules.service.readEnvironmentConfig({ VITE_SHOPIFY_STOREFRONT_ENABLED: 'yes' }).storefrontEnabled, false);
  });

  it('never produces a field for a Storefront access token', () => {
    const config = modules.service.readEnvironmentConfig({ ...fullEnv(), VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat_secret' });
    assert.deepEqual(Object.keys(config).sort(), ['apiVersion', 'storeDomain', 'storefrontEnabled']);
    assert.equal(JSON.stringify(config).includes('shpat_secret'), false);
  });
});

describe('Shopify Storefront Live Config Readiness — missing config handling', () => {
  it('reports not-configured when nothing is set', () => {
    const validation = modules.service.validateConfig(modules.service.readEnvironmentConfig({}));
    assert.equal(validation.status, 'disabled');
    assert.equal(validation.configured, false);
    assert.equal(validation.missingEnvVars.length, 3);
    assert.deepEqual(validation.errors.map((e) => e.code).sort(), ['missing-api-version', 'missing-store-domain', 'storefront-disabled']);
  });

  it('reports partially-configured when only some fields are present but enabled is true', () => {
    const validation = modules.service.validateConfig(modules.service.readEnvironmentConfig({ VITE_SHOPIFY_STORE_DOMAIN: 'acme.myshopify.com', VITE_SHOPIFY_STOREFRONT_ENABLED: 'true' }));
    assert.equal(validation.status, 'partially-configured');
    assert.equal(validation.configured, false);
    assert.deepEqual(validation.missingEnvVars, ['VITE_SHOPIFY_STOREFRONT_API_VERSION']);
  });

  it('reports disabled when storefrontEnabled is false even if domain/version are present', () => {
    const validation = modules.service.validateConfig(modules.service.readEnvironmentConfig(fullEnv({ VITE_SHOPIFY_STOREFRONT_ENABLED: 'false' })));
    assert.equal(validation.status, 'disabled');
    assert.equal(validation.storefrontEnabled, false);
    assert.ok(validation.errors.some((e) => e.code === 'storefront-disabled'));
  });

  it('reports configured when domain, version, and enabled are all present', () => {
    const validation = modules.service.validateConfig(modules.service.readEnvironmentConfig(fullEnv()));
    assert.equal(validation.status, 'configured');
    assert.equal(validation.configured, true);
    assert.deepEqual(validation.errors, []);
    assert.deepEqual(validation.missingEnvVars, []);
  });
});

describe('Shopify Storefront Live Config Readiness — redaction', () => {
  it('masks the store domain label while keeping the shop suffix visible', () => {
    const redacted = modules.service.redactStoreDomain('acme-trucks.myshopify.com');
    assert.match(redacted, /^ac\*+\.myshopify\.com$/);
    assert.equal(redacted.includes('acme-trucks'), false);
  });

  it('never exposes the full raw domain anywhere in the validation result', () => {
    const validation = modules.service.validateConfig(modules.service.readEnvironmentConfig(fullEnv()));
    assert.notEqual(validation.redactedStoreDomain, 'acme-trucks.myshopify.com');
    assert.equal(JSON.stringify(validation).includes('acme-trucks.myshopify.com'), false);
  });

  it('handles very short domain labels without throwing', () => {
    const redacted = modules.service.redactStoreDomain('ab.myshopify.com');
    assert.equal(typeof redacted, 'string');
    assert.equal(redacted.includes('ab.myshopify.com'), false);
  });
});

describe('Shopify Storefront Live Config Readiness — capability summary', () => {
  it('aggregates capabilities from the existing Storefront foundations without live calls', () => {
    const summary = modules.service.getCapabilitySummary(modules.service.readEnvironmentConfig(fullEnv()));
    assert.equal(summary.configValidation.status, 'configured');
    assert.equal(summary.storefrontApiEnabled, true);
    assert.equal(summary.liveAdapterReady, false);
    assert.match(summary.liveAdapterReadinessReason, /backend\/proxy/);
    assert.equal(summary.adapterMode, 'unavailable');
    assert.equal(summary.cartAdapterMode, 'unavailable');
    assert.equal(summary.productAdapterMode, 'unavailable');
    assert.equal(summary.collectionAdapterMode, 'unavailable');
    assert.ok(summary.supportedOperationTypes.includes('product-query'));
  });

  it('always reports liveAdapterReady: false regardless of env config, since no token can be supplied', () => {
    const summary = modules.service.getCapabilitySummary(modules.service.readEnvironmentConfig(fullEnv()));
    assert.equal(summary.liveAdapterReady, false);
  });

  it('validates against the published zod schema', () => {
    const summary = modules.service.getCapabilitySummary(modules.service.readEnvironmentConfig(fullEnv()));
    assert.doesNotThrow(() => modules.schemas.shopifyStorefrontCapabilitySummarySchema.parse(summary));
  });
});

describe('Shopify Storefront Live Config Readiness — no token exposure', () => {
  it('the service module never imports or references a token constant', async () => {
    const source = await (await import('node:fs/promises')).readFile(new URL('../src/services/shopifyStorefrontConfig/shopifyStorefrontConfigService.ts', import.meta.url), 'utf-8');
    assert.equal(/storefrontAccessToken/i.test(source), false);
    assert.equal(/ACCESS_TOKEN/.test(source), false);
  });

  it('capability summary JSON never contains a token-shaped value', () => {
    const summary = modules.service.getCapabilitySummary(modules.service.readEnvironmentConfig(fullEnv({ VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat_abcdef123456' })));
    assert.equal(JSON.stringify(summary).includes('shpat_abcdef123456'), false);
  });
});

describe('Shopify Storefront Live Config Readiness — hook exports', () => {
  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useShopifyStorefrontConfig, 'function');
    assert.equal(typeof modules.hooks.useShopifyStorefrontCapabilities, 'function');
  });

  it('useShopifyStorefrontConfig renders without a live network call', () => {
    const { useShopifyStorefrontConfig } = modules.hooks;

    function HookProbe() {
      const state = useShopifyStorefrontConfig();
      return React.createElement('span', {
        'data-status': state.validation.status,
        'data-has-domain': String(Boolean(state.config.storeDomain)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-status="(not-configured|partially-configured|configured|disabled)"/);
  });

  it('useShopifyStorefrontCapabilities renders with a summary and no error', () => {
    const { useShopifyStorefrontCapabilities } = modules.hooks;

    function HookProbe() {
      const state = useShopifyStorefrontCapabilities();
      return React.createElement('span', {
        'data-has-summary': String(Boolean(state.summary)),
        'data-live-ready': String(Boolean(state.summary?.liveAdapterReady)),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-has-summary="true"/);
    assert.match(markup, /data-live-ready="false"/);
  });
});

describe('Shopify Storefront Live Config Readiness — readiness UI integration', () => {
  it('StorefrontConfigReadinessRow renders status without a token and returns null when validation is absent', async () => {
    const rowModule = await server.ssrLoadModule('/src/components/shopify/StorefrontConfigReadinessRow.jsx');
    const Row = rowModule.default;

    assert.equal(renderToString(React.createElement(Row, {})), '');

    const validation = modules.service.validateConfig(modules.service.readEnvironmentConfig(fullEnv()));
    const markup = renderToString(React.createElement(Row, { validation }));
    assert.match(markup, /Storefront Configuration/);
    assert.match(markup, /Configured/);
    assert.equal(markup.includes('shpat'), false);
  });

  it('CheckoutReadinessPanel renders the capability summary section without a token', async () => {
    const panelModule = await server.ssrLoadModule('/src/components/cart/CheckoutReadinessPanel.jsx');
    const Panel = panelModule.default;

    const summary = modules.service.getCapabilitySummary(modules.service.readEnvironmentConfig(fullEnv()));
    const result = {
      status: 'ready',
      blockers: [],
      warnings: [],
      payloadPreview: null,
    };
    const markup = renderToString(React.createElement(Panel, { result, loading: false, storefrontCapabilitySummary: summary }));
    assert.match(markup, /Live adapter ready/);
    assert.match(markup, /No/);
    assert.equal(markup.includes('shpat'), false);
  });
});

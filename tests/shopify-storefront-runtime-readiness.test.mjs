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
    schemas: await server.ssrLoadModule('/src/schemas/shopifyStorefrontRuntime.schema.ts'),
    configService: await server.ssrLoadModule('/src/services/shopifyStorefrontConfig/index.ts'),
    service: await server.ssrLoadModule('/src/services/shopifyStorefrontRuntime/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/shopifyStorefrontRuntime/index.ts'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
  };
});
after(async () => { await server?.close(); });

function statusFor(envOverrides) {
  const config = modules.configService.readEnvironmentConfig(fullEnv(envOverrides));
  return modules.service.getRuntimeStatus(config);
}

describe('Shopify Storefront Runtime Configuration — runtime mode + capability matrix', () => {
  it('reports 5 capability rows, all unavailable by default, and an overall unavailable runtime mode', () => {
    const status = statusFor();
    assert.equal(status.capabilityMatrix.length, 5);
    assert.ok(status.capabilityMatrix.every((row) => row.adapterMode === 'unavailable'));
    assert.equal(status.runtimeMode, 'unavailable');
    assert.deepEqual(
      status.capabilityMatrix.map((row) => row.foundation),
      ['Shopify Storefront API', 'Storefront Cart Adapter', 'Storefront Product Sync', 'Storefront Collection Sync', 'Checkout URL Preview'],
    );
  });

  it('never introduces a new adapter mode beyond mock/unavailable/live/mixed', () => {
    const status = statusFor();
    status.capabilityMatrix.forEach((row) => {
      assert.ok(['mock', 'unavailable', 'live'].includes(row.adapterMode));
    });
    assert.ok(['mock', 'unavailable', 'live', 'mixed'].includes(status.runtimeMode));
  });

  it('flags the Checkout URL Preview row as checkout-redirect-disabled', () => {
    const status = statusFor();
    const checkoutRow = status.capabilityMatrix.find((row) => row.foundation === 'Checkout URL Preview');
    assert.match(checkoutRow.notes, /Checkout redirect disabled/);
  });
});

describe('Shopify Storefront Runtime Configuration — feature flag summary', () => {
  it('summarizes dry-run-only, live-calls, live-adapter-ready, and checkout-redirect flags', () => {
    const status = statusFor();
    const flagsByKey = Object.fromEntries(status.featureFlags.map((f) => [f.key, f]));
    assert.equal(flagsByKey.dryRunOnly.enabled, true);
    assert.equal(flagsByKey.liveCallsEnabled.enabled, false);
    assert.equal(flagsByKey.liveAdapterReady.enabled, false);
    assert.equal(flagsByKey.checkoutRedirectDisabled.enabled, true);
  });

  it('reflects storefrontEnabled from env config', () => {
    assert.equal(statusFor({ VITE_SHOPIFY_STOREFRONT_ENABLED: 'true' }).featureFlags.find((f) => f.key === 'storefrontEnabled').enabled, true);
    assert.equal(statusFor({ VITE_SHOPIFY_STOREFRONT_ENABLED: 'false' }).featureFlags.find((f) => f.key === 'storefrontEnabled').enabled, false);
  });
});

describe('Shopify Storefront Runtime Configuration — configuration validation + diagnostics', () => {
  it('reports no missing-env-var or storefront-disabled diagnostics when fully configured', () => {
    const status = statusFor();
    const codes = status.diagnostics.map((d) => d.code);
    assert.equal(codes.includes('missing-env-var'), false);
    assert.equal(codes.includes('storefront-disabled'), false);
    assert.ok(codes.includes('env-mode'));
    assert.ok(codes.includes('live-adapter-not-ready'));
  });

  it('reports a missing-env-var diagnostic per missing variable and a storefront-disabled diagnostic when nothing is set', () => {
    const config = modules.configService.readEnvironmentConfig({});
    const status = modules.service.getRuntimeStatus(config);
    const missing = status.diagnostics.filter((d) => d.code === 'missing-env-var');
    assert.equal(missing.length, 3);
    assert.ok(status.diagnostics.some((d) => d.code === 'storefront-disabled' && d.level === 'warning'));
    assert.equal(status.readinessSummary.length > 0, true);
  });

  it('surfaces the underlying config validation status unmodified', () => {
    const status = statusFor();
    assert.equal(status.capabilitySummary.configValidation.status, 'configured');
    assert.equal(status.capabilitySummary.configValidation.missingEnvVars.length, 0);
  });
});

describe('Shopify Storefront Runtime Configuration — schema validation', () => {
  it('validates the runtime status against the published zod schema', () => {
    const status = statusFor();
    assert.doesNotThrow(() => modules.schemas.shopifyStorefrontRuntimeStatusSchema.parse(status));
  });

  it('computes a default status without an explicit config argument', () => {
    assert.doesNotThrow(() => modules.service.getRuntimeStatus());
  });
});

describe('Shopify Storefront Runtime Configuration — no secret exposure', () => {
  it('never exposes the raw store domain or a token-shaped value in the runtime status', () => {
    const status = statusFor({ VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'shpat_abcdef123456' });
    const json = JSON.stringify(status);
    assert.equal(json.includes('acme-trucks.myshopify.com'), false);
    assert.equal(json.includes('shpat'), false);
  });

  it('the service module never imports or references a token constant', async () => {
    const source = await (await import('node:fs/promises')).readFile(new URL('../src/services/shopifyStorefrontRuntime/shopifyStorefrontRuntimeService.ts', import.meta.url), 'utf-8');
    assert.equal(/storefrontAccessToken/i.test(source), false);
    assert.equal(/ACCESS_TOKEN/.test(source), false);
  });
});

describe('Shopify Storefront Runtime Configuration — hook', () => {
  it('exposes a typed hook entry point', () => {
    assert.equal(typeof modules.hooks.useShopifyStorefrontRuntimeStatus, 'function');
  });

  it('renders a status with a full capability matrix and no error, without a live network call', () => {
    const { useShopifyStorefrontRuntimeStatus } = modules.hooks;

    function HookProbe() {
      const state = useShopifyStorefrontRuntimeStatus();
      return React.createElement('span', {
        'data-has-status': String(Boolean(state.status)),
        'data-runtime-mode': state.status?.runtimeMode ?? '',
        'data-row-count': String(state.status?.capabilityMatrix.length ?? 0),
      });
    }

    const markup = renderToString(React.createElement(HookProbe));
    assert.match(markup, /data-has-status="true"/);
    assert.match(markup, /data-row-count="5"/);
  });
});

describe('Shopify Storefront Runtime Configuration — /dev/storefront dashboard rendering', () => {
  it('renders the dashboard with capability matrix, feature flags, diagnostics, and doc references, without a token', async () => {
    const { MemoryRouter } = modules.router;
    const pageModule = await server.ssrLoadModule('/src/pages/DevStorefrontDashboard.jsx');
    const Page = pageModule.default;

    const markup = renderToString(React.createElement(MemoryRouter, { initialEntries: ['/dev/storefront'] }, React.createElement(Page)));

    assert.match(markup, /Storefront Runtime Configuration/);
    assert.match(markup, /Capability Matrix/);
    assert.match(markup, /Feature Flags/);
    assert.match(markup, /Related Architecture Docs/);
    assert.match(markup, /unavailable/);
    assert.equal(markup.toLowerCase().includes('shpat'), false);
    assert.match(markup, /Store domain \(redacted\)/);
  });
});

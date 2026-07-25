import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');

// Every admin/dev/showcase path is always statically registered (never
// omitted) so it keeps outranking the dynamic /:verticalId(/:categoryId)
// template routes in React Router's path-specificity ranking — see the
// comment above these routes in App.jsx for why. Disabled routes resolve
// to <PageNotFound /> via a ternary rather than being unregistered.
const ADMIN_DEV_SHOWCASE_PATHS = [
  '/admin/debug',
  '/admin/login',
  '/admin',
  '/admin/quotes',
  '/admin/customers',
  '/admin/quote-builder',
  '/admin/pricing-imports',
  '/admin/shopify-sync',
  '/showcase',
  '/showcase/:categoryId',
  '/dev/storefront',
];

const guardedPaths = [
  '/admin/debug',
  '/admin/quotes',
  '/admin/customers',
  '/admin/quote-builder',
  '/admin/pricing-imports',
  '/admin/shopify-sync',
];

function routeElementSource(path) {
  const routeStart = appSource.indexOf(`path="${path}"`);
  assert.ok(routeStart !== -1, `route for ${path} not found in App.jsx`);
  // Find this route's own closing `} />` by tracking brace depth from the
  // `element={` that follows the path attribute, so we only inspect this
  // route's element expression and not the next route's.
  const elementStart = appSource.indexOf('element={', routeStart);
  assert.ok(elementStart !== -1, `no element prop found for ${path}`);
  let depth = 0;
  let i = elementStart + 'element={'.length - 1; // position of the opening brace
  for (; i < appSource.length; i++) {
    if (appSource[i] === '{') depth++;
    else if (appSource[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return appSource.slice(elementStart, i + 1);
}

describe('admin route lockdown (VITE_ADMIN_ENABLED)', () => {
  it('reads the flag from VITE_ADMIN_ENABLED, defaulting closed', () => {
    assert.match(
      appSource,
      /const ADMIN_SURFACE_ENABLED = import\.meta\.env\.VITE_ADMIN_ENABLED === ['"]true['"];/,
    );
  });

  for (const path of ADMIN_DEV_SHOWCASE_PATHS) {
    it(`registers ${path} statically and falls back to PageNotFound when disabled`, () => {
      const elementSource = routeElementSource(path);
      assert.match(
        elementSource,
        /ADMIN_SURFACE_ENABLED\s*\n?\s*\?/,
        `${path}'s element is not gated by ADMIN_SURFACE_ENABLED`,
      );
      assert.match(elementSource, /:\s*<PageNotFound \/>/, `${path} does not fall back to PageNotFound when disabled`);
    });
  }

  for (const path of guardedPaths) {
    it(`wraps ${path}'s enabled branch in AdminAuthGuard`, () => {
      const elementSource = routeElementSource(path);
      assert.match(elementSource, /<AdminAuthGuard/, `${path} is not wrapped in AdminAuthGuard`);
    });
  }

  it('does not register /admin, /admin/quotes, /admin/customers, or /admin/debug without a guard (regression check for the pre-fix unguarded routes)', () => {
    assert.doesNotMatch(appSource, /<Route path="\/admin\/debug" element=\{<AdminDebugSummary \/>\} \/>/);
    assert.doesNotMatch(appSource, /<Route path="\/admin\/quotes" element=\{<AdminQuotesPage \/>\} \/>/);
    assert.doesNotMatch(appSource, /<Route path="\/admin\/customers" element=\{<AdminCustomerWorkspace \/>\} \/>/);
    assert.doesNotMatch(appSource, /<Route path="\/admin\/pricing-imports" element=\{<AdminPricingImportDashboard \/>\} \/>/);
  });

  it('.env.example documents VITE_ADMIN_ENABLED', () => {
    const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
    assert.match(envExample, /VITE_ADMIN_ENABLED=/);
  });
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  modules = {
    cartWorkspace: await server.ssrLoadModule('/src/pages/CartWorkspace.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function line(overrides = {}) {
  return {
    id: 'line-1',
    productId: 'navigator-configurator',
    sku: 'NVG45Z-NFPA20',
    label: 'Navigator® Serial Light Bar',
    quantity: 1,
    unitPrice: { amount: 4639, currencyCode: 'USD' },
    lineTotal: { amount: 4639, currencyCode: 'USD' },
    availability: 'available',
    configurationStatus: 'complete',
    isPackage: false,
    source: 'configurator',
    ...overrides,
  };
}

describe('buildCartQuoteRequestPayload (PR-12/#321 — wires the cart quote flow to the delivery adapter)', () => {
  const CONTACT = { name: 'Jane Smith', agency: 'Metro PD', email: 'jane@metropd.gov' };

  it('returns null for an empty cart', () => {
    const { buildCartQuoteRequestPayload } = modules.cartWorkspace;
    assert.equal(buildCartQuoteRequestPayload([], CONTACT, 'sub-1'), null);
    assert.equal(buildCartQuoteRequestPayload(null, CONTACT, 'sub-1'), null);
  });

  it('covers every cart line in a single submission, not one quote per line', () => {
    const { buildCartQuoteRequestPayload } = modules.cartWorkspace;
    const lines = [line(), line({ id: 'line-2', sku: 'NAV-CABLE-10', label: '10 ft. Main Harness', quantity: 2, unitPrice: { amount: 28, currencyCode: 'USD' } })];

    const payload = buildCartQuoteRequestPayload(lines, CONTACT, 'sub-1');

    assert.equal(payload.lines.length, 2);
    assert.equal(payload.productTitle, 'Cart Quote Request (2 items)');
    assert.equal(payload.selectedSku, null);
    assert.equal(payload.source, 'cart');
    assert.equal(payload.contact, CONTACT);
    assert.equal(payload.submissionId, 'sub-1');
  });

  it('maps sku, label, quantity, and unit price from each cart line', () => {
    const { buildCartQuoteRequestPayload } = modules.cartWorkspace;
    const payload = buildCartQuoteRequestPayload([line({ quantity: 3 })], CONTACT, 'sub-1');

    assert.deepEqual(payload.lines[0], { sku: 'NVG45Z-NFPA20', label: 'Navigator® Serial Light Bar', quantity: 3, unitPrice: 4639 });
  });

  it('handles a single-item cart with correct singular wording', () => {
    const { buildCartQuoteRequestPayload } = modules.cartWorkspace;
    const payload = buildCartQuoteRequestPayload([line()], CONTACT, 'sub-1');
    assert.equal(payload.productTitle, 'Cart Quote Request (1 item)');
  });
});

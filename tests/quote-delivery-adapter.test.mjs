import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  modules = {
    adapter: await server.ssrLoadModule('/src/adapters/quoteDelivery/quoteDeliveryAdapter.ts'),
    service: await server.ssrLoadModule('/src/services/quoteRequestService.js'),
  };
});

after(async () => {
  await server?.close();
});

function fakeFetch(response) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    if (response instanceof Error) throw response;
    return response;
  };
  impl.calls = calls;
  return impl;
}

function jsonResponse({ ok = true, status = 200 } = {}) {
  return { ok, status };
}

function payload(overrides = {}) {
  return {
    productId: 'navigator',
    configuratorId: 'navigator-configurator',
    productTitle: 'Navigator Serial Light Bar',
    selectedOptions: [{ stepId: 'color', stepLabel: 'Color Config.', selected: ['Red / Blue'] }],
    accessories: [{ stepId: 'accessories', optionId: 'cable-10', optionLabel: '10 ft. Main Harness', priceModifier: 28 }],
    selectedSku: 'NAV-SLB-53-RB',
    matchingSkus: [],
    skuStatus: 'matched',
    skuPreview: 'NAV-SLB-53-RB',
    dependencyNotes: [],
    warningNotes: [],
    contact: { name: 'Jane Smith', agency: 'Metro PD', email: 'jane@metropd.gov', phone: '555-0100', vehicleCount: '12', notes: 'Q3 delivery' },
    submissionId: 'sub-1719000000000-abc123',
    timestamp: '2026-06-26T14:00:00.000Z',
    source: 'configurator-prototype',
    ...overrides,
  };
}

describe('Quote delivery adapter — mailto URL + body construction', () => {
  it('builds a mailto: URL addressed to the recipient with an encoded subject', () => {
    const { buildQuoteMailtoUrl } = modules.adapter;
    const url = buildQuoteMailtoUrl(payload(), 'QR-ABC123', 'quotes@tfrsupply.com');
    assert.match(url, /^mailto:quotes@tfrsupply\.com\?subject=/);
    assert.match(url, /QR-ABC123/);
  });

  it('builds an email body containing product, SKU, options, accessories, and contact fields', () => {
    const body = modules.adapter.buildQuoteEmailBody(payload(), 'QR-ABC123');

    assert.match(body, /Reference: QR-ABC123/);
    assert.match(body, /Product: Navigator Serial Light Bar/);
    assert.match(body, /SKU: NAV-SLB-53-RB/);
    assert.match(body, /Color Config\.: Red \/ Blue/);
    assert.match(body, /Accessories: 10 ft\. Main Harness/);
    assert.match(body, /Contact: Jane Smith — Metro PD/);
    assert.match(body, /Email: jane@metropd\.gov/);
    assert.match(body, /Phone: 555-0100/);
    assert.match(body, /Vehicle count: 12/);
    assert.match(body, /Notes: Q3 delivery/);
  });

  it('includes dependency notes and compatibility warnings when present', () => {
    const body = modules.adapter.buildQuoteEmailBody(
      payload({
        dependencyNotes: ['Mounting Type required because: Permanent Mount was selected.'],
        warningNotes: ['Advisory — Red/Blue + Amber: reduced visibility in fog.'],
      }),
      'QR-ABC123',
    );
    assert.match(body, /Dependency notes:/);
    assert.match(body, /- Mounting Type required because: Permanent Mount was selected\./);
    assert.match(body, /Compatibility warnings:/);
    assert.match(body, /- Advisory — Red\/Blue \+ Amber: reduced visibility in fog\./);
  });

  it('omits the advisory sections entirely when there are no notes', () => {
    const body = modules.adapter.buildQuoteEmailBody(payload(), 'QR-ABC123');
    assert.doesNotMatch(body, /Dependency notes:/);
    assert.doesNotMatch(body, /Compatibility warnings:/);
  });

  it('omits optional contact fields when absent', () => {
    const body = modules.adapter.buildQuoteEmailBody(
      payload({ contact: { name: 'Jane Smith', agency: 'Metro PD', email: 'jane@metropd.gov' } }),
      'QR-ABC123',
    );
    assert.doesNotMatch(body, /Phone:/);
    assert.doesNotMatch(body, /Vehicle count:/);
    assert.doesNotMatch(body, /Notes:/);
  });
});

describe('Quote delivery adapter — mailto fallback (no endpoint configured)', () => {
  it('opens a mailto link and reports honest success without claiming server delivery', async () => {
    const { createQuoteDeliveryAdapter } = modules.adapter;
    const opened = [];
    const fetchImpl = fakeFetch(jsonResponse());
    const adapter = createQuoteDeliveryAdapter({ recipientEmail: 'quotes@tfrsupply.com' }, fetchImpl, (url) => opened.push(url));

    const result = await adapter.submitQuoteRequest(payload());

    assert.equal(fetchImpl.calls.length, 0, 'fetch must not be called when no endpoint is configured');
    assert.equal(opened.length, 1);
    assert.equal(result.success, true);
    assert.equal(result.deliveryMethod, 'mailto');
    assert.equal(result.referenceId, 'QR-ABC123');
    assert.equal(result.mailtoUrl, opened[0]);
    assert.match(result.mailtoUrl, /^mailto:quotes@tfrsupply\.com\?/);
  });
});

describe('Quote delivery adapter — hosted form endpoint configured', () => {
  it('POSTs the payload and reports success on a 2xx response', async () => {
    const { createQuoteDeliveryAdapter } = modules.adapter;
    const opened = [];
    const fetchImpl = fakeFetch(jsonResponse({ ok: true, status: 200 }));
    const adapter = createQuoteDeliveryAdapter(
      { endpoint: 'https://formspree.io/f/abc123', recipientEmail: 'quotes@tfrsupply.com' },
      fetchImpl,
      (url) => opened.push(url),
    );

    const result = await adapter.submitQuoteRequest(payload());

    assert.equal(opened.length, 0, 'mailto must not open when the hosted form succeeds');
    assert.equal(fetchImpl.calls.length, 1);
    assert.equal(fetchImpl.calls[0].url, 'https://formspree.io/f/abc123');
    assert.equal(fetchImpl.calls[0].init.method, 'POST');
    assert.equal(result.success, true);
    assert.equal(result.deliveryMethod, 'hosted-form');
    assert.equal(result.referenceId, 'QR-ABC123');
  });

  it('reports honest failure (not a fake success) on a non-2xx response, without falling back to mailto', async () => {
    const { createQuoteDeliveryAdapter } = modules.adapter;
    const opened = [];
    const fetchImpl = fakeFetch(jsonResponse({ ok: false, status: 500 }));
    const adapter = createQuoteDeliveryAdapter(
      { endpoint: 'https://formspree.io/f/abc123', recipientEmail: 'quotes@tfrsupply.com' },
      fetchImpl,
      (url) => opened.push(url),
    );

    const result = await adapter.submitQuoteRequest(payload());

    assert.equal(result.success, false);
    assert.equal(result.deliveryMethod, 'hosted-form');
    assert.match(result.error, /500/);
    assert.equal(opened.length, 0);
  });

  it('reports a network error message when fetch throws', async () => {
    const { createQuoteDeliveryAdapter } = modules.adapter;
    const fetchImpl = fakeFetch(new TypeError('network down'));
    const adapter = createQuoteDeliveryAdapter(
      { endpoint: 'https://formspree.io/f/abc123', recipientEmail: 'quotes@tfrsupply.com' },
      fetchImpl,
    );

    const result = await adapter.submitQuoteRequest(payload());

    assert.equal(result.success, false);
    assert.equal(result.error, 'network down');
  });
});

describe('quoteRequestService — outcome mapping and wiring', () => {
  it('validates required contact fields', () => {
    const { validateContactForm } = modules.service;
    const { valid, errors } = validateContactForm({ name: '', agency: '', email: 'not-an-email' });
    assert.equal(valid, false);
    assert.equal(errors.name, 'Full name is required.');
    assert.equal(errors.agency, 'Agency or company is required.');
    assert.equal(errors.email, 'Enter a valid email address.');
  });

  it('accepts a fully-populated contact form', () => {
    const { validateContactForm } = modules.service;
    const { valid, errors } = validateContactForm({ name: 'Jane', agency: 'Metro PD', email: 'jane@metropd.gov' });
    assert.equal(valid, true);
    assert.deepEqual(errors, {});
  });

  it('delegates submission to the live quote delivery adapter and returns its result shape', async () => {
    const { submitQuoteRequest, buildQuotePayload, generateSubmissionId } = modules.service;
    const submissionId = generateSubmissionId();
    assert.match(submissionId, /^sub-\d+-[a-z0-9]{6}$/);

    const built = buildQuotePayload(
      { id: 'session-1' },
      { resolvedSelections: [], accessories: [], depRequirements: [], violations: [], selectedSku: 'NAV-SLB-53-RB', matchingSkus: [], skuStatus: 'matched' },
      { productId: 'navigator', configuratorId: 'navigator-configurator', productTitle: 'Navigator' },
      { name: 'Jane Smith', agency: 'Metro PD', email: 'jane@metropd.gov' },
      submissionId,
    );
    assert.equal(built.submissionId, submissionId);

    // No VITE_QUOTE_DELIVERY_ENDPOINT is set in the test environment, so the
    // live singleton falls back to the mailto path (window is undefined
    // under SSR, so opening it is a safe no-op).
    const result = await submitQuoteRequest(built);
    assert.equal(result.success, true);
    assert.equal(result.deliveryMethod, 'mailto');
    assert.ok(result.referenceId.startsWith('QR-'));
  });
});

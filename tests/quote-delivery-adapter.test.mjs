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

  it('generates a stable-format submission ID', () => {
    const { generateSubmissionId } = modules.service;
    assert.match(generateSubmissionId(), /^sub-\d+-[a-z0-9]{6}$/);
  });

  it('delegates submission to the live quote delivery adapter and returns its result shape', async () => {
    const { submitQuoteRequest, generateSubmissionId } = modules.service;
    const submissionId = generateSubmissionId();

    // No VITE_QUOTE_DELIVERY_ENDPOINT is set in the test environment, so the
    // live singleton falls back to the mailto path (window is undefined
    // under SSR, so opening it is a safe no-op).
    const result = await submitQuoteRequest(payload({ submissionId }));
    assert.equal(result.success, true);
    assert.equal(result.deliveryMethod, 'mailto');
    assert.ok(result.referenceId.startsWith('QR-'));
  });
});

describe('Quote delivery adapter — vehicle context and cart-line quotes', () => {
  it('includes a vehicle line in the email body when vehicleSummary is set', () => {
    const body = modules.adapter.buildQuoteEmailBody(payload({ vehicleSummary: '2024 Ford F-550' }), 'QR-ABC123');
    assert.match(body, /Vehicle: 2024 Ford F-550/);
  });

  it('omits the vehicle line when vehicleSummary is absent', () => {
    const body = modules.adapter.buildQuoteEmailBody(payload(), 'QR-ABC123');
    assert.doesNotMatch(body, /Vehicle:/);
  });

  it('renders a Cart Lines section instead of a single SKU when lines is set', () => {
    const body = modules.adapter.buildQuoteEmailBody(
      payload({
        selectedSku: null,
        skuPreview: null,
        selectedOptions: [],
        accessories: [],
        productTitle: 'Cart Quote Request (2 items)',
        lines: [
          { sku: 'NAV-SLB-53-RB', label: 'Navigator Serial Light Bar', quantity: 1, unitPrice: 4639 },
          { sku: 'NAV-CABLE-10', label: '10 ft. Main Harness', quantity: 2 },
        ],
      }),
      'QR-ABC123',
    );
    assert.doesNotMatch(body, /^SKU:/m);
    assert.match(body, /Cart Lines:/);
    assert.match(body, /- Navigator Serial Light Bar \(SKU NAV-SLB-53-RB\) x1 — \$4639\.00 each/);
    assert.match(body, /- 10 ft\. Main Harness \(SKU NAV-CABLE-10\) x2/);
  });

  it('includes each cart line\'s note (e.g. configured accessories/vehicle) on an indented line beneath it', () => {
    const body = modules.adapter.buildQuoteEmailBody(
      payload({
        selectedSku: null,
        skuPreview: null,
        lines: [
          { sku: 'NVG45Z-NFPA20', label: 'Navigator Light Bar', quantity: 1, unitPrice: 4639, note: 'Accessories: NAV-CABLE-10 — Vehicle: 2024 Ford F-550' },
        ],
      }),
      'QR-ABC123',
    );
    assert.match(body, /- Navigator Light Bar \(SKU NVG45Z-NFPA20\) x1 — \$4639\.00 each/);
    assert.match(body, /^ {4}Accessories: NAV-CABLE-10 — Vehicle: 2024 Ford F-550$/m);
  });

  it('includes a Quantity line for the single-SKU shape when quantity is set', () => {
    const body = modules.adapter.buildQuoteEmailBody(payload({ quantity: 5 }), 'QR-ABC123');
    assert.match(body, /Quantity: 5/);
  });

  it('omits the Quantity line when quantity is not set', () => {
    const body = modules.adapter.buildQuoteEmailBody(payload(), 'QR-ABC123');
    assert.doesNotMatch(body, /Quantity:/);
  });
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    modal: await server.ssrLoadModule('/src/components/quoteDelivery/QuoteContactModal.tsx'),
  };
});

after(async () => {
  await server?.close();
});

function samplePayload(contact, submissionId) {
  return {
    productId: 'navigator',
    configuratorId: 'navigator-configurator',
    productTitle: 'Navigator',
    selectedOptions: [],
    accessories: [],
    selectedSku: 'NAV-SLB-53-RB',
    matchingSkus: [],
    skuStatus: 'matched',
    dependencyNotes: [],
    warningNotes: [],
    contact,
    submissionId,
    timestamp: '2026-06-26T14:00:00.000Z',
    source: 'configurator-pdp',
  };
}

describe('QuoteContactModal (shared contact-capture UI, PR-12/#321)', () => {
  it('renders the title, description, and required contact fields', () => {
    const { default: QuoteContactModal } = modules.modal;
    const html = renderToString(React.createElement(QuoteContactModal, {
      onClose: () => {},
      title: 'Request a Quote — Navigator',
      description: 'Selected SKU: NAV-SLB-53-RB',
      buildPayload: samplePayload,
    }));

    assert.match(html, /Request a Quote — Navigator/);
    assert.match(html, /Selected SKU: NAV-SLB-53-RB/);
    assert.match(html, /Full Name/);
    assert.match(html, /Agency \/ Company/);
    assert.match(html, /Email Address/);
    assert.match(html, /Submit Quote Request/);
  });

  it('renders a close control', () => {
    const { default: QuoteContactModal } = modules.modal;
    const html = renderToString(React.createElement(QuoteContactModal, {
      onClose: () => {},
      title: 'Request a Quote',
      buildPayload: samplePayload,
    }));

    assert.match(html, /aria-label="Close"/);
  });

  it('renders without a description when none is provided', () => {
    const { default: QuoteContactModal } = modules.modal;
    const html = renderToString(React.createElement(QuoteContactModal, {
      onClose: () => {},
      title: 'Request a Quote',
      buildPayload: samplePayload,
    }));

    assert.match(html, /Request a Quote/);
  });
});

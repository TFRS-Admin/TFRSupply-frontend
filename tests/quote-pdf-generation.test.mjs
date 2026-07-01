import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const draft = {
  id: 'draft-001',
  label: 'Patrol vehicle quote draft',
  customer: {
    customerId: 'customer-001',
    agencyName: 'Example Police Department',
    contactEmail: 'buyer@example.gov',
  },
  verticalId: 'police',
  lines: [{
    id: 'line-001',
    label: 'Patrol vehicle warning package',
    quantity: 1,
    lineType: 'package',
    packageReference: { packageId: 'pkg-patrol-warning', packageRevision: 'rev-a' },
  }],
  workflow: { status: 'ready-for-review', approvalStatus: 'draft' },
};

const documentMetadata = { title: 'Example Police Department Quote', templateId: 'quote-standard-v1' };

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    renderer: await server.ssrLoadModule('/src/adapters/quotePdf/quotePdfRenderer.ts'),
    adapter: await server.ssrLoadModule('/src/adapters/quotePdf/index.ts'),
    service: await server.ssrLoadModule('/src/services/quotePdf/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/quotePdf.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/quotePdf/index.ts'),
  };
});

after(async () => {
  await server?.close();
});

describe('Quote PDF generation architecture', () => {
  it('validates quote PDF render input with draft, document metadata, and options', () => {
    const { quotePdfRenderInputSchema } = modules.schemas;

    const parsed = quotePdfRenderInputSchema.parse({
      draft,
      documentMetadata,
      options: { includePricing: true, includeReviewFlags: true },
    });

    assert.equal(parsed.draft.customer.agencyName, 'Example Police Department');
    assert.equal(parsed.documentMetadata.templateId, 'quote-standard-v1');
    assert.equal(parsed.options.includePricing, true);
  });

  it('rejects quote PDF input with no quote lines', () => {
    const { quotePdfRenderInputSchema } = modules.schemas;

    assert.throws(() => quotePdfRenderInputSchema.parse({
      draft: { ...draft, lines: [] },
      documentMetadata,
    }), /at least one quote line/);
  });

  it('rejects quote PDF input with no way to address the customer', () => {
    const { quotePdfRenderInputSchema } = modules.schemas;

    assert.throws(() => quotePdfRenderInputSchema.parse({
      draft: { ...draft, customer: { customerId: 'customer-002' } },
      documentMetadata,
    }), /agency name, contact name, or contact email/);
  });

  it('keeps the default renderer and adapter unavailable and side-effect free', async () => {
    const { quotePdfService } = modules.service;

    const result = await quotePdfService.generateQuotePdf({ draft, documentMetadata });

    assert.equal(result.status, 'unavailable');
    assert.equal(result.documentMetadata, null);
    assert.equal(result.errors[0].code, 'QUOTE_PDF_RENDERER_UNAVAILABLE');
  });

  it('carries draft review flags into the render result regardless of renderer status', async () => {
    const { createQuotePdfAdapter } = modules.adapter;
    const adapter = createQuotePdfAdapter({
      async renderDocument(input) {
        return {
          status: 'rendered',
          documentMetadata: {
            ...input.documentMetadata,
            fileName: 'example-quote.pdf',
            generatedAt: '2026-07-01T00:00:00.000Z',
            contentType: 'application/pdf',
          },
          errors: [],
        };
      },
    });

    const flaggedDraft = { ...draft, reviewFlags: [{ code: 'LOW_MARGIN', severity: 'warning', message: 'Margin below target.' }] };
    const result = await adapter.renderQuotePdf({ draft: flaggedDraft, documentMetadata });

    assert.equal(result.status, 'rendered');
    assert.equal(result.documentMetadata.fileName, 'example-quote.pdf');
    assert.equal(result.reviewFlags[0].code, 'LOW_MARGIN');
  });

  it('reports structured validation errors without throwing', () => {
    const { quotePdfService } = modules.service;

    const validation = quotePdfService.validateQuotePdfInput({
      draft: { ...draft, lines: [] },
      documentMetadata,
    });

    assert.equal(validation.valid, false);
    assert.equal(validation.errors[0].code, 'QUOTE_PDF_INVALID_INPUT');
  });

  it('exports typed hook entry points for future UI migration', () => {
    assert.equal(typeof modules.hooks.useQuotePdfRender, 'function');
    assert.equal(typeof modules.hooks.useQuotePdfValidation, 'function');
    assert.equal(typeof modules.renderer.unavailableQuotePdfRenderer.renderDocument, 'function');
    assert.equal(typeof modules.adapter.unavailableQuotePdfAdapter.renderQuotePdf, 'function');
  });
});

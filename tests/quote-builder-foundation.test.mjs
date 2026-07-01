import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    adapter: await server.ssrLoadModule('/src/adapters/quoteBuilder/index.ts'),
    service: await server.ssrLoadModule('/src/services/quoteBuilder/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/quoteBuilder/index.ts'),
  };
});

after(async () => {
  await server?.close();
});

describe('Quote Builder foundation', () => {
  it('validates quote assembly contracts with customer metadata, package references, pricing references, and workflow state', () => {
    const { quoteAssemblyInputSchema } = modules.schemas;

    const parsed = quoteAssemblyInputSchema.parse({
      draftId: 'draft-001',
      customer: {
        customerId: 'customer-001',
        agencyName: 'Example Police Department',
        contactEmail: 'buyer@example.gov',
      },
      verticalId: 'police',
      lines: [{
        id: 'line-001',
        lineType: 'package',
        label: 'Patrol vehicle warning package',
        quantity: 1,
        packageReference: { packageId: 'pkg-patrol-warning', packageRevision: 'rev-a' },
        pricingReference: { pricingRequestId: 'pricing-001', status: 'pending' },
      }],
      packageReferences: [{ packageId: 'pkg-patrol-warning', packageName: 'Patrol Warning Package' }],
      pricingReference: { pricingRequestId: 'pricing-quote-001', status: 'pending' },
      workflow: { status: 'draft', approvalStatus: 'draft' },
    });

    assert.equal(parsed.customer.agencyName, 'Example Police Department');
    assert.equal(parsed.lines[0].packageReference.packageId, 'pkg-patrol-warning');
    assert.equal(parsed.workflow.status, 'draft');
  });

  it('rejects quote line assembly without a SKU, product, package, custom, or service target', () => {
    const { quoteAssemblyInputSchema } = modules.schemas;

    assert.throws(() => quoteAssemblyInputSchema.parse({
      customer: { agencyName: 'Example Fire Department' },
      lines: [{ lineType: 'product', label: 'Incomplete line', quantity: 1 }],
    }), /Quote line assembly requires/);
  });

  it('keeps the default adapter unavailable and side-effect free', async () => {
    const { quoteBuilderService } = modules.service;

    assert.equal(await quoteBuilderService.getDraft('missing-draft'), null);

    const result = await quoteBuilderService.assembleQuote({
      customer: { agencyName: 'Example Public Works' },
      lines: [{ lineType: 'custom', label: 'Custom upfit review', quantity: 1 }],
    });

    assert.equal(result.status, 'unavailable');
    assert.equal(result.draft, null);
    assert.equal(result.reviewFlags[0].code, 'QUOTE_BUILDER_UNAVAILABLE');
  });

  it('exports typed hook entry points for future UI migration', () => {
    assert.equal(typeof modules.hooks.useQuoteDraft, 'function');
    assert.equal(typeof modules.hooks.useQuoteAssembly, 'function');
    assert.equal(typeof modules.hooks.useQuoteValidation, 'function');
    assert.equal(typeof modules.adapter.unavailableQuoteBuilderAdapter.assembleQuote, 'function');
  });
});

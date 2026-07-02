import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    approval: await server.ssrLoadModule('/src/services/quoteApproval/index.ts'),
    persistence: await server.ssrLoadModule('/src/services/quotePersistence/index.ts'),
    adapter: await server.ssrLoadModule('/src/adapters/quotePersistence/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

function quote(overrides = {}) {
  return {
    id: 'quote-approval-001',
    label: 'Approval Quote 001',
    customerId: 'customer-1',
    customer: { customerId: 'customer-1', agencyName: 'Example Police Department', contactEmail: 'buyer@example.gov' },
    verticalId: 'police',
    status: 'ready-for-review',
    approvalStatus: 'draft',
    workflow: { status: 'ready-for-review', approvalStatus: 'draft', reviewFlags: [] },
    lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 1, sku: 'NAV-SKU', productId: 'navigator' }],
    total: { amount: 900, currencyCode: 'USD' },
    ...overrides,
  };
}

async function createServices(seedQuote = quote()) {
  const repository = modules.adapter.createInMemoryQuoteRepository();
  const persistence = modules.persistence.createQuotePersistenceService(repository);
  await persistence.saveQuote({ quote: seedQuote, revision: { savedAt: '2026-07-02T00:00:00.000Z', savedBy: 'agent', source: 'test' } });
  return { persistence, approval: modules.approval.createQuoteApprovalService(persistence) };
}

describe('Quote approval workflow service', () => {
  it('submits a quote for review, assigns a reviewer, and records an audit event', async () => {
    const { approval } = await createServices();

    const result = await approval.submitForReview({
      quoteId: 'quote-approval-001',
      expectedVersion: 1,
      actorId: 'sales-1',
      occurredAt: '2026-07-02T01:00:00.000Z',
      reviewer: { reviewerId: 'reviewer-1', assignedBy: 'sales-1', note: 'Please review margin.' },
    });

    assert.equal(result.status, 'updated');
    assert.equal(result.currentVersion, 2);
    assert.equal(result.state.quote.status, 'in-review');
    assert.equal(result.state.quote.approvalStatus, 'pending-review');
    assert.equal(result.state.quote.workflow.reviewerAssignment.reviewerId, 'reviewer-1');
    assert.equal(result.state.auditTrail[0].type, 'submit-for-review');
    assert.equal(modules.schemas.quoteApprovalActionResultSchema.parse(result).state.revision.version, 2);
  });

  it('approves an in-review quote while preserving revision metadata and audit history', async () => {
    const { approval } = await createServices();
    await approval.submitForReview({ quoteId: 'quote-approval-001', expectedVersion: 1, actorId: 'sales-1', occurredAt: '2026-07-02T01:00:00.000Z' });

    const result = await approval.approveQuote({ quoteId: 'quote-approval-001', expectedVersion: 2, actorId: 'reviewer-1', occurredAt: '2026-07-02T02:00:00.000Z', note: 'Approved.' });

    assert.equal(result.status, 'updated');
    assert.equal(result.state.revision.version, 3);
    assert.equal(result.state.revision.savedBy, 'reviewer-1');
    assert.equal(result.state.quote.workflow.approvedAt, '2026-07-02T02:00:00.000Z');
    assert.deepEqual(result.state.auditTrail.map((event) => event.type), ['submit-for-review', 'approve']);
  });

  it('rejects invalid transitions without mutating the quote', async () => {
    const { approval, persistence } = await createServices();

    const result = await approval.approveQuote({ quoteId: 'quote-approval-001', expectedVersion: 1, actorId: 'reviewer-1', occurredAt: '2026-07-02T02:00:00.000Z' });
    const loaded = await persistence.loadQuote('quote-approval-001');

    assert.equal(result.status, 'invalid-transition');
    assert.equal(result.reviewFlags[0].code, 'approval.invalid_transition');
    assert.equal(loaded.record.revision.version, 1);
    assert.equal(loaded.record.quote.status, 'ready-for-review');
  });

  it('supports reviewer reassignment, change requests, rejection, cancellation, and conflicts', async () => {
    const { approval } = await createServices();
    await approval.submitForReview({ quoteId: 'quote-approval-001', expectedVersion: 1, actorId: 'sales-1', occurredAt: '2026-07-02T01:00:00.000Z' });

    const assigned = await approval.assignReviewer({ quoteId: 'quote-approval-001', expectedVersion: 2, actorId: 'manager-1', occurredAt: '2026-07-02T01:15:00.000Z', reviewer: { reviewerId: 'reviewer-2', assignedBy: 'manager-1' } });
    const changes = await approval.requestChanges({ quoteId: 'quote-approval-001', expectedVersion: 3, actorId: 'reviewer-2', reason: 'Missing accessory validation.', occurredAt: '2026-07-02T01:30:00.000Z' });
    const conflict = await approval.rejectQuote({ quoteId: 'quote-approval-001', expectedVersion: 3, actorId: 'reviewer-2', reason: 'Stale action.', occurredAt: '2026-07-02T01:45:00.000Z' });
    const cancelled = await approval.cancelApproval({ quoteId: 'quote-approval-001', expectedVersion: 4, actorId: 'sales-1', reason: 'Customer paused.', occurredAt: '2026-07-02T02:00:00.000Z' });

    assert.equal(assigned.state.quote.workflow.reviewerAssignment.reviewerId, 'reviewer-2');
    assert.equal(changes.state.quote.approvalStatus, 'changes-requested');
    assert.equal(conflict.status, 'conflict');
    assert.equal(cancelled.state.quote.status, 'cancelled');
    assert.deepEqual(cancelled.state.auditTrail.map((event) => event.type), ['submit-for-review', 'assign-reviewer', 'request-changes', 'cancel-approval']);
  });
});

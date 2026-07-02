import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/emailNotification/index.ts'),
    adapter: await server.ssrLoadModule('/src/adapters/emailNotification/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/emailNotification/index.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/quote.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

function quote() {
  return {
    id: 'quote-email-001',
    label: 'Email Quote 001',
    customerId: 'customer-1',
    customer: { customerId: 'customer-1', agencyName: 'Example Police Department', contactName: 'Buyer', contactEmail: 'buyer@example.gov' },
    status: 'in-review',
    approvalStatus: 'pending-review',
    workflow: { status: 'in-review', approvalStatus: 'pending-review', reviewFlags: [] },
    lines: [{ id: 'line-1', lineType: 'product', label: 'Navigator Lightbar', quantity: 1, sku: 'NAV-SKU' }],
  };
}

describe('Email notification service architecture', () => {
  it('maps every quote approval action to a notification event and template contract', () => {
    const service = modules.service.createEmailNotificationService();
    const actions = ['submit-for-review', 'assign-reviewer', 'approve', 'reject', 'request-changes', 'cancel-approval'];

    assert.deepEqual(actions.map((action) => service.mapApprovalAction(action).eventType), [
      'quote.submitted_for_review',
      'quote.reviewer_assigned',
      'quote.approved',
      'quote.rejected',
      'quote.changes_requested',
      'quote.approval_cancelled',
    ]);
    assert.equal(service.templates.length, 6);
  });

  it('validates requests and returns a queued dry-run result without provider delivery', async () => {
    const service = modules.service.createEmailNotificationService();
    const result = await service.notify({
      eventType: 'quote.approved',
      recipients: [{ email: 'buyer@example.gov', role: 'requestor' }],
      context: { quote: quote(), actorId: 'reviewer-1' },
    });

    assert.equal(result.status, 'queued');
    assert.equal(result.templateId, 'quote-approved-v1');
    assert.equal(modules.schemas.emailNotificationResultSchema.parse(result).recipients[0].email, 'buyer@example.gov');
  });

  it('establishes an unavailable provider adapter boundary for non-dry-run delivery', async () => {
    const service = modules.service.createEmailNotificationService({ provider: modules.adapter.unavailableEmailProviderAdapter });
    const result = await service.notify({
      eventType: 'quote.rejected',
      dryRun: false,
      recipients: [{ email: 'buyer@example.gov', role: 'requestor' }],
      context: { quote: quote(), reason: 'Margin below threshold.' },
    });

    assert.equal(result.status, 'unavailable');
    assert.equal(result.reviewFlags[0].code, 'email.provider_unavailable');
  });

  it('derives quote recipients and exports typed hooks', () => {
    const service = modules.service.createEmailNotificationService();
    const recipients = service.recipientsForQuote({ context: { quote: quote(), reviewerAssignment: { reviewerId: 'reviewer-1', assignedBy: 'sales-1', assignedAt: '2026-07-02T00:00:00.000Z' } } });

    assert.equal(recipients.length, 2);
    assert.equal(recipients[0].role, 'requestor');
    assert.equal(typeof modules.hooks.useEmailNotification, 'function');
    assert.equal(typeof modules.hooks.useQuoteNotificationTemplates, 'function');
  });
});

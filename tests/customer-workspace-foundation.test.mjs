import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  modules = {
    types: await server.ssrLoadModule('/src/types/customerWorkspace.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/customerWorkspace.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/customerWorkspace/index.ts'),
    service: await server.ssrLoadModule('/src/services/customerWorkspace/index.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/customerWorkspace/index.ts'),
  };
});
after(async () => { await server?.close(); });

describe('Customer Workspace Foundation', () => {
  it('validates the mock adapter fixtures against the public schemas', async () => {
    const records = await modules.adapters.mockCustomerWorkspaceAdapter.listCustomers();
    assert.ok(records.length >= 5);
    for (const record of records) {
      assert.doesNotThrow(() => modules.schemas.customerWorkspaceRecordSchema.parse(record));
    }
  });

  it('retrieves a single customer record by id and returns null for unknown ids', async () => {
    const record = await modules.adapters.mockCustomerWorkspaceAdapter.getCustomer('customer-metro-pd');
    assert.equal(record.customer.agencyName, 'Metro Police Department');
    const missing = await modules.adapters.mockCustomerWorkspaceAdapter.getCustomer('customer-does-not-exist');
    assert.equal(missing, null);
  });

  it('lists activity for a customer ordered most-recent first', async () => {
    const activity = await modules.adapters.mockCustomerWorkspaceAdapter.listActivity('customer-metro-pd');
    assert.ok(activity.length >= 3);
    for (let i = 1; i < activity.length; i += 1) {
      assert.ok(activity[i - 1].occurredAt >= activity[i].occurredAt);
    }
  });

  it('the unavailable adapter returns empty results without any live data source', async () => {
    const { unavailableCustomerWorkspaceAdapter } = modules.adapters;
    assert.deepEqual(await unavailableCustomerWorkspaceAdapter.listCustomers(), []);
    assert.equal(await unavailableCustomerWorkspaceAdapter.getCustomer('customer-metro-pd'), null);
    assert.deepEqual(await unavailableCustomerWorkspaceAdapter.listActivity('customer-metro-pd'), []);
  });

  it('builds a schema-valid customer summary with quote count and recency derived from activity', async () => {
    const record = await modules.adapters.mockCustomerWorkspaceAdapter.getCustomer('customer-metro-pd');
    const activity = await modules.adapters.mockCustomerWorkspaceAdapter.listActivity('customer-metro-pd');
    const summary = modules.service.buildCustomerWorkspaceSummary(record, activity);
    assert.doesNotThrow(() => modules.schemas.customerWorkspaceSummarySchema.parse(summary));
    assert.equal(summary.quoteCount, activity.filter((entry) => entry.kind === 'quote-created').length);
    assert.equal(summary.lastActivityAt, activity[0].occurredAt);
  });

  it('lists every fixture customer as a ready result via the default service', async () => {
    const result = await modules.service.customerWorkspaceService.listCustomers();
    assert.equal(result.status, 'ready');
    assert.equal(result.summaries.length, result.total);
    assert.ok(result.total >= 5);
  });

  it('searches customers by agency, contact, and email text', async () => {
    const byAgency = await modules.service.customerWorkspaceService.searchCustomers({ query: 'Metro Police' });
    assert.equal(byAgency.summaries.length, 1);
    assert.equal(byAgency.summaries[0].customerId, 'customer-metro-pd');

    const byEmail = await modules.service.customerWorkspaceService.searchCustomers({ query: 'ncfire.example.org' });
    assert.equal(byEmail.summaries[0].customerId, 'customer-north-county-fire');

    const noMatch = await modules.service.customerWorkspaceService.searchCustomers({ query: 'no-such-customer' });
    assert.equal(noMatch.status, 'empty');
    assert.equal(noMatch.summaries.length, 0);
  });

  it('filters customers by status, vertical, and Shopify sync status', async () => {
    const activeOnly = await modules.service.customerWorkspaceService.filterCustomers({ status: ['active'] });
    assert.ok(activeOnly.summaries.every((summary) => summary.record.status === 'active'));

    const policeOnly = await modules.service.customerWorkspaceService.filterCustomers({ verticalId: 'police' });
    assert.ok(policeOnly.summaries.every((summary) => summary.record.verticalId === 'police'));

    const failedSync = await modules.service.customerWorkspaceService.filterCustomers({ shopifySyncStatus: ['failed'] });
    assert.equal(failedSync.summaries.length, 1);
    assert.equal(failedSync.summaries[0].customerId, 'customer-north-county-fire');
  });

  it('combines a search query with a structured filter', async () => {
    const result = await modules.service.customerWorkspaceService.searchCustomers({ query: 'Fleet', filter: { status: ['active'] } });
    assert.ok(result.summaries.length > 0);
    assert.ok(result.summaries.every((summary) => summary.record.status === 'active'));
    assert.ok(result.summaries.every((summary) => /fleet/i.test(`${summary.record.customer.agencyName ?? ''} ${summary.record.customer.contactEmail ?? ''}`)));
  });

  it('retrieves a single customer detail result, found and not-found', async () => {
    const found = await modules.service.customerWorkspaceService.getCustomer('customer-metro-pd');
    assert.equal(found.status, 'found');
    assert.equal(found.summary.record.customer.agencyName, 'Metro Police Department');

    const notFound = await modules.service.customerWorkspaceService.getCustomer('customer-does-not-exist');
    assert.equal(notFound.status, 'not-found');
    assert.equal(notFound.summary, null);
  });

  it('exposes recent customer activity independently of the summary view', async () => {
    const activity = await modules.service.customerWorkspaceService.getCustomerActivity('customer-riverside-ems');
    assert.ok(activity.length >= 2);
    assert.ok(activity.every((entry) => entry.customerId === 'customer-riverside-ems'));
  });

  it('reports an unavailable list status when the injected adapter has no customers', async () => {
    const emptyService = modules.service.createCustomerWorkspaceService(modules.adapters.unavailableCustomerWorkspaceAdapter);
    const result = await emptyService.listCustomers();
    assert.equal(result.status, 'unavailable');
    assert.equal(result.total, 0);
  });

  it('exposes typed hook entry points', () => {
    assert.equal(typeof modules.hooks.useCustomerWorkspace, 'function');
    assert.equal(typeof modules.hooks.useCustomerSearch, 'function');
  });
});

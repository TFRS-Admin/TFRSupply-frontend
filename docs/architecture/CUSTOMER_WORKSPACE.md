# Customer Workspace Foundation

The Customer Workspace Foundation is the central place for viewing, searching, filtering, and reviewing customer records at `/admin/customers`. It is an architecture-first implementation using deterministic in-memory fixtures — no backend, database, or live Shopify calls exist yet. It is the foundation future Quote Builder, CRM, Shopify Customer Sync, and Sales Dashboard features will consume, so it reuses existing customer, quote, and Shopify customer contracts rather than introducing a parallel customer model.

## Architecture

```text
AdminCustomerWorkspace page → useCustomerWorkspace / useCustomerSearch → customerWorkspaceService → CustomerWorkspaceAdapter → future customer data provider
                                                                                  │
                                                                      customer workspace schemas / types
                                                                                  │
                                                          QuoteCustomerMetadata (quote.ts) / ShopifyCustomerSyncStatus (shopifyCustomer.ts) by contract only
```

- `src/types/customerWorkspace.ts` owns `CustomerWorkspaceRecord`, `CustomerWorkspaceSummary`, `CustomerWorkspaceActivity`, `CustomerWorkspaceStatus`, `CustomerWorkspaceSearch`, `CustomerWorkspaceFilter`, and the list/detail result envelopes. It reuses `QuoteCustomerMetadata` (`src/types/quote.ts`) for contact fields and `ShopifyCustomerSyncStatus` (`src/types/shopifyCustomer.ts`) for sync state instead of redefining either.
- `src/schemas/customerWorkspace.schema.ts` provides runtime Zod validation for every public contract, composing `quoteCustomerMetadataSchema` and `shopifyCustomerSyncStatusSchema` rather than duplicating their shapes.
- `src/adapters/customerWorkspace/` owns the adapter boundary — `CustomerWorkspaceAdapter` interface, `mockCustomerWorkspaceAdapter` (deterministic fixtures), and `unavailableCustomerWorkspaceAdapter` (the default when no data source is injected).
- `src/services/customerWorkspace/customerWorkspaceService.ts` owns listing, searching, filtering, detail retrieval, and summary/activity aggregation.
- `src/hooks/customerWorkspace/` owns `useCustomerWorkspace()` and `useCustomerSearch()`, the only layer allowed to call the service from React.
- `src/pages/AdminCustomerWorkspace.jsx` renders the `/admin/customers` list, search box, status filter chips, and a read-only customer detail modal.

## Adapter Boundary

`CustomerWorkspaceAdapter` (`src/adapters/customerWorkspace/customerWorkspaceAdapter.ts`) is the only boundary a future customer data provider (database, CRM, or Shopify customer sync) should implement:

```ts
interface CustomerWorkspaceAdapter {
  listCustomers(): Promise<CustomerWorkspaceRecord[]>;
  getCustomer(customerId: string): Promise<CustomerWorkspaceRecord | null>;
  listActivity(customerId: string): Promise<CustomerWorkspaceActivity[]>;
}
```

- `mockCustomerWorkspaceAdapter` reads six deterministic customer fixtures spanning all three verticals (police, fire-ems, work-truck), varied `CustomerWorkspaceStatus` and `ShopifyCustomerSyncStatus` values, and a matching per-customer activity log (`src/adapters/customerWorkspace/customerWorkspaceFixtures.ts`). It is the default adapter behind `customerWorkspaceService`, the same "mock adapter wired in by default so the route works out of the box" pattern used by `adminAuthenticationService` and `mockAdminAuthAdapter`.
- `unavailableCustomerWorkspaceAdapter` returns empty results (`[]` / `null`) from every method so an explicitly injected "no data source" adapter fails closed rather than throwing.

Swapping in a real provider (database, CRM, or Shopify customer sync) requires only a new `CustomerWorkspaceAdapter` implementation — no service, hook, or page change.

## Service Responsibilities

`customerWorkspaceService` (`src/services/customerWorkspace/customerWorkspaceService.ts`) owns:

1. **List customers** — `listCustomers()` loads every adapter record, builds a summary for each, and returns a `CustomerWorkspaceListResult`.
2. **Search customers** — `searchCustomers(search)` validates the request against `customerWorkspaceSearchSchema`, then matches `search.query` case-insensitively against agency name, contact name, contact email, and account number, optionally combined with `search.filter`.
3. **Filter customers** — `filterCustomers(filter)` applies `status`, `verticalId`, and `shopifySyncStatus` matching without a text query.
4. **Retrieve customer details** — `getCustomer(customerId)` returns a `CustomerWorkspaceDetailResult` (`'found' | 'not-found'`) built from the adapter's record and activity for that id.
5. **Build customer summaries** — the exported pure function `buildCustomerWorkspaceSummary(record, activity)` derives `quoteCount` (count of `'quote-created'` activity entries), `lastQuoteAt`, and `lastActivityAt` from an already-loaded activity list. This mirrors the "pure aggregation function, no recalculation of another domain's data" precedent set by `liveQuoteBuilderService.buildPricingSummary()` (see `QUOTE_BUILDER_FOUNDATION.md`, Issue 46) — it does not call quote persistence, pricing, or Shopify services.
6. **Expose recent customer activity** — `getCustomerActivity(customerId)` returns the adapter's activity log for a customer independent of the summary view.

The service never imports React, never performs network I/O, and never mutates a customer record — it only reads, validates, and aggregates adapter results.

## Hooks

- `useCustomerWorkspace()` (`src/hooks/customerWorkspace/useCustomerWorkspace.ts`) owns list-loading state (`loadCustomers()`) and single-customer detail state (`loadCustomerDetail(customerId)`), following the repository's `{ data, loading, error, action }` hook shape.
- `useCustomerSearch()` (`src/hooks/customerWorkspace/useCustomerSearch.ts`) wraps `customerWorkspaceService.searchCustomers()` behind the same shape. Neither hook contains query-matching or filter logic — they format service results into render-ready state only.

## UI

`/admin/customers` (`src/pages/AdminCustomerWorkspace.jsx`) renders:

- A customer list table (agency, contact, vertical, status badge, Shopify sync badge, quote count, last activity).
- A search box and status filter chips backed by `useCustomerSearch()`.
- A read-only detail modal (contact information, quote count, last quote/activity dates, Shopify sync status and customer id, recent activity feed) opened via `useCustomerWorkspace().loadCustomerDetail()`.

The route is registered in `src/App.jsx` as `/admin/customers`, unguarded — matching the existing precedent set by `/admin/quotes` and `/admin/pricing-imports`, since this foundation does not add or change any admin authentication permission (see Non-goals).

Editing is explicitly not implemented: there is no create, update, or delete action anywhere in this page, hook, service, or adapter.

## Future CRM Integration

A future CRM foundation should implement `CustomerWorkspaceAdapter` against a real database or CRM provider, replacing `mockCustomerWorkspaceAdapter` without changing `customerWorkspaceService`, the hooks, or `AdminCustomerWorkspace.jsx`. Customer editing, notes, tasks, and pipeline/stage tracking belong in that future CRM issue, not in this foundation.

## Future Shopify Synchronization

`CustomerWorkspaceRecord.shopifySyncStatus` reuses `ShopifyCustomerSyncStatus` from the existing Shopify Customer Integration Foundation (`SHOPIFY_CUSTOMER_INTEGRATION.md`) so a future synchronization issue can wire `shopifyCustomerService` results into this same field without adding a second sync-status enum. No live Shopify Admin API call is made by this foundation — sync status values are deterministic fixture data.

## Explicit Non-goals

This foundation does not implement a CRM, database persistence, customer editing (create/update/delete), authentication changes (no new `AdminPermission` value, no change to `AdminAuthGuard` usage beyond registering an unguarded route), email, notifications, live Shopify Admin API calls, or live synchronization. `/admin/customers` composes only existing, already-approved architecture layers against deterministic fixtures.

## Testing

`tests/customer-workspace-foundation.test.mjs` covers: schema validation of the mock adapter fixtures, single-customer retrieval (found and not-found), activity ordering, the unavailable adapter's fail-closed behavior, summary aggregation (quote count and recency derived from activity), `listCustomers`/`searchCustomers`/`filterCustomers` orchestration (including combined query + filter), customer detail retrieval, activity retrieval, an injected-unavailable-adapter case, and hook export presence.

**Known gap**: as with every other hook-driven admin page (see `docs/migrations/TESTING_NOTES.md`), the repository's `node --test` + Vite-SSR stack has no DOM/jsdom layer, so `AdminCustomerWorkspace.jsx`'s client-side behavior (typing in the search box, clicking a row to open the detail modal, status filter chip clicks) is not exercised by an automated browser test — only the underlying schema, adapter, service, and hook layers are.

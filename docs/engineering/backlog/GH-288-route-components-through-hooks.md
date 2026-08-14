<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #288 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. Corrected 2026-08-04 per PR #323 review: the original migration copied issue #288's file list (2026-07-09) without re-checking it against the current tree. It was stale in two ways — QuoteRequestPanel.jsx (one of the 14 originally listed) had been deleted via #321, and a new violator (QuoteContactModal.tsx) existed that wasn't listed. Regenerated the list below by grep against the actual current tree, and expanded scope to src/pages/ (the original list only covered src/components/, but docs/architecture/SERVICE_LAYER.md's components-through-hooks rule and docs/ai/ARCHITECTURE_PRINCIPLES.md's stated dependency direction don't carve out an exception for route-level page components — flagging this scope correction explicitly rather than silently). -->
# Chore: route components through hooks instead of importing services/adapters directly

## Metadata

```yaml
id: GH-288
status: Ready
priority: P1
owner: agent
dependencies: []
```

## Context

24 files (14 under `src/components/`, 10 under `src/pages/`) import `services`/`adapters` directly instead of going through a hook, violating `docs/architecture/SERVICE_LAYER.md`'s components-through-hooks dependency direction. Confirmed by direct grep against the current tree (commit `ac5ba85`), not the original 2026-07-09 list, which is now stale. Part of Epic [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281).

**`src/components/` (14 files):**

- `src/components/AdminAuthGuard.jsx:14` — `@/services/adminAuth`
- `src/components/configurator/ConfiguratorCommerceActions.tsx:23` — `@/services/quoteBuilder`
- `src/components/configurator/ConfiguratorModule.tsx:32-33` — `@/services/commerceLookupService`
- `src/components/fleetBuilds/FinishYourUpfitPanel.jsx:36` — `@/services/catalog`
- `src/components/fleetBuilds/FleetBuildsPanel.jsx:16` — `@/services/catalog`
- `src/components/fleetBuilds/FleetTemplatesSection.jsx:16` — `@/services/catalog`
- `src/components/navigator/ShopifyReadinessPanel.jsx:8` — `@/services/shopifyMappingService`
- `src/components/product/CommerceActionPanel.tsx:5` — `@/services/commerce`
- `src/components/product/CompareTray.jsx:5` — `@/services/catalog`
- `src/components/product/ProductIntelligencePanel.jsx:20` — `@/services/catalog`
- `src/components/product/RecentlyViewedProducts.jsx:2` — `@/services/catalog`
- `src/components/product/RecommendedProducts.jsx:2` — `@/services/catalog`
- `src/components/product/SavedProductsSection.jsx:3` — `@/services/catalog`
- `src/components/quoteDelivery/QuoteContactModal.tsx:14-15` — `@/services/quoteRequestService`, `@/adapters/quoteDelivery` (new since original filing — introduced by #321)

**`src/pages/` (10 files — not in the original issue's scope, added here):**

- `src/pages/AdminPricingImportDashboard.jsx:13` — `@/services/adminAccessService`
- `src/pages/AdminQuoteBuilderPage.jsx:16` — `@/services/adminAccessService`
- `src/pages/AdminQuotesPage.jsx:11-12` — `@/services/adminQuoteService`, `@/services/adminAccessService`
- `src/pages/CartWorkspace.jsx:25` — `@/services/shopifyStorefrontCart`
- `src/pages/CategoryTemplate.jsx:4` — `@/services/catalog`
- `src/pages/ComparePage.jsx:8` — `@/services/catalog`
- `src/pages/GuidedUpfitBuilderPage.jsx:28` — `@/services/catalog`
- `src/pages/ProcurementPage.jsx:27` — `@/services/catalog`
- `src/pages/ProductSearchPage.jsx:14` — `@/services/catalog`
- `src/pages/ProjectQuotePage.jsx:28` — `@/services/catalog`
- `src/pages/WorkspaceDashboard.jsx:35` — `@/services/catalog`

(`QuoteRequestPanel.jsx`, `ConfiguratorCommerceActions.tsx`'s sibling `ConfigurationSummary.jsx`, and 3 other originally-listed files no longer exist or no longer import directly — dropped from this list; do not attempt to migrate files that aren't there.)

## Outcome

All 24 files import only from `src/hooks`, never directly from `src/services` or `src/adapters`, and all existing tests continue to pass with no visual regression.

## Scope

**Size: M — larger than the original M estimate given the corrected 24-file count (was scoped for 14).** Target hooks that already exist: `useCatalog.ts` (the 12 `catalogService` call sites — components and pages), `src/hooks/commerce/useCommerce.ts`, `src/hooks/quoteBuilder/useQuoteBuilder.ts`, `src/hooks/adminAuth/` (three hooks already there), `src/hooks/shopifyStorefrontCart/`. Start with these, since the target already exists. For `adminAccessService`, `adminQuoteService`, `shopifyMappingService`, `commerceLookupService`, `quoteRequestService`, and `@/adapters/quoteDelivery` — no existing hook wrapper found; add a thin hook first (matching `useCatalog.ts`'s pattern), then migrate the component/page to call it. Behavior-preserving migration — no visual or functional change.

## Non-Goals

Not a change to what any service does internally. Not re-litigating whether `src/pages/` should be exempt from this rule — if that's the intent, say so explicitly as a documented local deviation rather than leaving the rule ambiguous.

## Acceptance Criteria

```text
Given the 24 files listed above
When each is migrated
Then it imports only from src/hooks, never directly from src/services or src/adapters, and all existing tests continue to pass with no visual regression
```

## Verification

`npm run test`/`npm run build` after each batch, plus a manual smoke pass through the affected surfaces (configurator, navigator, fleet builds, admin, product, saved/recommended products, cart, category/search/compare, project quote, procurement, guided upfit, workspace dashboard).

## Risks

**Risk: Medium.** Touches 24 files across most of the app's feature areas — regression risk is in missing a call site or subtly changing a prop/data shape during extraction, mitigated by the batch-and-verify approach in Scope. Re-audit the file list again immediately before starting work, given it's already been found stale once.

## Handoff Notes

Original discussion: [GitHub issue #288](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/288). Scope correction found and applied during PR #323 review (Codex automated review) — the underlying lesson (verify an issue's file/line claims against the current tree, not just against comments) applies beyond this one item; worth a general reminder in future migrations.

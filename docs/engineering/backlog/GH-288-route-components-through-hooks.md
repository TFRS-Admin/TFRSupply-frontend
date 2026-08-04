<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #288 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
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

14 component files import `services`/`adapters` directly instead of going through a hook, violating `docs/architecture/SERVICE_LAYER.md` rules 3-4: `src/components/configurator/QuoteRequestPanel.jsx:9`, `ConfiguratorCommerceActions.tsx:23`, `ConfiguratorModule.tsx:32-33`, `src/components/navigator/ShopifyReadinessPanel.jsx:8`, `src/components/fleetBuilds/FinishYourUpfitPanel.jsx:36`, `FleetBuildsPanel.jsx:16`, `FleetTemplatesSection.jsx:16`, `src/components/AdminAuthGuard.jsx:14`, `src/components/product/CommerceActionPanel.tsx:5`, `SavedProductsSection.jsx:3`, `RecentlyViewedProducts.jsx:2`, `RecommendedProducts.jsx:2`, `ProductIntelligencePanel.jsx:20`, `CompareTray.jsx:5`. Confirmed finding, 2026-07-09 review pass. Part of Epic [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281).

## Outcome

All 14 files import only from `src/hooks`, never directly from `src/services` or `src/adapters`, with no behavior change.

## Scope

**Size: M.** `catalogService` already has a hook wrapper at `src/hooks/useCatalog.ts` — start with the 5 components importing `catalogService` directly, since the target hook already exists. For components whose service has no existing hook wrapper, add a thin hook first (matching the pattern in `src/hooks/useCatalog.ts`), then migrate the component to call it. Behavior-preserving migration — no visual or functional change.

## Non-Goals

Not a change to what any service does internally.

## Acceptance Criteria

```text
Given the 14 files listed above
When each is migrated
Then it imports only from src/hooks, never directly from src/services or src/adapters, and all existing tests continue to pass with no visual regression
```

## Verification

`npm run test`/`npm run build` after each batch, plus a manual smoke pass through the affected surfaces (configurator, navigator, fleet builds, admin, product, saved/recommended products).

## Risks

**Risk: Medium.** Touches 14 files across several feature areas — regression risk is in missing a call site or subtly changing a prop/data shape during extraction, mitigated by the batch-and-verify approach in Scope.

## Handoff Notes

Original discussion: [GitHub issue #288](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/288).

<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #290 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: split ConfiguratorModule.tsx into subcomponents

## Metadata

```yaml
id: GH-290
status: Blocked
priority: P2
owner: agent
dependencies: [GH-289]
```

## Context

`src/components/configurator/ConfiguratorModule.tsx` is a 1023-line file containing 8+ sub-components (`SkuFilters`, `SkuTable`, `AccessoriesSection`, `AccessoryRow`, `QuotePanel`, etc.) and standalone business-logic functions, all in one file, none unit-tested directly. Confirmed finding, 2026-07-09 review pass. Part of Epic [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281).

## Outcome

Each identified sub-component lives in its own file under `src/components/configurator/`, `ConfiguratorModule.tsx` is reduced to composition/orchestration, and the configurator renders and behaves identically.

## Scope

**Size: M.** Extract each identified sub-component into its own file, preserving existing prop contracts exactly. Structural extraction only.

## Non-Goals

Not changing any component's rendered output or behavior.

## Acceptance Criteria

```text
Given ConfiguratorModule.tsx's current 1023 lines
When this work completes
Then each identified sub-component lives in its own file, ConfiguratorModule.tsx is reduced to composition/orchestration, and the configurator renders and behaves identically
```

## Verification

`npm run test`/`npm run build`, plus a visual smoke pass through the configurator.

## Risks

**Risk: Medium.** A large diff surface on a customer-facing funnel component increases the chance of a subtle prop/state bug slipping through — mitigated by extracting after the engine unification (see Handoff Notes) and a real visual smoke pass.

## Handoff Notes

Blocked by [GH-289](./GH-289-unify-configurator-sku-matching-engines.md) (engine unification) — extracting now would need to be redone once `filterSkus`/`wouldHaveMatches`/`findMatchingHkbKit` move to the shared engine. Original discussion: [GitHub issue #290](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/290).

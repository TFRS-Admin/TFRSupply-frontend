<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #290 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. Corrected 2026-08-04 per PR #323 review: unblocked after confirming GH-289 (its only stated blocker) is obsolete, not just re-scheduled. -->
# Chore: split ConfiguratorModule.tsx into subcomponents

## Metadata

```yaml
id: GH-290
status: Ready
priority: P2
owner: agent
dependencies: []
```

## Context

`src/components/configurator/ConfiguratorModule.tsx` is a 1044-line file (1023 at original filing, confirmed still ~1044 lines as of commit `ac5ba85`) containing 8+ sub-components (`SkuFilters`, `SkuTable`, `AccessoriesSection`, `AccessoryRow`, `QuotePanel`, etc.) and standalone business-logic functions, all in one file, none unit-tested directly. Confirmed finding, 2026-07-09 review pass. Part of Epic [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281).

This item was originally blocked by [GH-289](./GH-289-unify-configurator-sku-matching-engines.md) (unifying two configurator engines, so the extraction wouldn't need redoing once SKU-matching logic moved). GH-289 is now confirmed obsolete — the second engine (`configuratorEngine.js`) was dead code and was deleted via #321, so there's only ever been one engine (`ConfiguratorModule.tsx` itself) to extract from. That removes this item's only stated blocker; the underlying 1044-line file still needs splitting.

## Outcome

Each identified sub-component lives in its own file under `src/components/configurator/`, `ConfiguratorModule.tsx` is reduced to composition/orchestration, and the configurator renders and behaves identically.

## Scope

**Size: M.** Extract each identified sub-component into its own file, preserving existing prop contracts exactly. Structural extraction only. Before starting, re-audit the file's current sub-component boundaries against #321's changes (the delivery-adapter wiring may have touched this file) rather than assuming the original 2026-07-09 component list is still exact.

## Non-Goals

Not changing any component's rendered output or behavior.

## Acceptance Criteria

```text
Given ConfiguratorModule.tsx's current ~1044 lines
When this work completes
Then each identified sub-component lives in its own file, ConfiguratorModule.tsx is reduced to composition/orchestration, and the configurator renders and behaves identically
```

## Verification

`npm run test`/`npm run build`, plus a visual smoke pass through the configurator.

## Risks

**Risk: Medium.** A large diff surface on a customer-facing funnel component increases the chance of a subtle prop/state bug slipping through — mitigated by a real visual smoke pass and re-confirming the current sub-component boundaries before extraction (see Scope).

## Handoff Notes

No longer blocked — GH-289 was confirmed obsolete, not merely rescheduled. Original discussion: [GitHub issue #290](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/290).

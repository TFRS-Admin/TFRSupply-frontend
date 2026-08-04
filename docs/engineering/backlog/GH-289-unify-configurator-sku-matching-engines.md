<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #289 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: unify the two parallel configurator SKU-matching engines

## Metadata

```yaml
id: GH-289
status: Planned
priority: P2
owner: agent
dependencies: []
```

## Context

`src/domain/configuration/configuratorEngine.js` (302 lines, the older pure-domain engine, wrapped by `src/context/ConfigurationContext.jsx`) is used only by the older `QuoteRequestPanel.jsx`/`ConfigurationSummary.jsx`. The newer `src/components/configurator/ConfiguratorModule.tsx` (1023 lines) reimplements equivalent SKU-matching/filtering logic inline (`filterSkus`, `wouldHaveMatches`, `findMatchingHkbKit`) and never imports `domain/configuration` — two engines maintaining the same rules independently, with real risk of behavioral drift between them. Confirmed finding, 2026-07-09 review pass. Part of Epic [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281).

## Outcome

`ConfiguratorModule.tsx` and `QuoteRequestPanel.jsx` both resolve SKU matches through one shared engine, with no observable behavior change for any existing supported product configuration.

## Scope

**Size: L.** This needs a discovery pass first: confirm whether the two engines' rules have already diverged (compare `configuratorEngine.js`'s matching logic against `ConfiguratorModule.tsx`'s inline functions field-by-field) before deciding which becomes canonical. Given `Risk: High`, this should go through a full architecture-review/spec pass (`playbooks/ARCHITECTURE_REVIEW.md`) before implementation — do not treat this as a drop-in refactor.

## Non-Goals

Not splitting `ConfiguratorModule.tsx` into subcomponents — that's the separate, dependent [GH-290](./GH-290-split-configuratormodule-into-subcomponents.md).

## Acceptance Criteria

```text
Given the two independent SKU-matching implementations
When this work completes
Then ConfiguratorModule.tsx and QuoteRequestPanel.jsx both resolve SKU matches through one shared engine, with no observable behavior change for any existing supported product configuration
```

## Verification

Full regression pass across representative Police/Fire/EMS/Work Truck configurator flows, plus the existing configurator-experience/configurator-migration test suites.

## Risks

**Risk: High.** Architecturally significant — the two engines may have already diverged in subtle ways; unifying them without first confirming that risks silently changing real customer-facing SKU-matching behavior.

## Handoff Notes

No dependencies yet — the discovery pass in Scope may surface new ones. Original discussion: [GitHub issue #289](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/289).

<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #289 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. Corrected 2026-08-04 per PR #323 review: the original migration read issue #289's body (2026-07-09) without checking whether the codebase itself had since moved past it — it had, via #321 (merged, in the same commit range this PR branched from). -->
# Chore: unify the two parallel configurator SKU-matching engines (OBSOLETE)

## Metadata

```yaml
id: GH-289
status: Cancelled
priority: P2
owner: agent
dependencies: []
```

## Context

Originally: `src/domain/configuration/configuratorEngine.js` (the older pure-domain engine, wrapped by `src/context/ConfigurationContext.jsx`) was used only by the older `QuoteRequestPanel.jsx`/`ConfigurationSummary.jsx`, while the newer `src/components/configurator/ConfiguratorModule.tsx` reimplemented equivalent SKU-matching/filtering logic inline — two engines maintaining the same rules independently. Part of Epic [#281 Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281).

**This premise no longer holds.** `docs/architecture/CONFIGURATION_COMMERCE_ARCHITECTURE.md`'s "Correction (#321)" note confirms `configuratorEngine.js` was never actually wired to the app — its `ConfigurationContext` was never mounted anywhere, it was dead code, and it (along with `ConfigurationContext.jsx`, `QuoteRequestPanel.jsx`, and `ConfigurationSummary.jsx`) has been deleted. Verified directly against the current tree: none of those four files exist anymore. There is only one configurator engine today — the logic inside `ConfiguratorModule.tsx` — so there is nothing left to unify.

## Outcome

N/A — superseded by reality. No unification work is needed; the two-engines problem this item was filed to solve doesn't exist anymore.

## Scope

None. Closed without implementation.

## Non-Goals

N/A.

## Acceptance Criteria

```text
Given configuratorEngine.js and its three dependent files were already deleted as confirmed dead code (#321)
When this item is reconciled with reality
Then it is marked Cancelled rather than executed against files that no longer exist
```

## Verification

Confirmed directly against the current tree (`git log`, `find src`): `src/domain/configuration/`, `ConfigurationContext.jsx`, `QuoteRequestPanel.jsx`, and `ConfigurationSummary.jsx` are all absent as of commit `ac5ba85`. Cross-checked against `docs/architecture/CONFIGURATION_COMMERCE_ARCHITECTURE.md`'s explicit correction note.

## Risks

None — this is a housekeeping closure, not a behavior change.

## Handoff Notes

[GH-290](./GH-290-split-configuratormodule-into-subcomponents.md)'s dependency on this item has been removed accordingly — it's no longer blocked by an engine unification that isn't happening. Original discussion: [GitHub issue #289](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/289) (should be closed there too, referencing this correction).

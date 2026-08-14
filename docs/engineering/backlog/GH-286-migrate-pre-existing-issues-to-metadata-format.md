<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #286 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: migrate pre-existing open issues to a structured metadata format

## Metadata

```yaml
id: GH-286
status: Planned
priority: P2
owner: agent
dependencies: []
```

## Context

113 pre-existing open issues (#5-#131 — the `[EPIC]`/`[SPEC]`/`[BUILD]`/`[QA]`/`[META]` process issues, plus the north-star vision issue #107) predate this repository's structured per-issue metadata convention and carry no status/priority/risk/size/blocked fields, so an agent cannot determine their state from the issue body alone. Part of Epic [#280 Playbook v3.0.0 Adoption Completion](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/280).

## Outcome

Every one of the 113 pre-existing open issues carries a structured metadata block with all nine fields (Status/Priority/Risk/Size/Epic/Sprint/Blocked/QA Required/Agent Persona) set to a value consistent with its actual current state.

## Scope

**Size: L.** Given the volume, triage and batch by the existing epic groupings in `docs/project-management/01_epics.md` rather than doing all 113 in one pass. Default `Status` to `Backlog` (this OS's `Planned`) unless there's clear evidence work is in flight; default `Blocked` to `No` unless a dependency is explicit in the issue body already. Issue #107 (permanent north-star) should get `Epic: None` — treat it as always-open reference material rather than forcing it into the lifecycle states. Issue #129 is handled separately (see [GH-287](./GH-287-reconcile-129-with-optional-project-model.md)) — skip it here.

## Non-Goals

Not a re-triage or re-prioritization of the underlying work — this only adds the required structure.

## Acceptance Criteria

```text
Given the 113 pre-existing open issues
When each is updated
Then its body includes a metadata block with all nine fields set to a value consistent with its actual current state
```

## Verification

Spot-check a sample across each of the 12 pre-existing Epic groupings for a complete, correctly-formatted block.

## Risks

**Risk: Low.** Mechanical, high-volume housekeeping — the main risk is inconsistent defaults across batches if not done carefully.

## Handoff Notes

Original discussion: [GitHub issue #286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286).

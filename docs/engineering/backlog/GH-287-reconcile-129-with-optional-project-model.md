<!-- Purpose: Work item, per tfrs-engineering-playbook's standards/WORK_ITEM_STANDARD.md. Migrated from GitHub issue #287 during Engineering OS re-sync (migration/RESYNC_CHECKLIST.md) — the issue itself remains the discussion/comment history; this file is now the authoritative status record. -->
# Chore: reconcile issue #129 with the optional-GitHub-Project model

## Metadata

```yaml
id: GH-287
status: Ready
priority: P3
owner: agent
dependencies: []
```

## Context

Issue #129, "[META] GitHub Project Operating System," was framed around standing up a GitHub Project (v2) as the operational source of truth. The Engineering OS this repository now follows treats a GitHub Project as optional visualization only — repository-local docs (`docs/engineering/backlog/`) and each issue's metadata are authoritative instead. Part of Epic [#280 Playbook v3.0.0 Adoption Completion](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/280).

## Outcome

Issue #129 either carries a comment reconciling it with the current optional-Project model, or is closed with an explicit `state_reason`.

## Scope

**Size: S.** Read #129's current body and comments, then either close it as `not_planned` (if its scope is now fully superseded) or retitle/re-scope it to "stand up an optional GitHub Project dashboard mirroring the file-based backlog" if the repository's humans still want a visual board later.

## Non-Goals

Not actually creating a GitHub Project — that remains optional and is not required by this item.

## Acceptance Criteria

```text
Given issue #129's current GitHub-Project-centered framing
When this item is resolved
Then #129 either carries a comment reconciling it with the optional-Project model, or is closed with state_reason explaining why
```

## Verification

Manual read-through confirming #129 no longer implies a GitHub Project is required.

## Risks

**Risk: Low.** Documentation/housekeeping only.

## Handoff Notes

Original discussion: [GitHub issue #287](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/287).

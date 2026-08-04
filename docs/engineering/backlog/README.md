<!-- Purpose: Explain the work-item convention for this directory. -->
# Backlog

Each file in this directory is one work item, per `standards/WORK_ITEM_STANDARD.md` in the [tfrs-engineering-playbook](https://github.com/TFRS-Admin/tfrs-engineering-playbook) Engineering OS. Glob this directory for current state; there is no separate index to keep in sync.

Files here (`GH-<issue-number>-<slug>.md`) were migrated from GitHub Issues during the 2026-08-04 Engineering OS re-sync (`migration/RESYNC_CHECKLIST.md`), replacing the former monolithic `docs/engineering/BACKLOG.md`/`CURRENT_SPRINT.md` index files (archived at `docs/engineering/archive/`). Each file's ID matches its originating GitHub issue number for traceability — the issue remains the discussion/comment history; this file is the authoritative status record going forward, per `adrs/0002-file-based-work-items.md`.

## Scope of this migration

This repository has two separate issue populations. Only the second is represented here:

1. **113 pre-existing issues (#5-#131)** — a product-roadmap hierarchy (`[EPIC]`/`[SPEC]`/`[BUILD]`/`[QA]`/`[META]`) plus the north-star vision issue #107, predating this repository's structured-metadata convention. Explicitly out of scope for this migration; retrofitting them into this convention is tracked as [GH-286](./GH-286-migrate-pre-existing-issues-to-metadata-format.md).
2. **The Playbook v3.0.0 adoption/repo-health backlog (#279-#307)** — 8 open Epic issues (shells, not migrated individually: #279 master epic, #280-#285, #307) and 10 real open work items, each migrated to its own file here: #286, #287, #288, #289, #290, #291, #293, #296, #305, #306.

At migration time, `docs/engineering/archive/BACKLOG.md` (the former index) was confirmed stale: it still listed 9 items as open (`#292`, `#294`, `#295`, `#299`, `#300`, `#301`, `#304`, `#297`, `#303`) that were already closed on GitHub — including a `Risk: Critical` unauthenticated-admin-panel finding (`#297`) and a `P0` silently-dropped-customer-quotes bug (`#303`). None of those 9 have a file here, since they're actually done — this directory reflects GitHub's real state at migration time, not the archived index.

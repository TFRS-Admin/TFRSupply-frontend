<!-- Purpose: Seed and maintain docs/engineering/ROADMAP.md — the sequenced Epic list this repository maintains directly, without depending on a GitHub Project. -->
# Roadmap: TFRSupply Frontend

## Current Window

Sprint 0 (2026-07-09 onward) — capacity: this window covers only the playbook v3.0.0 adoption-completion Epic below; product roadmap sequencing (Police/Fire/EMS/Work Truck launch epics) is owned by [`docs/MASTER_EXECUTION_PROGRAM.md`](../MASTER_EXECUTION_PROGRAM.md) per [`docs/DOCUMENTATION_HIERARCHY.md`](../DOCUMENTATION_HIERARCHY.md), not duplicated here.

## Sequenced Epics

| Order | Epic | Origin | Size | Priority | Dependencies |
| --- | --- | --- | --- | --- | --- |
| 1 | [#279 Epic: TFRS Engineering Playbook v3.0.0 Repository Health & Adoption Backlog](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/279) (master) | Playbook v3.0.0 release, 2026-07-09 | L | P1 | None |
| 2 | [#307 Epic: Commerce Data Integrity — Quote Submission Pipeline](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/307) | Independent re-review, 2026-07-09 (child of #279) | M | P0 | None |
| 3 | [#280 Epic: Playbook v3.0.0 Adoption Completion](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/280) | Child of #279 | M | P1 | None |
| 4 | [#281 Epic: Architecture Boundary Enforcement](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/281) | Review finding, 2026-07-09 | L | P1 | None |
| 5 | [#282 Epic: Performance — Bundle Size & Code Splitting](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/282) | Review finding, 2026-07-09 | M | P1 | None |
| 6 | [#283 Epic: Dependency & Security Hardening](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/283) | `npm audit` + review finding, 2026-07-09 | M | P1 | None |
| 7 | [#284 Epic: Test Coverage Gaps in Configurator & Pricing Domains](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/284) | Review finding, 2026-07-09 | M | P2 | None |
| 8 | [#285 Epic: Technical Debt Cleanup](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/285) | Review finding, 2026-07-09 | S | P3 | None |

`#307` is ranked above the P1 Epics despite being added to this table after them: it carries `Priority: P0` (the quote-request/admin-quote-queue submission paths are live no-op stubs — see #303) and per `standards/WORK_ITEM_STANDARD.md#execution-ordering`, Priority is the primary sequencing key.

## Pre-Existing Product Roadmap (Not Duplicated Here)

This repository already carries a substantial pre-existing issue hierarchy from its original bootstrap (2026-06-30/07-01): 12 `[EPIC]` issues (#5–#14, #19–#20), the permanent north-star vision issue [#107](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/107), and ~100 `[SPEC]`/`[BUILD]`/`[QA]`/`[META]` process issues tracked against `docs/project-management/01_epics.md`'s ten EPIC-01–EPIC-10 definitions. These remain the authoritative product roadmap and are **not** re-created or duplicated by this playbook-v3.0.0 adoption pass — see [#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286) for the tracked follow-up that will retrofit `## Metadata` blocks onto them so they participate fully in this file's sequencing going forward.

## Deferred

None this window — the eight Epics above are the complete adoption-completion-and-review scope; product-roadmap sequencing is deferred to `docs/MASTER_EXECUTION_PROGRAM.md`.

## Last Updated

2026-07-23, by the weekly repo-health pass — added #307 (filed 2026-07-09 by an independent re-review that ran after this file had already been written that day, and never folded in until now; flagged by a PR review comment on #309).

Previously: 2026-07-09, by the TFRS Engineering Playbook v3.0.0 adoption-completion pass.

## Related Documents

sibling [`docs/engineering/backlog/`](./backlog/) · [`standards/WORK_ITEM_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/standards/WORK_ITEM_STANDARD.md) · [`docs/MASTER_EXECUTION_PROGRAM.md`](../MASTER_EXECUTION_PROGRAM.md)

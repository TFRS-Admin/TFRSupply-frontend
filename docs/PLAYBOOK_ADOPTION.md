<!-- Purpose: Record this repository's TFRS Engineering Playbook adoption sprint, evidence, and honest final classification. -->
# TFRS Engineering Playbook Adoption — TFRSupply Frontend

## Summary

This repository adopted the [TFRS Engineering Playbook](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (version **2.4.0**) and [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) as its engineering source of truth, on **2026-07-09**. This document records what was added, what was intentionally left as a reference-only rather than copied, what still blocks Fully Onboarded, and the honest final [Adoption State](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#adoption-states) classification.

## What Was Added

- **Minimum Baseline** (copied per [`commands/setup-from-playbook.md#minimum-baseline`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/setup-from-playbook.md#minimum-baseline)): [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), [`AI_AGENT_OPERATING_MODEL.md`](../AI_AGENT_OPERATING_MODEL.md), [`DECISION_ROUTER.md`](../DECISION_ROUTER.md).
- **GitHub-native scaffolding**: `.github/ISSUE_TEMPLATE/` (`bug_report.md`, `feature_request.md`, `config.yml`), `.github/PULL_REQUEST_TEMPLATE.md`.
- **CI workflow**: `.github/workflows/ci.yml` — lint, typecheck, test, and build as separate required jobs, adapted from the playbook's `templates/github-actions-template.yml` to this repository's actual `package.json` scripts.
- **`ARCHITECTURE.md`** — seeded from the playbook's `templates/repository-architecture-template.md`, filled with this repository's real layering (`components → hooks → services → adapters → domain → data/schemas`) and known constraints.
- **README.md** — new "Engineering Source of Truth" section naming `tfrs-engineering-playbook`, recording the adopted version (`2.4.0`), and naming `TFRS-Admin/agent-skills` as the skills execution library.
- **This document** — the readiness checklist result and repo-health cadence record.

## What Was Aligned (Not Copied)

Per the Minimum Baseline table, every `*_STANDARD.md`, the `commands/` library, `AI_ENGINEERING_WORKFLOW.md`, and `REPOSITORY_BOOTSTRAP_GUIDE.md` are referenced live from `tfrs-engineering-playbook`, never vendored — vendoring was the exact failure mode the playbook's own `tfrs-website` worked example identified and warns against.

The repository's pre-existing local documentation was **not deleted**, since it contains real, still-useful content:

- `docs/ENGINEERING_PLAYBOOK.md` and `docs/ENGINEERING_OPERATING_SYSTEM.md` — both self-declared as "the governing document" for this repository before this sprint, which directly conflicted with adopting `tfrs-engineering-playbook` as authoritative. Both now carry an explicit "superseded" notice at the top pointing to the real authority chain (`AGENTS.md` → `tfrs-engineering-playbook`) and are retained as historical local design references only.
- `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` and `docs/ai/REPOSITORY_INDEX.md` — both self-declared as the agent entry point/"single source of truth." Both now carry a note clarifying that the root `AGENTS.md` is the actual entry point, while their layer-convention and naming detail remain valid Tier-3 repository-specific reference material that does not conflict with the playbook.
- `docs/project-management/*` (epics, labels, DoD, acceptance criteria library, agent personas, branch strategy) — left unmodified; genuinely repository-specific and does not conflict with the adopted playbook. `AGENTS.md`'s one explicit override (branch-naming taxonomy from `09_branch_strategy.md`) is called out per `SKILLS_STANDARD.md#precedence-on-conflict`.

No pre-existing local guidance was silently discarded — every conflict above was surfaced and resolved with an explicit pointer, per the Setup-From-Playbook command's quality gate.

## Verification Commands (Confirmed, Not Assumed)

Run directly against this repository during the adoption sprint:

| Command | Result |
| --- | --- |
| `npm ci` | 605 packages installed cleanly |
| `npm run lint` (`eslint . --quiet`) | **Pass** — zero output, zero errors |
| `npm run typecheck` (`tsc --noEmit -p tsconfig.json`) | **Pass** — zero output, zero errors |
| `npm run build` (`vite build`) | **Pass** — produced a real 2.2 MB `dist/` bundle |
| `npm run test` (`node --test tests/*.test.mjs`) | **1143/1143 pass.** (Two failures present when this sprint's PR #277 was opened were fixed by separate commits on that same PR before merge — see Update below — and are confirmed green as of this documentation-cleanup follow-up.) |

**Resolved item** (was known-red when PR #277 was opened, fixed before merge): `tests/homepage-conversion-polish.test.mjs` and `tests/storefront-category-vertical-polish.test.mjs` were updated by commits `2b264f4` and `a803c2a` to match current markup. Neither this documentation-cleanup follow-up nor the original adoption sprint touched test files directly — the fix landed as part of finishing out PR #277 and is recorded here only to keep this page accurate.

## Repository Readiness Checklist Result

Run against this repository's actual state, per [`REPOSITORY_BOOTSTRAP_GUIDE.md#repository-readiness-checklist`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#repository-readiness-checklist):

| Item | Degradable? | Result |
| --- | --- | --- |
| `AGENTS.md` | No | **Pass.** Present; names only `tfrs-engineering-playbook` and `TFRS-Admin/agent-skills` as workflow authority; explicitly does not defer to `docs/ENGINEERING_PLAYBOOK.md` or any vendored copy. |
| `CLAUDE.md` | No | **Pass.** Present, consistent with the canonical `CLAUDE.md`. |
| `DECISION_ROUTER.md` | No | **Pass.** Present, copied verbatim with cross-links repointed at the canonical playbook. |
| Playbook reference | No | **Pass.** `README.md` names `tfrs-engineering-playbook` and records version `2.4.0`. |
| Skills repo reference | No | **Pass.** `README.md`, `AGENTS.md`, and `CLAUDE.md` reference `TFRS-Admin/agent-skills`. No vendored skills copy is treated as authoritative — the pre-existing `agent-skills-main (1).zip` at the repository root is flagged in `ARCHITECTURE.md`'s Known Constraints as a stale reference archive, not a dependency. |
| Verification commands | No | **Pass.** `npm run lint` / `typecheck` / `build` / `test` are real and were run directly (see above), not assumed. |
| Backlog initialized or explicitly empty | No | **Pass, with a documented gap.** 113 open issues exist, including a real north-star issue (#107) and dependency-adjacent `[SPEC]/[BUILD]/[QA]` process issues. The gap: these are not GitHub-Project-field-mapped (no custom fields exist — confirmed via the GitHub API, zero fields returned) and mix genuine roadmap items with stale/meta issues, the same pattern the playbook's own `tfrs-website` worked example describes. Triage of this backlog is out of scope for this sprint. |
| Architecture docs | Yes | **Pass.** `ARCHITECTURE.md` created from the playbook template, reflecting the actual `components → hooks → services → adapters → domain` layering and named known constraints. |
| GitHub Project | Yes | **Fail — documented gap, fallback in use.** No GitHub Projects (v2) board, the ten required custom fields, or the eight required views could be created in this session — no Projects v2 creation tool was available to this agent, and the GitHub API confirms zero custom issue fields exist today. **Fallback in active use**: issues continue to carry Priority/Risk/Size/dependency information as structured text in issue bodies and via the existing label taxonomy in `docs/project-management/03_labels.md`, exactly as the playbook's own degraded-mode fallback describes. Creating the real Project is the single largest remaining step toward Fully Onboarded — see "What Still Blocks Fully Onboarded" below. |
| Issue templates | Yes | **Pass.** `.github/ISSUE_TEMPLATE/` added (bug report, feature request, config). |
| PR template | Yes | **Pass.** `.github/PULL_REQUEST_TEMPLATE.md` added. |
| CI workflow | Yes | **Pass.** `.github/workflows/ci.yml` added and its four jobs (lint, typecheck, test, build) were verified to run correctly against this repository's actual scripts before being committed. |
| Repository health workflow | Yes | **Pass (recorded cadence, not yet run).** No cadence existed before this sprint. Recorded here: run [`commands/repo-health.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/repo-health.md) against this repository **monthly**, first pass scheduled for the month following this adoption sprint. Until the first pass runs, treat this as a documented commitment, not a completed audit. |

**Net result: 12 of 13 pass.** The one failing item (GitHub Project) is degradable, and its fallback is explicitly recorded and already in active use (structured-text fields, existing label taxonomy).

## Final Adoption Classification

Per the playbook's three-state [Adoption Model](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#adoption-states):

> **Degraded but Usable** — every non-degradable item passes; the sole failing item (GitHub Project v2 setup) is degradable, with its documented fallback (structured-text Priority/Risk/Size/Blocked fields in issue bodies, existing label taxonomy) actively in use and explicitly recorded above, not silently assumed.

This is **not** Fully Onboarded — that requires every checklist item, degradable or not, to pass. It is well above Not Onboarded — all seven non-degradable items pass, which the playbook itself treats as decisive (a single non-degradable failure would mean an agent "cannot safely be assumed to be following this system at all," regardless of how good the rest of the setup looks; that is not the case here).

## What Still Blocks Fully Onboarded

1. **Create the real GitHub Project (v2)** with all ten required fields (`Status`, `Phase`, `Priority`, `Risk`, `Size`, `Sprint`, `Epic`, `QA Required`, `Blocked`, `Agent Persona`) and eight required views, per [`GITHUB_PROJECT_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/GITHUB_PROJECT_STANDARD.md). This requires GitHub UI/Projects-API access this session did not have — a human with repository admin access (or an agent session with Projects v2 tooling) should complete this next. Once created, migrate the 113 open issues' structured-text Priority/Risk/Size/dependency data into the real fields as part of a triage pass (the same triage the playbook's `tfrs-website` example independently recommends for that repository's near-identical stale backlog).
2. **Run the first `commands/repo-health.md` pass** against the recorded monthly cadence above, rather than leaving it as a commitment only.

None of the above are non-degradable — this repository is safe to operate against under the current playbook today, in the specific degraded mode each item's fallback describes.

## Suitability as a Downstream TFRS Frontend Foundation

Given the emphasis on this repository potentially serving as a frontend/design-system source for other TFRS repositories: its component layering (`src/components/ui/` design-system primitives, `src/domain/`, `src/types/` framework-agnostic contracts) and its `docs/architecture/*.md` per-domain boundary documentation are genuinely strong, reusable reference material — stronger than the playbook's own `tfrs-website` worked example. What was missing, and is now fixed by this sprint, was purely process-layer: authoritative agent instructions, GitHub-native scaffolding, and an honest architecture summary. With those in place, this repository is now a reasonable reference for how a TFRS frontend repository should adopt the playbook — with the GitHub Project gap above being the one honest caveat before calling it a complete reference implementation.

## Addendum: Documentation Self-Consistency Pass

A small follow-up cleanup, ahead of merging the adoption sprint above, made the documentation set internally consistent before it became permanent:

- Made `AGENTS.md`'s entry-point status explicit and unmissable, and added an explicit pointer to it from every other AI-instruction document (`CLAUDE.md`, all of `docs/ai/*.md`, `docs/ENGINEERING_PLAYBOOK.md`) so none of them present themselves as an independent starting point — including `docs/ai/REPOSITORY_INDEX.md`'s own "Start Here" section, which previously routed around `AGENTS.md` entirely.
- Collapsed [`docs/ENGINEERING_OPERATING_SYSTEM.md`](./ENGINEERING_OPERATING_SYSTEM.md) to a short pointer — [`docs/ENGINEERING_PLAYBOOK.md`](./ENGINEERING_PLAYBOOK.md) had already absorbed everything unique from it (per that file's own Section 12) but the collapse itself had never been executed. `docs/ENGINEERING_PLAYBOOK.md` is now this repository's one retained local historical design document, with an explicit naming-disambiguation note distinguishing it from the actual canonical `tfrs-engineering-playbook`.
- Verified exactly one source of truth exists for engineering workflow, roadmap ownership, project state, and AI operating rules, and recorded it in the new [`docs/DOCUMENTATION_HIERARCHY.md`](./DOCUMENTATION_HIERARCHY.md) — including making explicit that project state's source of truth is GitHub, not a local file (`docs/PROJECT_STATE.md` was proposed in `docs/ENGINEERING_PLAYBOOK.md` but never built).

No product code, CI, or tests changed in this pass.

## v3.0.0 Upgrade — 2026-07-09

The playbook released **v3.0.0** (breaking, same day as the v2.4.0 adoption sprint above) — see the playbook's [`VERSION.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/VERSION.md#300---2026-07-09). It moved from a GitHub-Project-centered operating model to a repository-centered one: `ARCHITECTURE.md` plus four new `docs/engineering/` files became required, non-degradable readiness items; every issue must carry a `## Metadata` block per the new [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md); and the GitHub Project checklist item was removed entirely (not just marked degradable) — a repository with no Project can now be `Fully Onboarded`.

### What Was Added

- `docs/engineering/ROADMAP.md`, `BACKLOG.md`, `CURRENT_SPRINT.md`, `REPO_HEALTH.md` — seeded from the v3.0.0 templates and populated with real repository content, not placeholders.
- `AI_AGENT_OPERATING_MODEL.md` and `DECISION_ROUTER.md` re-copied from the v3.0.0 playbook (both were substantially rewritten upstream — repository-centered read order, `## Metadata`-block-based state instead of GitHub Project fields).
- `AGENTS.md` and `README.md` updated to record the new adopted version (`3.0.0`) and reference the new `docs/engineering/` files.
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` updated to carry the `## Metadata`/`## Acceptance Criteria`/`## Verification`/`## Dependencies` sections required by [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md).
- A [`commands/review.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/review.md)-style repository review, converted via [`commands/backlog.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/backlog.md) into a real issue hierarchy: master Epic [#279](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/279), six child Epics ([#280](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/280)–[#285](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/285)), sixteen task issues ([#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286)–[#301](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/301)) — every one carrying a complete `## Metadata` block. See [`docs/engineering/BACKLOG.md`](./engineering/BACKLOG.md) for the full list and [`docs/engineering/REPO_HEALTH.md`](./engineering/REPO_HEALTH.md) for the underlying findings.
- `docs/DOCUMENTATION_HIERARCHY.md` updated: the "Project state" row now points at `docs/engineering/CURRENT_SPRINT.md` + issue `## Metadata` blocks instead of "GitHub Project," and the read-order diagram now includes `docs/engineering/` between `DECISION_ROUTER.md` and the repository-specific branches.

### Verification Commands (Re-Confirmed, Not Assumed)

| Command | Result |
| --- | --- |
| `npm run lint` | **Pass** — zero output, zero errors |
| `npm run typecheck` | **Pass** — zero output, zero errors |
| `npm run build` | **Pass** |
| `node --test tests/*.test.mjs` | **1143/1143 pass** |
| `npm audit` | 16 vulnerabilities (1 low, 9 moderate, 6 high) — tracked as [#283](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/283) and children, not silently left unaddressed |

### Repository Readiness Checklist — Pass 1 (Before This Upgrade, Against the New v3.0.0 Checklist)

The repository was `Degraded but Usable` under the old v2.4.0 checklist (see above). Re-run against the v3.0.0 checklist, before this upgrade's changes:

| Item | Degradable? | Result (pre-upgrade) |
| --- | --- | --- |
| `AGENTS.md` | No | Pass |
| `CLAUDE.md` | No | Pass |
| `AI_AGENT_OPERATING_MODEL.md` | No | **Fail** — present, but still the v2.4.0 content (GitHub-Project-centered read order) |
| `DECISION_ROUTER.md` | No | **Fail** — present, but still the v2.4.0 content |
| `ARCHITECTURE.md` | No | Pass |
| Repository engineering docs | No | **Fail** — `docs/engineering/` did not exist |
| `.github/ISSUE_TEMPLATE/` | No | **Fail** — present, but lacked the `## Metadata` block |
| `.github/PULL_REQUEST_TEMPLATE.md` | No | Pass |
| Playbook reference | No | Pass, with a stale version (`2.4.0` recorded, `3.0.0` current) |
| Skills repo reference | No | Pass |
| Verification commands | No | Pass |
| Backlog initialized or explicitly empty | No | **Fail** — 113 real issues existed, but none carried a `## Metadata` block |
| CI workflow | Yes | Pass |
| Repository health cadence | Yes | Fail — cadence recorded in this document's prose, not in the (nonexistent) `docs/engineering/REPO_HEALTH.md` |

**Net: 8 of 14 pass, 5 non-degradable items fail** → per the [Adoption States](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#adoption-states) model, this is decisive on its own: **`Not Onboarded`** under v3.0.0, despite having been `Degraded but Usable` under v2.4.0 a few hours earlier — the playbook's own breaking-change classification, not a regression in this repository.

### Repository Readiness Checklist — Pass 2 (After This Upgrade)

| Item | Degradable? | Result (post-upgrade) |
| --- | --- | --- |
| `AGENTS.md` | No | **Pass** |
| `CLAUDE.md` | No | **Pass** |
| `AI_AGENT_OPERATING_MODEL.md` | No | **Pass** — re-copied from playbook v3.0.0 |
| `DECISION_ROUTER.md` | No | **Pass** — re-copied from playbook v3.0.0 |
| `ARCHITECTURE.md` | No | **Pass** |
| Repository engineering docs | No | **Pass** — `docs/engineering/{ROADMAP,BACKLOG,CURRENT_SPRINT,REPO_HEALTH}.md` all present, populated with real content |
| `.github/ISSUE_TEMPLATE/` | No | **Pass** — both templates now carry the `## Metadata` block |
| `.github/PULL_REQUEST_TEMPLATE.md` | No | **Pass** |
| Playbook reference | No | **Pass** — version corrected to `3.0.0` |
| Skills repo reference | No | **Pass** |
| Verification commands | No | **Pass** — re-confirmed this session |
| Backlog initialized or explicitly empty | No | **Pass, with a documented gap** — 22 new issues (#279–#301) all carry complete `## Metadata` blocks; the 113 pre-existing issues do not yet (tracked as [#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286), explicitly recorded in `docs/engineering/BACKLOG.md`, not silently omitted) |
| CI workflow | Yes | **Pass** |
| Repository health cadence | Yes | **Pass** — cadence recorded in, and a real first pass run into, `docs/engineering/REPO_HEALTH.md` |

**Net: 14 of 14 pass** — every non-degradable item passes cleanly, and the two degradable items pass without needing their fallback. Per the [Adoption States](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#adoption-states) model: **Fully Onboarded** under playbook v3.0.0. The one honest caveat — the 113 pre-existing issues' `## Metadata` migration — is explicitly tracked ([#286](https://github.com/TFRS-Admin/TFRSupply-frontend/issues/286)) rather than either silently ignored or used to hold the whole repository back from `Fully Onboarded`, since the checklist item itself ("Backlog initialized... or the repository explicitly records... never silently absent") is satisfied by the explicit record.

## Related Documents

- [`AGENTS.md`](../AGENTS.md) · [`ARCHITECTURE.md`](../ARCHITECTURE.md) · [`README.md`](../README.md) · [`docs/DOCUMENTATION_HIERARCHY.md`](./DOCUMENTATION_HIERARCHY.md)
- [`docs/engineering/ROADMAP.md`](./engineering/ROADMAP.md) · [`docs/engineering/BACKLOG.md`](./engineering/BACKLOG.md) · [`docs/engineering/CURRENT_SPRINT.md`](./engineering/CURRENT_SPRINT.md) · [`docs/engineering/REPO_HEALTH.md`](./engineering/REPO_HEALTH.md)
- [`tfrs-engineering-playbook` README](https://github.com/TFRS-Admin/tfrs-engineering-playbook#readme)

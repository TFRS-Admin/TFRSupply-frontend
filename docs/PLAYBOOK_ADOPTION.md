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
| `npm run test` (`node --test tests/*.test.mjs`) | **1141/1143 pass.** Two known pre-existing failures, not introduced by this sprint and not fixed here (out of scope — see below) |

**Known-red items** (pre-existing, tracked here per the playbook's evidence-over-assertion standard rather than silently omitted):

- `tests/homepage-conversion-polish.test.mjs` → `StoreLandingView` → "uses mobile-first responsive grid classes for card sections"
- `tests/storefront-category-vertical-polish.test.mjs` → `CategoryTemplate filter and search reuse` → "renders every product in the category before any filter/search is applied"

These are unrelated to the playbook-adoption changes in this PR (no application code was touched) and are left for a follow-up issue rather than fixed inline, per the playbook's scope-expansion guardrail.

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
3. **Fix the two known-red tests** (see Verification Commands above) as a follow-up issue — not a blocker to onboarding itself, but real red on `main` that should not persist indefinitely.

None of the above are non-degradable — this repository is safe to operate against under the current playbook today, in the specific degraded mode each item's fallback describes.

## Suitability as a Downstream TFRS Frontend Foundation

Given the emphasis on this repository potentially serving as a frontend/design-system source for other TFRS repositories: its component layering (`src/components/ui/` design-system primitives, `src/domain/`, `src/types/` framework-agnostic contracts) and its `docs/architecture/*.md` per-domain boundary documentation are genuinely strong, reusable reference material — stronger than the playbook's own `tfrs-website` worked example. What was missing, and is now fixed by this sprint, was purely process-layer: authoritative agent instructions, GitHub-native scaffolding, and an honest architecture summary. With those in place, this repository is now a reasonable reference for how a TFRS frontend repository should adopt the playbook — with the GitHub Project gap above being the one honest caveat before calling it a complete reference implementation.

## Related Documents

- [`AGENTS.md`](../AGENTS.md) · [`ARCHITECTURE.md`](../ARCHITECTURE.md) · [`README.md`](../README.md)
- [`tfrs-engineering-playbook` README](https://github.com/TFRS-Admin/tfrs-engineering-playbook#readme)

# TFRSupply Engineering Operating System

## Purpose

This document designs the repo-native operating system that lets any AI agent — Claude Code or otherwise — execute TFRSupply roadmap work from a short prompt like:

> "Execute Issue PR-07 using /build."

without re-deriving architecture, process, or scope from scratch, and without proposing a new roadmap every session. It is a **proposal**: it does not implement the files it recommends, does not modify application code, and does not open unrelated issues. It reads and reconciles what already exists in this repository (`docs/ai/`, `docs/project-management/`, `docs/architecture/`, open PR #274) into one coherent system, names every gap, and lists the exact next implementation PR.

**This document is written for a founder who is done watching sessions go in circles.** Every recommendation below is designed to make the *next* short prompt cheaper than the last one, not to add process for its own sake.

---

## 0. What already exists (do not rebuild)

Before designing anything new, this is the honest state of the repo's process layer as of this proposal:

| Layer | Status | Files |
|---|---|---|
| AI governance playbook | **Exists, good** | `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md`, `ARCHITECTURE_PRINCIPLES.md`, `IMPLEMENTATION_WORKFLOW.md`, `PROMPT_TEMPLATE.md`, `REPOSITORY_INDEX.md` |
| Project-management governance | **Exists, good** | `docs/project-management/01_epics.md` … `10_project_bootstrap.md` (epics, issue templates, labels, DoD, acceptance criteria library, personas, dependency map, branch strategy, bootstrap) |
| Execution roadmap | **Written, not yet merged** | `docs/MASTER_EXECUTION_PROGRAM.md` and `docs/PRODUCTION_ROADMAP.md` exist only on the open branch `claude/tfrsupply-launch-roadmap-1arbqs` (PR **#274**, unmerged as of this writing). A prior attempt at the same file (PR #270) was closed without merging. |
| CI / quality gate | **Does not exist** | No `.github/` directory anywhere in the repo. `npm run lint/typecheck/test/build` are documented as required but nothing enforces them. |
| Issue/PR templates | **Documented, not wired to GitHub** | `docs/project-management/02_issue_templates.md` has the content; no `.github/ISSUE_TEMPLATE/` or `.github/pull_request_template.md` exists to surface it in the GitHub UI. |
| Repo entry point (`AGENTS.md`) | **Does not exist** | No root `AGENTS.md`. `docs/ai/REPOSITORY_INDEX.md` plays this role today but isn't in the convention-based location agents (and this task's own instructions) look for first. |
| Dynamic state tracker | **Does not exist** | Nothing tells an agent "what's currently in progress" without reading the entire issue backlog. |
| Slash-command skills (`/spec /plan /build /test /review /ship`) | **Does not exist** | No `.claude/commands/`. `MASTER_EXECUTION_PROGRAM.md` §7 explicitly notes this and substitutes prompt templates instead. |
| Prior "AI OS" attempt | **Found, unused, conflicting** | Root file `tfrs-ai-os-layer-files.zip` contains an earlier draft (`docs/START-HERE.md`, `agents/AGENT-RULES.md`, `docs/architecture/REPO-MAP.md`, a CI workflow, an issue template) built around a `main → develop → feature/*` branch model. This **conflicts** with `docs/project-management/09_branch_strategy.md`, which is trunk-based (`feature/* → main` directly, no `develop`). The zip was never unpacked into the repo. |
| GitHub issue backlog | **113 open issues, mostly stale** | Dominated by a June 30 batch of `[SPEC]/[BUILD]/[QA]` process and platform-aspiration issues (#88–#115) that predate and duplicate the roadmap now in PR #274. Zero open PRs before #274. This backlog is itself evidence of the "going in circles" problem. |

**Resolution used throughout this document:**
- `docs/project-management/09_branch_strategy.md` (trunk-based, protected `main`, no `develop`) wins over the zip's `develop`-branch model. The zip should be deleted, not merged — it is already flagged for deletion as PR-05 in `MASTER_EXECUTION_PROGRAM.md` §6.
- `docs/MASTER_EXECUTION_PROGRAM.md` (PR #274) is treated as the intended Tier-1 roadmap document once merged. This proposal is written to work the moment that PR lands, and degrades gracefully (falls back to `docs/project-management/01_epics.md`) if it doesn't.
- The founder should resolve PR #274 (merge, or request changes) **before** or immediately alongside adopting this operating system — see §9.

---

## 1. Source-of-Truth Hierarchy

Four tiers, ordered by how often they should change and who is allowed to change them.

### Tier 0 — Constitution (stable; founder approval required to change)

The rules that make every other document interpretable. Changing these changes how *every* future issue is executed, so they require an explicit founder-approved documentation PR, never a drive-by edit inside a feature PR.

| Doc | Governs |
|---|---|
| `AGENTS.md` (proposed, root) | Entry point and read-order for any agent |
| `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` | Philosophy, one-issue-one-branch-one-PR, QA requirements |
| `docs/ai/ARCHITECTURE_PRINCIPLES.md` | Dependency direction, layer ownership, anti-patterns |
| `docs/project-management/05_definition_of_done.md` | The bar every PR must clear |
| `docs/project-management/09_branch_strategy.md` | Branch naming, merge policy, protected-branch policy |
| `docs/project-management/07_agent_personas.md` | Who (which persona/reviewer) owns which domain |

### Tier 1 — Roadmap (dynamic in content, stable in structure; founder approval required to *restructure*, agents may update status markers)

| Doc | Governs |
|---|---|
| `docs/MASTER_EXECUTION_PROGRAM.md` | The single ordered plan: objectives → milestones → epics → PR-by-PR execution list, agent operating rules, risk register |
| `docs/PRODUCTION_ROADMAP.md` | Pointer only — redirects to the file above. Never gains content of its own. |

**The distinction that matters:** an agent may tick a status marker (`✅ merged (#nnn)`) or append a new PR entry *at the correct phase position* inside `MASTER_EXECUTION_PROGRAM.md` §6 without asking. An agent may **not** reorder milestones, change the v1.0 launch scope, add a new Objective, or write a second roadmap document without a founder-approved documentation issue. This is the rule that stops the PR #270 → PR #274 pattern (two competing roadmap PRs) from recurring.

### Tier 2 — State (dynamic; agents update automatically, no approval needed)

| Doc | Governs |
|---|---|
| `docs/PROJECT_STATE.md` (proposed) | What's true *right now*: current milestone, in-flight issue(s), last N merged PRs, known-red items, last CI result |

This is the one file every session writes to and every session reads first (after `AGENTS.md`). It exists so an agent never has to re-derive "what's going on" by reading 113 issues.

### Tier 3 — Reference (stable per-domain; update in the same PR that changes the boundary, normal review, no special approval)

| Docs | Governs |
|---|---|
| `docs/architecture/*.md` (54 files) | Per-domain service/adapter/schema boundaries |
| `docs/project-management/01_epics.md`, `02_issue_templates.md`, `03_labels.md`, `04_workflows.md`, `06_acceptance_criteria_library.md`, `08_dependency_map.md`, `10_project_bootstrap.md` | Supporting process detail referenced by Tier 0/1 docs |
| `docs/typescript/TYPESCRIPT_FOUNDATION.md`, `docs/migrations/*.md` | Migration and typing conventions |

### Tier 4 — Ephemeral (session-scoped; never a source of truth for the next session)

| Artifact | Governs |
|---|---|
| `docs/ai/SESSION_HANDOFF_TEMPLATE.md` instances | One session's closing note — folded into `PROJECT_STATE.md` and the PR body, then discarded |
| PR descriptions, issue comments | Point-in-time evidence, not durable process |

### What every agent must read first (in order)

1. `AGENTS.md` — read-order pointer, one line rule statement.
2. `docs/PROJECT_STATE.md` — what's in flight right now, so it doesn't duplicate work.
3. `docs/MASTER_EXECUTION_PROGRAM.md` §6 — find the named issue/PR-item, or pick the next unblocked one.
4. `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` + `docs/ai/ARCHITECTURE_PRINCIPLES.md` — workflow and layer rules (only if not already loaded this session).
5. The specific `docs/architecture/<DOMAIN>.md` file(s) named in the issue's affected boundaries.
6. `docs/project-management/05_definition_of_done.md` — the exit bar.

Steps 4–6 are the existing, good docs already in the repo. Steps 1–3 are the gap this proposal closes.

---

## 2. Required Repo Files

Recommended, not yet created. Each row states exactly what goes in it and why it doesn't duplicate an existing doc.

### `AGENTS.md` (new, repo root)

~40 lines. Not a rulebook — a pointer with one non-negotiable rule at the top:

```markdown
# AGENTS.md

Before doing anything, read in order:
1. docs/PROJECT_STATE.md
2. docs/MASTER_EXECUTION_PROGRAM.md (find your issue, or pick the next unblocked PR-item)
3. docs/ai/AI_DEVELOPMENT_PLAYBOOK.md and docs/ai/ARCHITECTURE_PRINCIPLES.md
4. The docs/architecture/<DOMAIN>.md file(s) your issue names

Then use docs/ai/PROMPT_TEMPLATE.md's short-prompt patterns and this repo's
/spec /plan /build /test /review /ship commands (see .claude/commands/).

One issue → one branch → one PR. Never touch files outside the issue's stated
scope. Never rewrite docs/MASTER_EXECUTION_PROGRAM.md's structure without a
founder-approved documentation issue. Full rules: docs/ai/AI_DEVELOPMENT_PLAYBOOK.md.
```

`AGENTS.md` is the convention-based root file most coding agents (Claude Code, Cursor, Codex, Copilot) check for automatically. It replaces zero existing docs — it's the missing front door to `docs/ai/REPOSITORY_INDEX.md`, which stays as the full index.

### `docs/PROJECT_STATE.md` (new)

A short, mechanically-updated file, not prose. Target shape:

```markdown
# Project State

_Last updated by PR #<nnn> on <date>._

## Current milestone
M0 — Repo Truth & Safety (see docs/MASTER_EXECUTION_PROGRAM.md §5)

## In progress (WIP limit: 2)
- PR-02 (ci: add GitHub Actions quality gate) — branch infra/pr-02-ci-gate, opened <date>

## Last 5 merged
- PR-01 docs(program): add master execution roadmap — #274

## Known red / blocked
- 2 failing tests on main (tests/homepage-conversion-polish.test.mjs,
  tests/storefront-category-vertical-polish.test.mjs) — fix is PR-03

## Last CI result
N/A — CI does not exist yet (blocked on PR-02)
```

**Update rule:** the agent that opens a PR against a roadmap item updates this file in the *same* PR — moving the item from "In progress" to "Last 5 merged," refreshing "Known red," and updating "Current milestone" if the milestone's exit criterion was just satisfied. This is a mechanical diff, not a new essay each time.

### `docs/MASTER_EXECUTION_PROGRAM.md` usage rules

Already self-documented inside the file (PR #274, §7 "Agent Operating Rules" and the "Roadmap maintenance" clause). This proposal adds one clarification the file doesn't yet make explicit: **the founder should merge PR #274 as-is or with edits before this operating system goes live**, since Tier 1 of the source-of-truth hierarchy (§1) has nothing to point to otherwise. Until it merges, `docs/project-management/01_epics.md` is the fallback Tier-1 document.

### `.github/ISSUE_TEMPLATE/` (new directory)

One file per type in `docs/project-management/02_issue_templates.md`, converted to GitHub's YAML-front-matter format so they actually appear in the "New Issue" picker:

```
.github/ISSUE_TEMPLATE/
  architecture.md
  feature.md
  migration.md
  bug.md
  refactor.md
  documentation.md
  research.md
  qa.md
  performance.md
  infrastructure.md
  roadmap-pr.md      ← new: one issue per docs/MASTER_EXECUTION_PROGRAM.md §6 entry
  config.yml         ← disables blank issues, links to AGENTS.md
```

Each file's body is the existing markdown from `02_issue_templates.md` verbatim, with:

```yaml
---
name: Feature
about: New user-facing or business-facing capability
title: "[FEATURE] "
labels: ["feature"]
---
```

`roadmap-pr.md` is new content, not a port: `Goal / Scope / Out of scope / Files / Acceptance / Verification / Milestone`, matching the shape every entry in `MASTER_EXECUTION_PROGRAM.md` §6 already uses — so "create one issue per PR-item" (recommended in that file's §8) is a copy-paste, not an invention.

### `.github/pull_request_template.md` (new)

Encodes `docs/project-management/04_workflows.md` → "PR Workflow" and the Definition of Done as a checkbox form:

```markdown
## Governing issue
Closes #

## Summary

## QA evidence
- [ ] `npm run lint` — 
- [ ] `npm run typecheck` — 
- [ ] `npm run build` — 
- [ ] `npm run test` — 
- [ ] Screenshots attached (if any visible UI changed)

## Scope confirmation
- [ ] Only files in the issue's declared scope were touched
- [ ] Forbidden areas (if listed in the issue) were not touched
- [ ] docs/PROJECT_STATE.md updated
- [ ] docs/MASTER_EXECUTION_PROGRAM.md status marker updated (if this PR maps to a roadmap item)

## Risk and rollback

## Reviewer(s)
<!-- per docs/project-management/09_branch_strategy.md "Review Ownership" -->
```

### `docs/ai/PROMPT_TEMPLATE.md` — additions

Keep the five existing templates (Foundation, Feature, Refactoring, Bug Fix, Documentation) unchanged. Add two new short templates that this proposal's whole premise depends on:

```markdown
## Roadmap Execution Template (shortest form)

Execute [PR-07] using /build.

## Replan After Blocker Template

/plan — [PR-08] is blocked: [one-line blocker]. Propose the smallest scope
change that unblocks it without touching docs/MASTER_EXECUTION_PROGRAM.md's
structure. Stop and ask if the fix requires founder input (product truth,
credentials, or scope growth).
```

### `docs/ai/SESSION_HANDOFF_TEMPLATE.md` (new)

The piece that actually prevents "going in circles": a fixed-shape closing note an agent writes at the end of a session, small enough that the next session's first prompt can be one line.

```markdown
# Session Handoff — [date] — [issue/PR-item]

## What changed
- Files touched: [list]
- PR: [link or "not yet opened"]

## QA evidence
lint: [pass/fail] · typecheck: [pass/fail] · test: [pass/fail] · build: [pass/fail]

## What's next
[Exact next PR-item, or "blocked on: <specific thing>"]

## Update docs/PROJECT_STATE.md?
[Yes — diff included in this PR / No — explain why]
```

### `.claude/commands/{spec,plan,build,test,review,ship}.md` (new)

See §5 below — these are the literal slash commands. Not a generic template; each is rewired to be GitHub-issue-driven and to read Tier 0/1/2 docs first.

### Root cleanup (tracked, not executed by this proposal)

`TFRSupply_Knowledge_Package (1).zip`, `agent-skills-main (1).zip`, `tfrs-ai-os-layer-files.zip`, and `base44/` are already scheduled for deletion as **PR-05** in `docs/MASTER_EXECUTION_PROGRAM.md` §6. This proposal does not touch them (source code / repo hygiene is out of its scope) but confirms PR-05's disposition is correct — the zips' *ideas* (CI workflow shape, slash-command shape) have been extracted into §2 and §5 of this document; the zips themselves should not be unpacked or merged.

---

## 3. Workflow

### How a session starts
1. Founder sends a short prompt (see §6).
2. Agent reads `AGENTS.md` → `docs/PROJECT_STATE.md` → `docs/MASTER_EXECUTION_PROGRAM.md`.
3. Agent resolves the prompt's issue/PR-item reference against `MASTER_EXECUTION_PROGRAM.md` §6 (see §5's note on "PR-07" naming) and confirms it isn't already listed "In progress" in `PROJECT_STATE.md`.

### How Claude chooses work
- **Named work** ("Build issue PR-07," "Review PR #214"): resolve directly, no selection logic needed.
- **Unnamed work** ("Execute next ready issue"): scan `MASTER_EXECUTION_PROGRAM.md` §6 top-to-bottom for the first entry that is (a) not yet merged, (b) not blocked by an unmet milestone gate (§5's table), and (c) would not push "In progress" in `PROJECT_STATE.md` past the WIP limit of 2. Pick it. Do not skip ahead to a more interesting item — order in §6 is the priority order.
- If `MASTER_EXECUTION_PROGRAM.md` doesn't exist yet (pre-PR #274), fall back to `docs/project-management/01_epics.md` + `08_dependency_map.md` and say so explicitly in the session's opening statement.

### How Claude executes work
Follows `docs/ai/IMPLEMENTATION_WORKFLOW.md` verbatim: branch from latest `main` using `docs/project-management/09_branch_strategy.md` naming, one issue only, dependency-direction rules from `ARCHITECTURE_PRINCIPLES.md`, stop and escalate rather than silently expanding scope.

### How Claude verifies work
Runs the four required commands from `package.json` and captures exact output:
```bash
npm run lint
npm run typecheck
npm run build
npm run test
```
Adds/updates tests per `docs/project-management/06_acceptance_criteria_library.md`. Screenshots for any visible UI change. This is unchanged from the existing playbook — this proposal adds no new QA requirement, it just makes the four commands CI-enforced (§2, `.github/workflows/ci.yml`, tracked as PR-02).

### How Claude opens PRs
Fills `.github/pull_request_template.md`, links the governing issue, requests reviewers per `docs/project-management/09_branch_strategy.md` → "Review Ownership," applies `needs-review`.

### How Claude updates state
In the **same PR** (not a follow-up): update `docs/PROJECT_STATE.md`'s "In progress"/"Last 5 merged"/"Known red" sections, and tick the corresponding status marker in `docs/MASTER_EXECUTION_PROGRAM.md` §6 if the PR maps to a roadmap item. This is mandatory per `MASTER_EXECUTION_PROGRAM.md` §7's existing "Roadmap maintenance" clause — this proposal extends it to also cover `PROJECT_STATE.md`.

### How Claude stops
Stops after the PR is opened. Does not proceed to the next issue, does not open a new chat's worth of scope in the same session, per `AI_DEVELOPMENT_PLAYBOOK.md` → "One Chat per Implementation." If the founder used `/build auto` semantics for a multi-item batch (see §5), stops at the first blocker requiring founder input, per the "stop and ask" triggers in `MASTER_EXECUTION_PROGRAM.md` §7.

---

## 4. GitHub Project Structure

This builds directly on `docs/MASTER_EXECUTION_PROGRAM.md` §8 (already written, currently sitting unmerged in PR #274) rather than inventing a competing scheme. Summarized and made durable here so it survives independent of that specific roadmap doc's content:

**Columns:** Backlog → Ready → In Progress → In Review → Verified → Done. **WIP limit: 2 in "In Progress"** — this single number is the mechanical fix for "sessions going in circles" (113 open issues with zero WIP limit is how the backlog got to 113).

**Labels:** trim the 26 labels in `docs/project-management/03_labels.md` to the actively-used core (`architecture`, `feature`, `migration`, `bug`, `configurator`, `commerce`, `pricing`, `vehicle`, `qa`, `documentation`, `blocked`, `needs-review`, `ready-for-merge`, `high-risk`) plus two new ones from the roadmap doc: `launch-blocker`, `needs-founder-input`. Drop agent-brand labels like `ready-for-codex` in favor of the neutral `ready-for-merge`/`needs-review` pair already in use.

**Milestones:** align to `MASTER_EXECUTION_PROGRAM.md`'s M0–M4+ (Repo Truth & Safety → First Real Order → Launch-Ready Storefront → Launch Hardening → Post-Launch), not to `01_epics.md`'s ten platform epics — epics span multiple milestones and aren't useful as a GitHub milestone filter on their own.

**Epics:** stay as documentation (`docs/project-management/01_epics.md`), not GitHub milestones. Reference them from issue bodies ("Epic: EPIC-04 Configurator Platform Migration") for cross-cutting traceability.

**Issue fields (custom, GitHub Projects v2):** `Priority` (P0 launch-blocker / P1 / P2 / P3), `PR-item` (text, e.g. `PR-07`, links the issue to its `MASTER_EXECUTION_PROGRAM.md` §6 entry), `Persona` (single-select matching `07_agent_personas.md`), `Milestone` (single-select M0–M4+).

**Status rules:** an issue may only enter "Ready" once scope, forbidden files, acceptance criteria, and verification steps are filled in — mirroring the existing `ready-for-codex` label's intent without the agent-branded name. An issue may only enter "Done" via PR merge or an explicit no-op decision comment, per `docs/project-management/04_workflows.md` → "Issue Lifecycle."

**Immediate cleanup (tracked, not executed here):** `MASTER_EXECUTION_PROGRAM.md` §8 recommends closing roughly issues #88–#115 as "not planned" (superseded by the roadmap) and creating one issue per §6 PR-item. This proposal endorses that action as the correct first move once PR #274 merges, but does not execute it — closing issues is a founder-approved action, not a documentation change.

---

## 5. Agent Skill Mapping

Six slash commands, each a file under `.claude/commands/`. Unlike the generic template found in the root `agent-skills-main (1).zip` (which is `SPEC.md`-file-driven, project-agnostic, and unaware of GitHub issues), these are rewired to this repo's actual governance stack.

| Command | Reads first | Does | Produces | Repo workflow step |
|---|---|---|---|---|
| **`/spec`** | `MASTER_EXECUTION_PROGRAM.md` §6, `docs/project-management/01_epics.md` | Checks whether the requested work is already a §6 PR-item. If not, drafts a new issue using the matching template in `.github/ISSUE_TEMPLATE/`, filling Objective/Scope/Non-goals/Acceptance Criteria. Never writes code. | A GitHub issue (or a proposed new §6 entry, flagged for founder approval — never auto-inserted) | `docs/project-management/04_workflows.md` → Intake |
| **`/plan`** | The named issue, `docs/ai/ARCHITECTURE_PRINCIPLES.md`, relevant `docs/architecture/*.md` | Enters plan mode (read-only). Required before any PR touching >5 files per `MASTER_EXECUTION_PROGRAM.md` §7. Lists exact files, dependency order, test plan. | A plan block in the PR description or issue comment — not a separate `tasks/plan.md` file, since the roadmap doc already is that plan at the repo level | Intake → Triage |
| **`/build`** | `AGENTS.md`, `PROJECT_STATE.md`, the resolved issue | Branches per `09_branch_strategy.md`, implements only the issue's declared scope, commits with the `<type>: <summary>` format from `04_workflows.md`. Supports an `auto` batch mode (see note below) but the default is one issue, then stop. | Commits on a scoped branch | Implementation |
| **`/test`** | The issue's acceptance criteria, `06_acceptance_criteria_library.md` | Runs `npm run lint/typecheck/build/test`; for bugs, applies the Prove-It pattern (failing regression test first, per the Bug Fix template in `docs/ai/PROMPT_TEMPLATE.md`). | Command output captured verbatim for the PR body | Implementation → pre-PR QA |
| **`/review`** | `05_definition_of_done.md`, `ARCHITECTURE_PRINCIPLES.md` → Anti-Patterns | Self-review against DoD and the issue's "Out of scope" line before requesting human review. Can also be invoked by a human against an already-open PR ("Review PR #214"). | Review notes; applies `needs-review` | Review |
| **`/ship`** | `PROJECT_STATE.md`, `MASTER_EXECUTION_PROGRAM.md` status table, `09_branch_strategy.md` → Protected Branch Policy | Final gate: confirms every DoD item has evidence, confirms `PROJECT_STATE.md` and the roadmap status marker are updated in this PR, confirms no forbidden files were touched. Flips `needs-review` → `ready-for-merge` if all pass; otherwise reports exactly what's missing. | A go/no-go statement, not a merge (merge stays a human action per the "no direct commits to main" guardrail) | Ready for Merge |

**Important naming clarification this proposal must make explicit:** `docs/MASTER_EXECUTION_PROGRAM.md` §6 labels its work items `PR-01` through `PR-38` (e.g., `PR-07 feat(data): regenerate and commit the full Shopify variant index`). These are **roadmap item IDs, not GitHub PR numbers** — GitHub PR #274 is unrelated to roadmap item "PR-01." To make "Execute Issue PR-07 using /build" resolvable without ambiguity, `/spec` (or a one-time bootstrap pass) should create one GitHub issue per §6 entry, **titled with the PR-item ID as a prefix** (`"PR-07 — feat(data): regenerate and commit the full Shopify variant index"`), exactly as `MASTER_EXECUTION_PROGRAM.md` §8 already recommends. Once that exists, "Issue PR-07" unambiguously means one GitHub issue, and `/build` resolves it by title search, not by guessing.

**`/ship`'s fan-out variant:** the generic template in the root zip runs three parallel subagents (`code-reviewer`, `security-auditor`, `test-engineer`) for high-risk changes. Reserve that heavier form for anything touching checkout, pricing, configurator SKU resolution, or the `high-risk` label — everything else uses the single-pass `/review` → `/ship` sequence above. This keeps the common case cheap.

---

## 6. Prompt Minimization

With §1–§5 in place, these are the actual prompt lengths this system targets:

> **Execute next ready issue.**
> *(Agent reads `AGENTS.md` → `PROJECT_STATE.md` → `MASTER_EXECUTION_PROGRAM.md` §6, picks the first unblocked PR-item under the WIP limit, runs `/build`.)*

> **Build issue PR-07.**
> *(Agent resolves "PR-07" to its GitHub issue by title, reads the issue + `docs/architecture/CATALOG_SERVICE.md` + `SHOPIFY_VARIANT_GID_OVERLAY.md` per its declared boundaries, runs `/build`.)*

> **Review PR #214.**
> *(Agent runs `/review` against the diff: DoD checklist, architecture anti-patterns, scope-vs-issue check — no re-explanation of what DoD means needed in the prompt.)*

> **Update project state after merge.**
> *(Agent reads the latest merged PR, updates `docs/PROJECT_STATE.md`'s "Last 5 merged"/"In progress"/"Known red" sections and the matching `MASTER_EXECUTION_PROGRAM.md` status marker, opens a small docs-only PR.)*

> **Replan after blocker: PR-08 needs a decision on whether Navigator Linear Mini is stocked.**
> *(Agent runs `/plan` in "replan" mode from `docs/ai/PROMPT_TEMPLATE.md`'s new template, proposes the smallest unblocking scope change, and — because this is a product-truth question, not a technical one — stops and asks per `MASTER_EXECUTION_PROGRAM.md` §7's "Stop and ask the founder" triggers rather than guessing.)*

Every one of these is a single sentence because the *process* is durable and repo-resident, not because the agent is being asked to infer less carefully.

---

## 7. Guardrails

Each rule below is stated with the exact mechanism that enforces it — a guardrail without an enforcement mechanism is a suggestion, not a guardrail.

| Rule | Enforcement mechanism |
|---|---|
| One issue → one branch → one PR | `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` (existing); `.github/pull_request_template.md`'s "Governing issue" field makes an unlinked PR visually incomplete |
| No work outside the assigned issue | Issue templates' "Files allowed to change" / "Do not change" fields (existing, `02_issue_templates.md`); PR template's "Scope confirmation" checklist |
| No roadmap rewrite without approval | Tier 1 rule in §1 — agents may tick status markers, not restructure §4–6 of `MASTER_EXECUTION_PROGRAM.md`; a documentation issue + founder sign-off is required for structural changes |
| No feature work without acceptance criteria | Issue templates require an Acceptance Criteria section before `ready-for-codex`/"Ready" status is applied (existing, `03_labels.md` + Project status rules in §4) |
| No claiming done without lint/typecheck/test/build evidence | `.github/workflows/ci.yml` (proposed, PR-02) makes this a required check, not a self-report; PR template requires pasted command output |
| No direct commits to `main` | `docs/project-management/09_branch_strategy.md` → Protected Branch Policy (existing); `/ship` explicitly stops short of merging |
| No secrets committed | `docs/project-management/05_definition_of_done.md` (existing); infrastructure issue template requires "Secrets are never committed" as an acceptance item |
| No refactor-only PR unless it reduces launch risk | `docs/project-management/03_labels.md` `refactor` label description (existing) + `MASTER_EXECUTION_PROGRAM.md` §6's own binding rule ("no refactor-only PRs unless they reduce launch risk"); `/plan` must state the risk-reduction justification for any refactor-labeled issue before `/build` proceeds |

---

## 8. Portability

### Generic — extractable to any future TFRS-Admin repo as-is

- `AGENTS.md` skeleton (§2) — the read-order pointer pattern, not the specific file list
- `docs/PROJECT_STATE.md` shape (§2) — In progress / Last N merged / Known red / Last CI result
- `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md`, `IMPLEMENTATION_WORKFLOW.md`, `PROMPT_TEMPLATE.md` structure — strip the TFRSupply-specific layer names (catalog/configurator/commerce) and the skeleton (philosophy → workflow → branch naming → QA requirements → templates) is fully generic
- `docs/project-management/02_issue_templates.md` through `09_branch_strategy.md` — the *shapes* (issue-type templates, label taxonomy columns, DoD checklist categories, dependency-map diagram types, branch-naming grammar) are project-agnostic; only the label *values* and epic *names* are TFRSupply-specific
- `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md`, `.github/workflows/ci.yml` — directly reusable, `ci.yml` in particular already auto-detects the package manager and optional scripts (this was true even in the discarded `tfrs-ai-os-layer-files.zip` draft — that part of the old attempt was good and should be salvaged before the zip is deleted)
- `.claude/commands/{spec,plan,build,test,review,ship}.md` — the six-command mapping in §5 is generic once "MASTER_EXECUTION_PROGRAM.md" is treated as a variable name for "this repo's roadmap doc"
- The four-tier source-of-truth hierarchy itself (§1) — Constitution / Roadmap / State / Ephemeral is a pattern, not TFRSupply content

### Project-specific — stays in this repo only

- `docs/architecture/*.md` content (54 domain docs)
- `docs/MASTER_EXECUTION_PROGRAM.md` content — the actual PR-02…PR-38 plan, readiness scores, risk register
- `docs/project-management/01_epics.md` content (the ten TFRSupply epics)
- Domain-specific labels (`configurator`, `commerce`, `pricing`, `vehicle`) and personas (Commerce, Pricing, Configurator owners) in `03_labels.md` / `07_agent_personas.md`
- Product-domain guardrails ("no invented SKUs," "Shopify owns commerce data") — real for TFRSupply, meaningless boilerplate anywhere else

### Recommendation: a template repository

Extract the "Generic" column above into a new repo, e.g. `TFRS-Admin/engineering-os-template`, structured so `docs/project-management/10_project_bootstrap.md` Phase 1 ("Add governance documents") becomes literally `git clone` + a search-and-replace of domain names, instead of the ad hoc "drop a zip file into the root and hope someone unpacks it" pattern this audit found twice (`tfrs-ai-os-layer-files.zip`, and implicitly `agent-skills-main (1).zip`). This turns bootstrap from a multi-hour agent conversation into a five-minute mechanical step, and it means the *next* repo starts with a working `AGENTS.md` and CI gate on day one instead of week six.

---

## 9. Immediate Next Steps (in order)

This proposal is documentation-only. The concrete implementation sequence, in priority order:

1. **Resolve PR #274.** Merge or explicitly close `docs/MASTER_EXECUTION_PROGRAM.md` + `docs/PRODUCTION_ROADMAP.md` — this operating system's Tier 1 has nothing to point to until that's decided. This is the single highest-leverage next action; everything else in this document assumes it.
2. **Implement PR-02 from `MASTER_EXECUTION_PROGRAM.md`** — `.github/workflows/ci.yml`. Nothing in §7's guardrail table is actually enforced until CI exists.
3. **Create the first implementation PR for this proposal**, scoped to exactly: `AGENTS.md`, `docs/PROJECT_STATE.md`, `.github/ISSUE_TEMPLATE/*`, `.github/pull_request_template.md`, `.claude/commands/*.md`, and the two new templates appended to `docs/ai/PROMPT_TEMPLATE.md` and the new `docs/ai/SESSION_HANDOFF_TEMPLATE.md`. This is a documentation/infrastructure PR — no application code — and should itself be filed as a roadmap item (recommend inserting it as `PR-02b` or folding into PR-02's scope, since `MASTER_EXECUTION_PROGRAM.md` §8 already earmarks issue-template work for "PR-02's follow-up or fold into PR-14").
4. **Bootstrap one GitHub issue per `MASTER_EXECUTION_PROGRAM.md` §6 entry** (PR-02…PR-32, titled with the `PR-nn` prefix per §5's naming clarification), and close the stale #88–#115 batch as "not planned, superseded by MASTER_EXECUTION_PROGRAM.md" — both already recommended in that file's §8.
5. **Delete the three root zip files and `base44/`** — tracked as PR-05, unchanged by this proposal.

After step 3 lands, "Execute Issue PR-07 using /build" works exactly as written.

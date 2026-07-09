# TFRSupply Engineering Playbook

**This is the governing document for AI-assisted engineering in this repository.**

It defines the Engineering Operating System: the repository-native process that lets
Claude Code (or any coding agent) move from roadmap → issue → PR with a one-line
prompt, while the founder stays in control of priorities, architecture, and scope.

This is a **design document**. It does not implement workflows, does not create
GitHub Actions, does not create issue templates, and does not touch source code.
Section 11 lists the implementation PRs that turn this design into working repo
files, in order — but none of them are executed here.

**Relationship to `docs/ENGINEERING_OPERATING_SYSTEM.md`:** a prior session produced
that document as a first design pass. It is good work and this playbook absorbs its
source-of-truth hierarchy, GitHub structure, and `/spec /plan /build /test /review`
mapping rather than re-deriving them. This document supersedes it as the single
canonical design — `ENGINEERING_OPERATING_SYSTEM.md` becomes a pointer (see
Section 12), for the same reason `PRODUCTION_ROADMAP.md` points at
`MASTER_EXECUTION_PROGRAM.md`: **this repo does not carry two competing versions of
the same governing document.** That exact failure mode (PR #270 and PR #274 both
proposing a roadmap; now `ENGINEERING_OPERATING_SYSTEM.md` and this file both
proposing an operating system) is the disease this playbook is designed to cure —
so it must not itself become the third instance of it.

---

## 0. The ten questions, answered directly

1. **What documents become the source of truth?** `docs/MASTER_EXECUTION_PROGRAM.md` for *what to build and in what order*; this file, `docs/ENGINEERING_PLAYBOOK.md`, for *how work moves through the system*; `docs/PROJECT_STATE.md` (new) for *what is true right now*. Everything else is reference material subordinate to these three.
2. **Which documents are stable?** The Tier 0 "Constitution" set in Section 2 — this playbook, `docs/ai/ARCHITECTURE_PRINCIPLES.md`, `docs/project-management/05_definition_of_done.md` and `09_branch_strategy.md`. These change only via a founder-approved documentation PR, never as a side effect of feature work.
3. **Which documents are automatically maintained by Claude?** `docs/PROJECT_STATE.md` (every PR), status markers in `docs/MASTER_EXECUTION_PROGRAM.md` §6 (every PR that closes a roadmap item), `docs/IDEA_BACKLOG.md` (append-only, via `/dump`), `docs/RISKS.md` (append via `/blocker`), `docs/DECISIONS.md` (append via `/decision`). See the classification table in Section 4.
4. **How should roadmap, Issues, PRs, and project state interact?** The roadmap (`MASTER_EXECUTION_PROGRAM.md` §6) is the ordered backlog; each entry becomes exactly one GitHub Issue; each Issue is closed by exactly one PR; each merged PR updates `PROJECT_STATE.md` and the roadmap's status marker **in the same PR**. See Section 5 (lifecycle) and Section 6 (state machine).
5. **How should Claude know what to work on next?** `/next` reads `PROJECT_STATE.md` (what's already in flight) and `MASTER_EXECUTION_PROGRAM.md` §6 (the ordered list) and picks the first unblocked, unclaimed item under the WIP limit. Named work ("build PR-07") resolves directly and skips selection. See Section 7, `/next`.
6. **How should ideas be captured without interrupting work?** `/dump` — appends one entry to `docs/IDEA_BACKLOG.md` and returns immediately to whatever was in progress. It never creates an issue, never changes `PROJECT_STATE.md`'s "in progress" section, never triggers `/plan`. Triage into a real roadmap item is a separate, later, human-gated action.
7. **How should blockers be tracked?** `/blocker` — appends a structured entry to `docs/RISKS.md` (or updates an existing entry), sets the issue's status to `blocked` with a one-line reason, and — if the blocker requires founder input — stops the session per the Section 9 "stop and ask" rules rather than guessing.
8. **How should session handoffs work?** `/handoff` — writes a fixed-shape closing note (Section 7) that becomes the top of `PROJECT_STATE.md`'s "In progress" entry for that item, so the next session's first prompt can be a single sentence. No separate handoff file per session; it lives inside `PROJECT_STATE.md` and is overwritten, not accumulated.
9. **How should future repositories reuse this system?** Section 10 splits every artifact here into repo-agnostic (extractable to a template repo verbatim) and repo-specific (TFRSupply's actual roadmap, architecture docs, domain labels). The generic half is the reusable operating system; the specific half is what makes it *this* repo's.
10. **Which parts belong in GitHub versus the repository?** The repository owns durable process and content (roadmap, state, decisions, risks, architecture, playbook). GitHub owns coordination and review surface (Issues as the unit of assignable work, Projects board as the visual WIP tracker, PRs as the review/merge gate, branch protection as the enforcement mechanism). Section 8 draws the line item by item.

---

## 1. What already exists (do not rebuild)

| Layer | Status | File(s) |
|---|---|---|
| Execution roadmap | Exists (PR #274, merged) | `docs/MASTER_EXECUTION_PROGRAM.md`, `docs/PRODUCTION_ROADMAP.md` (pointer) |
| Prior operating-system design | Exists (PR #275, merged) — **superseded by this file**, see §12 | `docs/ENGINEERING_OPERATING_SYSTEM.md` |
| AI governance playbook | Exists, good, unchanged by this doc | `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md`, `ARCHITECTURE_PRINCIPLES.md`, `IMPLEMENTATION_WORKFLOW.md`, `PROMPT_TEMPLATE.md`, `REPOSITORY_INDEX.md` |
| Project-management governance | Exists, good, unchanged by this doc | `docs/project-management/01_epics.md` … `10_project_bootstrap.md` |
| CI / quality gate | Does not exist | No `.github/` directory; tracked as roadmap item PR-02 |
| Issue/PR templates | Documented, not wired to GitHub | `docs/project-management/02_issue_templates.md`; tracked as roadmap item PR-14 follow-up |
| `AGENTS.md` | Does not exist | Proposed here, Section 3 |
| `docs/PROJECT_STATE.md` | Does not exist | Proposed here, Section 3 |
| `docs/IDEA_BACKLOG.md`, `DECISIONS.md`, `RISKS.md`, `LESSONS_LEARNED.md` | Do not exist | Proposed here, Section 3 |
| Slash commands (`/spec /plan /build /test /review`, `/dump /next /status /resume /blocker /decision /handoff`) | Do not exist | Proposed here, Section 7 |
| GitHub issue backlog | 113 open issues, mostly stale process/meta issues predating the roadmap | Cleanup already recommended in `MASTER_EXECUTION_PROGRAM.md` §8; unchanged by this doc |

This playbook does not repeat content that already lives correctly in
`docs/ai/*` or `docs/project-management/*` — it cites those files and defines the
missing connective tissue: state tracking, idea capture, blocker/decision logging,
handoffs, and the command vocabulary that ties it all together.

---

## 2. Source-of-truth hierarchy

Five tiers, ordered by how often they change and who is allowed to change them.
This is the answer to question 1 and 2, expanded.

### Tier 0 — Constitution (stable; founder-approved documentation PR only)

| Doc | Governs |
|---|---|
| `docs/ENGINEERING_PLAYBOOK.md` (this file) | The operating system itself — lifecycle, commands, governance |
| `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` | Philosophy, one-issue-one-branch-one-PR, QA requirements |
| `docs/ai/ARCHITECTURE_PRINCIPLES.md` | Dependency direction, layer ownership, anti-patterns |
| `docs/project-management/05_definition_of_done.md` | The exit bar every PR must clear |
| `docs/project-management/09_branch_strategy.md` | Branch naming, merge policy, protected-branch policy |

A change to any Tier 0 doc requires its own documentation-only PR, reviewed by the
founder, never bundled into a feature PR "while I was in there."

### Tier 1 — Roadmap (dynamic content, stable structure)

| Doc | Governs | Who edits what |
|---|---|---|
| `docs/MASTER_EXECUTION_PROGRAM.md` | The single ordered plan: objectives → milestones → epics → PR-by-PR execution list | Claude may tick status markers and append new PR-items **at the correct phase position**. Claude may not reorder milestones, change v1.0 scope, add a new Objective, or write a second roadmap document. |
| `docs/PRODUCTION_ROADMAP.md` | Pointer only | Never gains content of its own |

### Tier 2 — State (dynamic; Claude updates automatically, no approval needed)

| Doc | Governs |
|---|---|
| `docs/PROJECT_STATE.md` | What's true right now: current milestone, in-flight issues, last N merged PRs, known-red items, last CI result |
| `docs/IDEA_BACKLOG.md` | Uncommitted ideas captured via `/dump`, append-only until triaged |
| `docs/RISKS.md` | Open blockers and risks, captured via `/blocker`, updated as they resolve |
| `docs/DECISIONS.md` | Architectural/business decisions, captured via `/decision`, append-only (superseding a decision adds a new entry that references the old one — it does not delete history) |

These four are the files every session reads and writes without asking permission,
because they record *facts about work that already happened*, not *choices about
what should happen*. That distinction — record vs. decide — is what separates Tier 2
from Tier 1.

### Tier 3 — Reference (stable per-domain; updated in the same PR that changes the boundary)

| Docs | Governs |
|---|---|
| `docs/architecture/*.md` (54 files) | Per-domain service/adapter/schema boundaries |
| `docs/project-management/01_epics.md`, `02_issue_templates.md`, `03_labels.md`, `04_workflows.md`, `06_acceptance_criteria_library.md`, `07_agent_personas.md`, `08_dependency_map.md`, `10_project_bootstrap.md` | Supporting process detail |
| `docs/typescript/TYPESCRIPT_FOUNDATION.md`, `docs/migrations/*.md` | Migration and typing conventions |
| `docs/LESSONS_LEARNED.md` (new) | Durable process/technical lessons, reviewed periodically, not a hot-path file |

### Tier 4 — Ephemeral (session-scoped; never a source of truth for the next session)

PR descriptions, issue comments, `/status` output. Useful in the moment; superseded
the instant `PROJECT_STATE.md` is updated. Never cite a PR comment as the reason for
a later decision — cite `DECISIONS.md`.

### Read order for any agent, any session

1. `AGENTS.md` — one-paragraph pointer (Section 3).
2. `docs/PROJECT_STATE.md` — what's in flight, so work isn't duplicated.
3. `docs/MASTER_EXECUTION_PROGRAM.md` §6 — find the named item, or let `/next` pick one.
4. `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` + `ARCHITECTURE_PRINCIPLES.md` (if not already loaded this session).
5. The specific `docs/architecture/<DOMAIN>.md` file(s) the issue names.
6. `docs/project-management/05_definition_of_done.md` — the exit bar.

---

## 3. Repository deliverables and classification

Recommended structure. Not yet created — this section is the spec for the
implementation PR in Section 11.

```
AGENTS.md                                  ← new

docs/
  ENGINEERING_PLAYBOOK.md                  ← this file
  MASTER_EXECUTION_PROGRAM.md              ← exists (PR #274)
  PRODUCTION_ROADMAP.md                    ← exists, pointer
  PROJECT_STATE.md                         ← new
  IDEA_BACKLOG.md                          ← new
  DECISIONS.md                             ← new
  RISKS.md                                 ← new
  LESSONS_LEARNED.md                       ← new
  ai/                                       ← exists, unchanged
  architecture/                             ← exists, unchanged
  project-management/                       ← exists, unchanged

.github/
  ISSUE_TEMPLATE/                           ← new (ports 02_issue_templates.md)
  pull_request_template.md                  ← new
  workflows/ci.yml                          ← new (roadmap item PR-02, out of scope here)

.claude/
  commands/
    spec.md  plan.md  build.md  test.md  review.md
    dump.md  next.md  status.md  resume.md  blocker.md  decision.md  handoff.md
```

Classification axes: **cadence** (Static / Semi-static / Auto-maintained) and
**ownership** (Human-owned / Claude-owned / Shared).

| Doc | Cadence | Ownership | Notes |
|---|---|---|---|
| `AGENTS.md` | Static | Human-owned | Changes only alongside a Tier 0 change |
| `docs/ENGINEERING_PLAYBOOK.md` | Static | Human-owned | Founder-approved edits only |
| `docs/MASTER_EXECUTION_PROGRAM.md` | Semi-static | Shared | Structure is human-owned; status markers are Claude-maintained |
| `docs/PROJECT_STATE.md` | Auto-maintained | Claude-owned | Rewritten (not appended) every merged PR |
| `docs/IDEA_BACKLOG.md` | Auto-maintained | Claude-owned (capture) / Human-owned (triage) | Claude appends via `/dump`; only a human moves an entry into the roadmap |
| `docs/DECISIONS.md` | Auto-maintained | Shared | Claude records via `/decision`; only records decisions that were actually made — by the founder in conversation, or by Claude within its delegated authority (Section 9) |
| `docs/RISKS.md` | Auto-maintained | Shared | Claude records/updates via `/blocker`; founder resolves or reprioritizes |
| `docs/LESSONS_LEARNED.md` | Semi-static | Human-owned (curated), Claude-proposed | Claude proposes entries during `/handoff`; a human periodically prunes/consolidates |
| `docs/architecture/*.md` | Semi-static | Shared | Updated in the same PR that changes a boundary, normal review |
| `docs/project-management/*` | Static | Human-owned | Rarely changes; process/taxonomy definitions |
| `.github/ISSUE_TEMPLATE/*`, `pull_request_template.md` | Static | Human-owned | Config, not content |
| `.claude/commands/*.md` | Static | Human-owned | The command vocabulary itself — see Section 7 |

---

## 4. The lifecycle

```
Vision                          docs/project-management/01_epics.md (north star, #107)
  ↓
Roadmap                         docs/MASTER_EXECUTION_PROGRAM.md (objectives → milestones)
  ↓
Epic                            docs/project-management/01_epics.md (EPIC-01..10)
  ↓
Milestone                       MASTER_EXECUTION_PROGRAM.md §5/§6 (M0..M4+)
  ↓
Issue                           GitHub Issue, one per §6 PR-item, titled "PR-nn — <title>"
  ↓
/spec                           confirm scope/acceptance criteria are complete; draft if missing
  ↓
/plan                           read-only plan: files, order, test plan (>5-file changes require this)
  ↓
/build                          implement exactly the issue's declared scope, on its own branch
  ↓
/test                           npm run lint / typecheck / build / test; capture evidence
  ↓
/review                         self-review against DoD + issue scope before requesting human review
  ↓
PR                              opened via .github/pull_request_template.md, links the issue
  ↓
Merge                           human action; branch protection enforces CI + review (once PR-02 lands)
  ↓
Project State Update            docs/PROJECT_STATE.md + MASTER_EXECUTION_PROGRAM.md §6 marker,
                                 in the SAME PR that closes the issue
  ↓
Next Issue                      /next picks the following unblocked item
```

**The rule that makes this a system and not a suggestion:** every arrow above is
either a file (roadmap, issue, PR) or a command (Section 7). Nothing in the chain
depends on an agent remembering context from a prior conversation — each step reads
what it needs from the repository, not from chat history.

---

## 5. State machine (roadmap ↔ Issues ↔ PRs ↔ PROJECT_STATE.md)

```
MASTER_EXECUTION_PROGRAM.md §6 entry
        │
        │ (one-time bootstrap, or /spec if missing)
        ▼
   GitHub Issue  ──────────────► Project board: Backlog
        │                                │
        │ acceptance criteria filled     │ /next or human assigns
        ▼                                ▼
   Project board: Ready ──────────► Project board: In Progress (WIP ≤ 2)
                                          │
                                          │ /build → /test → /review
                                          ▼
                                    PR opened, linked "Closes #N"
                                          │  Project board: In Review
                                          │ human review + CI
                                          ▼
                                       Merged
                                          │
                                          │  same PR contains:
                                          │  - PROJECT_STATE.md update
                                          │  - MASTER_EXECUTION_PROGRAM.md §6 marker → ✅ merged (#nnn)
                                          ▼
                                    Project board: Done
```

**Invariants this state machine enforces:**
- A roadmap item and a GitHub Issue are always 1:1 — no orphan issues, no roadmap
  items without a tracking issue once work starts on them.
- An Issue and its closing PR are always 1:1 (one issue → one branch → one PR,
  already the rule in `AI_DEVELOPMENT_PLAYBOOK.md`).
- `PROJECT_STATE.md` never lags — it is updated in the merging PR, not a follow-up.
- The WIP limit (2, per `MASTER_EXECUTION_PROGRAM.md` §8) is what a 113-issue,
  zero-open-PR backlog looked like *without* this constraint. It is the single
  mechanical fix for "going in circles."

---

## 6. Command vocabulary

Two families. **Lifecycle commands** (`/spec /plan /build /test /review`) execute
roadmap work end-to-end. **Session-management commands** (`/dump /next /status
/resume /blocker /decision /handoff`) manage attention, state, and continuity around
that work — these are the ones this task calls out explicitly, so they're specified
in full first.

### `/dump` — capture an idea without interrupting work

| | |
|---|---|
| **Purpose** | Record a stray idea, observation, or "we should eventually..." thought the instant it occurs, with zero disruption to whatever is currently in progress. |
| **Inputs** | Free-text: the idea, and optionally a one-word category (`feature`, `tech-debt`, `data`, `process`). |
| **Outputs** | A confirmation line ("Captured to IDEA_BACKLOG.md — resuming <current work>"). Nothing else changes. |
| **Files updated** | `docs/IDEA_BACKLOG.md` — one appended entry: `- [YYYY-MM-DD] <idea text> (source: <issue/PR-item if mid-work, else "ad hoc">)`. |
| **When to use** | Any time, including mid-`/build`. Never triggers `/spec`, never touches `PROJECT_STATE.md`'s "in progress" section, never changes branch. |
| **Explicitly does not** | Create an issue. Prioritize. Estimate effort. That's a human triage pass, later, moving entries from `IDEA_BACKLOG.md` into `MASTER_EXECUTION_PROGRAM.md` §6 by hand or via a founder-requested `/spec`. |

### `/next` — determine the next ready issue

| | |
|---|---|
| **Purpose** | Answer "what should I work on" without the founder re-deriving priority order every session. |
| **Inputs** | None required. Optional: a milestone filter (`/next M1`). |
| **Outputs** | The chosen issue's identifier, title, and a one-line justification ("first unblocked PR-item in M1, WIP is 1/2"). |
| **Files updated** | None by itself — selection is read-only. (`/build`, invoked next, is what writes files.) |
| **When to use** | Start of a session with unnamed work ("what's next", "keep going", a bare `/next`). |
| **Selection logic** | Scan `MASTER_EXECUTION_PROGRAM.md` §6 top-to-bottom for the first entry that is (a) not marked merged, (b) not blocked per `RISKS.md`, (c) has an open GitHub Issue not already in `PROJECT_STATE.md`'s "In progress," and (d) would not push "In progress" past the WIP limit of 2. If none exists in the current milestone, report that the milestone is exit-ready rather than skipping ahead to a later milestone. |

### `/status` — summarize current project state

| | |
|---|---|
| **Purpose** | Give a human a fast, accurate read of where the project stands without them reading `PROJECT_STATE.md`, the roadmap, and the Issues list themselves. |
| **Inputs** | None. |
| **Outputs** | A short report: current milestone + exit criterion progress, in-progress items, last N merged, known red/blocked items, last CI result — i.e., `PROJECT_STATE.md` rendered as prose. |
| **Files updated** | None. Read-only. |
| **When to use** | Any time a human wants an update; safe to run mid-session without disrupting anything. |

### `/resume` — continue the active issue

| | |
|---|---|
| **Purpose** | Pick a session back up on an issue that was already in progress, using the handoff note instead of re-deriving context. |
| **Inputs** | Optionally an issue/PR-item ID; if omitted, resumes whatever `PROJECT_STATE.md` lists as "In progress" for this session (or the single item if there's exactly one). |
| **Outputs** | A restated summary of what's done, what's left, and the next concrete action, then proceeds with `/build`. |
| **Files updated** | None by itself; whatever `/build`/`/test` touch next. |
| **When to use** | Start of any session continuing prior work — the intended common case, since it's how `/handoff`'s output gets consumed. |

### `/blocker` — record a blocker

| | |
|---|---|
| **Purpose** | Make a stuck state visible and durable instead of silently stalling or, worse, guessing past it. |
| **Inputs** | The blocked issue/PR-item, a one-line reason, and a classification: `needs-founder-input` (product truth, credentials, scope decision) vs. `technical` (something to retry/replan). |
| **Outputs** | Confirmation the blocker is logged; if `needs-founder-input`, the session stops per Section 9 rather than proceeding. |
| **Files updated** | `docs/RISKS.md` (new or updated entry with issue link, date, reason, classification, status); the issue's label set to `blocked`; `docs/PROJECT_STATE.md`'s "Known red / blocked" section. |
| **When to use** | The moment work cannot proceed — a failing dependency, an ambiguous requirement, a missing credential, contradictory data. Do not wait until end-of-session; log it the moment it's discovered so `/handoff` doesn't have to reconstruct it. |

### `/decision` — record an architectural or business decision

| | |
|---|---|
| **Purpose** | Make a decision durable and citable so the next session doesn't re-litigate it or, worse, silently reverse it. |
| **Inputs** | The decision statement, the alternatives considered (briefly), and who made the call (founder, or Claude within delegated authority per Section 9). |
| **Outputs** | Confirmation the decision is logged, with the entry's reference ID for citing in future PRs/issues. |
| **Files updated** | `docs/DECISIONS.md` — append-only entry: `## D-<nnn> — <date> — <title>` with Context / Decision / Alternatives considered / Owner / Supersedes (if any). |
| **When to use** | Any time a non-obvious choice is made that a future session could plausibly get wrong by guessing — architecture boundary calls, scope cuts, data-truth resolutions, "we decided not to do X." Not for routine implementation choices already dictated by `ARCHITECTURE_PRINCIPLES.md`. |

### `/handoff` — prepare the repository for another session

| | |
|---|---|
| **Purpose** | End a session in a state where the next session (possibly a different agent, possibly days later) can start from a single sentence. |
| **Inputs** | None required — synthesizes from the session's own actions. |
| **Outputs** | A written closing note and an explicit "what's next" pointer. |
| **Files updated** | `docs/PROJECT_STATE.md` (the authoritative update — "In progress" entry rewritten with current status, QA evidence, and next action; "Last N merged" updated if a PR landed this session); `docs/IDEA_BACKLOG.md` and `docs/RISKS.md` if anything was captured but not yet filed via `/dump`/`/blocker` during the session. |
| **When to use** | End of every session that touched roadmap work, whether or not a PR was opened. Cheap to run — it's a diff to one file, not a new essay. |

### `/spec` — turn a roadmap item (or new idea) into a ready GitHub Issue

| | |
|---|---|
| **Purpose** | Ensure work has scope, acceptance criteria, and verification steps before anyone starts building. |
| **Inputs** | A `MASTER_EXECUTION_PROGRAM.md` §6 entry, or a founder-approved `IDEA_BACKLOG.md` entry being promoted. |
| **Outputs** | A GitHub Issue using the matching `.github/ISSUE_TEMPLATE/*` type, filled with Objective / Scope / Out of scope / Files / Acceptance criteria / Verification. |
| **Files updated** | None in the repo directly (GitHub Issue only) unless this is a genuinely new roadmap item, in which case it's proposed as a §6 addition and flagged for founder approval, never auto-inserted. |
| **When to use** | Before any issue enters "Ready" on the project board. Never writes code. |

### `/plan` — read-only implementation plan

| | |
|---|---|
| **Purpose** | Force a "look before you leap" pass on anything nontrivial. |
| **Inputs** | The Issue, `ARCHITECTURE_PRINCIPLES.md`, the relevant `docs/architecture/*.md` file(s). |
| **Outputs** | File list, dependency order, test plan — posted as a PR/issue comment, not a separate file (the roadmap doc is already the repo-level plan). |
| **Files updated** | None. |
| **When to use** | Required before any PR touching more than 5 files. Also the mode used for "replan after blocker" (Section 9). |

### `/build` — implement the issue's declared scope

| | |
|---|---|
| **Purpose** | Do the work. |
| **Inputs** | The Issue, `PROJECT_STATE.md` (to avoid duplicating in-flight work). |
| **Outputs** | Commits on a scoped branch named per `09_branch_strategy.md`. |
| **Files updated** | Only files inside the issue's declared scope. |
| **When to use** | After `/spec` and (if needed) `/plan`. One issue only — never batches multiple roadmap items in one `/build` invocation. |

### `/test` — verify the work

| | |
|---|---|
| **Purpose** | Produce evidence, not a claim. |
| **Inputs** | The issue's acceptance criteria. |
| **Outputs** | Captured output of `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`; for bug fixes, a failing-first regression test. |
| **Files updated** | Test files as needed; no source changes beyond what `/build` already made. |
| **When to use** | Before opening a PR, always. |

### `/review` — self-review before requesting human review

| | |
|---|---|
| **Purpose** | Catch scope creep and DoD gaps before a human has to. |
| **Inputs** | The diff, `05_definition_of_done.md`, `ARCHITECTURE_PRINCIPLES.md` → Anti-Patterns. |
| **Outputs** | A pass/fail self-assessment; opens the PR (via `.github/pull_request_template.md`) if it passes, or lists exactly what's missing if it doesn't. |
| **Files updated** | The PR itself; `PROJECT_STATE.md` + roadmap marker as described in Section 5, in the same PR. |
| **When to use** | The last step before a PR exists. Also invocable by a human against an already-open PR ("review PR #214"). |

---

## 7. Prompt minimization in practice

With Sections 3–6 in place as repo files, these become the actual prompts this
system targets — each one resolves against durable repo state instead of chat
history:

> **`/next`**
> *(reads PROJECT_STATE.md + roadmap §6, picks the first unblocked item under WIP 2, states it)*

> **`/resume`**
> *(reads PROJECT_STATE.md's "In progress" entry, restates status + next action, continues)*

> **`/dump: consider a saved-cart-for-later feature once accounts exist`**
> *(appends one line to IDEA_BACKLOG.md, resumes whatever was running)*

> **Build issue PR-07.**
> *(resolves "PR-07" to its GitHub issue by title, runs /plan if >5 files, then /build → /test → /review)*

> **`/blocker: PR-08 needs a decision on whether Navigator Linear Mini is stocked`**
> *(logs to RISKS.md, classifies needs-founder-input, stops and asks per Section 9)*

> **`/handoff`**
> *(rewrites PROJECT_STATE.md's in-progress entry with status, evidence, and next action)*

Every one of these is a single line because the process is repo-resident, not
because the agent infers more from less — it reads the same amount of ground truth
either way, just from files instead of scrollback.

---

## 8. GitHub vs. repository — where each piece lives

| Concern | Lives in | Why |
|---|---|---|
| What to build, in what order | Repository (`MASTER_EXECUTION_PROGRAM.md`) | Needs version history, diffable structure, and to survive independent of any single GitHub view |
| How the process works | Repository (this file, `docs/ai/*`) | Same reason — it's a document, not a workflow tool's config |
| What's true right now | Repository (`PROJECT_STATE.md`) | Must be `git`-diffable and readable by an agent with only filesystem access (no API calls needed) |
| Decisions, risks, ideas | Repository (`DECISIONS.md`, `RISKS.md`, `IDEA_BACKLOG.md`) | Durable, versioned, greppable; GitHub Issue search is not a substitute for a chronological decision log |
| Unit of assignable, reviewable work | GitHub (Issues) | Needs assignment, comments, cross-linking to PRs, label filtering — repo files can't do this |
| Visual WIP tracking | GitHub (Projects v2 board) | Needs drag-and-drop status, custom fields, filtering — exactly what Projects is for |
| Code review and merge gate | GitHub (PRs + branch protection) | Needs diff view, required checks, review approval — this is what PRs are for |
| CI enforcement | GitHub (`.github/workflows/ci.yml`) | Must run on GitHub's infrastructure to gate merges |
| Issue/PR shape | GitHub (`.github/ISSUE_TEMPLATE/`, `pull_request_template.md`) — content ported from repo docs | The template *content* is repo-owned (`02_issue_templates.md`); the template *file* must live in `.github/` for GitHub's UI to surface it |

**Rule of thumb:** if it needs to be read by an agent with only `git clone` access
and no GitHub API, it belongs in the repository. If it needs assignment, review
gating, or a visual board, it belongs in GitHub — but its *content shape* should
still be authored in the repository and ported, never invented ad hoc in GitHub's UI.

---

## 9. Governance

### Claude may do automatically, without asking

- Tick a status marker in `MASTER_EXECUTION_PROGRAM.md` §6 (`✅ merged (#nnn)`).
- Append a new PR-item to §6 **at the correct phase position**, if discovered as necessary mid-implementation (e.g., PR-24 was added this way in the original roadmap design).
- Update `docs/PROJECT_STATE.md` in the same PR that closes an issue.
- Append entries to `docs/IDEA_BACKLOG.md`, `docs/RISKS.md`, `docs/DECISIONS.md` via `/dump`, `/blocker`, `/decision`.
- Update the specific `docs/architecture/<DOMAIN>.md` file in the same PR that changes that domain's boundary.
- Fix a stale test assertion that no longer matches intentional, already-shipped UI (not a silent behavior change).

### Requires founder approval

- Any change to a Tier 0 Constitution document (Section 2), including this playbook.
- Reordering milestones, changing v1.0 launch scope, or adding a new Objective in `MASTER_EXECUTION_PROGRAM.md`.
- Promoting an `IDEA_BACKLOG.md` entry into a roadmap item.
- Any decision resolving product truth (is a SKU stocked, what a policy says, what a price should be) — logged via `/decision` only after the founder actually made the call.
- Enabling any live external integration (payment provider live mode, analytics IDs, real credentials of any kind).
- Closing the stale issue backlog (#88–#115) — recommended, not self-executed.

### Requires a new issue (not a scope expansion of the current one)

- Any file change outside the current issue's declared scope.
- Any refactor not justified as directly reducing launch risk (per `MASTER_EXECUTION_PROGRAM.md` §6's binding rule).
- A bug discovered while working a different issue — log it (`/dump` or `/blocker` depending on severity), do not fix it inline unless it blocks the current issue's acceptance criteria.

### Requires a roadmap revision (documentation PR, founder-approved)

- Adding/removing a Milestone or Epic.
- Changing the v1.0 launch definition (Section 4 of `MASTER_EXECUTION_PROGRAM.md`).
- Changing the source-of-truth hierarchy in this playbook.

### Never happens automatically

- **Never reprioritize the roadmap.** Order in §6 is priority order; an agent doesn't reshuffle it because something looks more interesting or more urgent — that's a `/blocker` + founder decision, not a silent reorder.
- **Never rewrite architecture.** Boundary changes go through the normal architecture-doc-update-in-the-same-PR process (Tier 3), not a unilateral redesign.
- **Never mark work complete without verification.** "Done" requires `/test` evidence in the PR body, per the Definition of Done — a claim without captured command output is not done.
- **Never work outside the assigned issue.** One issue → one branch → one PR is load-bearing, not a style preference.
- **Never create scope creep.** If `/plan` reveals the issue is bigger than scoped, stop and propose a split — don't quietly absorb the extra work.
- **Never merge to `main` directly.** Merge is a human action; `/review` stops short of it even when every check passes.
- **Never guess past a product-truth or credential gap.** That's what `/blocker` with `needs-founder-input` is for.
- **Never let two documents claim to be the same source of truth.** (See Section 12 — this rule applies to this playbook's own existence.)

---

## 10. Portability

### Repository-agnostic (extractable to any future repo as-is)

- The five-tier source-of-truth hierarchy (Section 2) — Constitution / Roadmap / State / Reference / Ephemeral is a pattern, not TFRSupply content.
- `AGENTS.md` skeleton (Section 3) — the read-order-pointer pattern.
- `docs/PROJECT_STATE.md`, `IDEA_BACKLOG.md`, `DECISIONS.md`, `RISKS.md`, `LESSONS_LEARNED.md` shapes (Section 3) — the file *structure*, not their current contents.
- The full command vocabulary (Section 6) — `/dump /next /status /resume /blocker /decision /handoff /spec /plan /build /test /review` — generic once "MASTER_EXECUTION_PROGRAM.md" and "the roadmap" are treated as variables pointing at whatever this repo's roadmap doc is named.
- The state machine (Section 5) and lifecycle diagram (Section 4) — the flow, not the milestone names.
- The governance rules (Section 9) — "never reprioritize," "never mark done without verification," etc. are universal engineering discipline, not domain-specific.
- The GitHub-vs-repository split (Section 8).
- `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` / `IMPLEMENTATION_WORKFLOW.md` / `PROMPT_TEMPLATE.md` structure, and `docs/project-management/02_issue_templates.md` through `09_branch_strategy.md` *shapes* — already noted as portable in the prior design pass; unchanged here.

### Repository-specific (stays in TFRSupply only)

- `docs/MASTER_EXECUTION_PROGRAM.md`'s actual content — the PR-02…PR-38 plan, readiness scores, risk register.
- `docs/architecture/*.md` content (54 domain docs).
- `docs/project-management/01_epics.md`'s ten TFRSupply epics.
- Domain labels (`configurator`, `commerce`, `pricing`, `vehicle`) and personas (`07_agent_personas.md`).
- Product-domain guardrails ("no invented SKUs," "Shopify owns commerce data") — real here, meaningless boilerplate elsewhere.

### Recommendation

Extract the repository-agnostic column into a template repository (e.g.
`TFRS-Admin/engineering-os-template`) so bootstrapping a new repo is `git clone` +
search-and-replace of domain names, rather than another multi-hour design
conversation. This was already recommended in the prior design pass and stands
unchanged — it is the single highest-leverage portability action, and it is
explicitly **not** part of this document's own scope to execute.

---

## 11. Immediate next steps (design only — none executed by this document)

In priority order, each becomes its own issue/PR under the normal lifecycle above
once approved:

1. **Founder reviews and approves this playbook** (Tier 0 — requires explicit sign-off before anything below proceeds).
2. **Retire `docs/ENGINEERING_OPERATING_SYSTEM.md`** to a pointer at this file (Section 12) — a small, reversible documentation edit, bundled with step 1's PR.
3. **Create `AGENTS.md` and the four Tier-2 state files** (`PROJECT_STATE.md`, `IDEA_BACKLOG.md`, `DECISIONS.md`, `RISKS.md`) with their initial empty/seed content — a documentation-only PR.
4. **Create `.claude/commands/*.md`** for the twelve commands in Section 6 — the literal slash-command implementations.
5. **Port `.github/ISSUE_TEMPLATE/*` and `pull_request_template.md`** from `docs/project-management/02_issue_templates.md` and this playbook's Section 8.
6. **Implement `docs/MASTER_EXECUTION_PROGRAM.md` roadmap item PR-02** (`.github/workflows/ci.yml`) — already tracked there; this playbook depends on CI existing for its governance rules (Section 9) to be enforced rather than self-reported.
7. **Bootstrap one GitHub Issue per `MASTER_EXECUTION_PROGRAM.md` §6 entry**, close the stale #88–#115 batch as superseded — already recommended in that document's §8.

After step 4 lands, a bare `/next` or `/resume` works exactly as described in
Section 7.

---

## 12. Disposition of `docs/ENGINEERING_OPERATING_SYSTEM.md`

That document's analysis (Section 0/1 of it: what exists, what's missing, the
zip-file archaeology) and its GitHub-structure recommendations were sound and are
carried forward into Sections 1, 5, and 8 above. Its command mapping
(`/spec /plan /build /test /review /ship`) is carried forward into Section 6, with
`/ship` folded into `/review`'s "opens the PR" step here since a separate
pre-merge-gate command added a step without adding a distinct file output.

Once this playbook is approved (Section 11, step 1), `ENGINEERING_OPERATING_SYSTEM.md`
should be replaced with a short pointer to this file, identical in spirit to how
`docs/PRODUCTION_ROADMAP.md` points to `docs/MASTER_EXECUTION_PROGRAM.md`. This
document does not perform that edit itself — it is proposed here as step 2 of
Section 11, pending founder approval, so that the repository is never left with two
files simultaneously claiming to define the operating system.

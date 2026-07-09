<!-- Purpose: The one map of this repository's documentation — read order, authority, and update rules. -->
# Documentation Hierarchy

This is the single map of how this repository's documentation fits together: where an agent starts, what it reads next, and who is allowed to change what. It exists so authority is never ambiguous — if a question about "which document governs X" isn't answered by this page, that's a bug in this page, not a judgment call to make in the moment.

## Where A New AI Agent Starts

**[`AGENTS.md`](../AGENTS.md) — always, first, with no exceptions.** Every other AI-instruction document in this repository either points back to it or is reference material consulted only after it.

## What It Reads Next

```text
AGENTS.md                         (entry point — read first, always)
  ↓
CLAUDE.md                         (Claude-specific conventions, layered on AGENTS.md)
  ↓
AI_AGENT_OPERATING_MODEL.md       (the operating loop: session start → pick issue → implement → verify → stop)
  ↓
DECISION_ROUTER.md                (routes the specific request to a tfrs-engineering-playbook command)
  ↓
  ├─ Task touches this codebase's implementation? → docs/ai/AI_DEVELOPMENT_PLAYBOOK.md →
  │    docs/ai/IMPLEMENTATION_WORKFLOW.md → docs/ai/ARCHITECTURE_PRINCIPLES.md → docs/ai/PROMPT_TEMPLATE.md
  │    (index: docs/ai/REPOSITORY_INDEX.md)
  ├─ Task touches a structural boundary? → ARCHITECTURE.md → the specific docs/architecture/<DOMAIN>.md
  ├─ Task needs process detail (labels, DoD, branch strategy, personas)? → docs/project-management/*
  └─ Task needs execution mechanics for a command? → the matching skill in TFRS-Admin/agent-skills,
       per tfrs-engineering-playbook's SKILLS_STANDARD.md
```

`AGENTS.md`, `CLAUDE.md`, `AI_AGENT_OPERATING_MODEL.md`, and `DECISION_ROUTER.md` are the four Minimum Baseline files — every other document in this list is repository-specific detail consulted *underneath* that baseline, never a substitute for it.

## Single Source of Truth, By Concept

| Concept | Single source of truth | Notes |
| --- | --- | --- |
| **Engineering workflow** (which command to run, when; lifecycle phases) | [`tfrs-engineering-playbook`](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`commands/`, `DECISION_ROUTER.md`), mirrored locally by the four Minimum Baseline files | `docs/ENGINEERING_PLAYBOOK.md`, `docs/ENGINEERING_OPERATING_SYSTEM.md`, and `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` are **not** workflow authorities — see their headers |
| **Roadmap ownership** (what to build, in what order) | [`docs/MASTER_EXECUTION_PROGRAM.md`](./MASTER_EXECUTION_PROGRAM.md) | `docs/PRODUCTION_ROADMAP.md` is a pointer only, by its own explicit statement — never add roadmap content there |
| **Project state** (what's in flight right now) | **GitHub** (Issues and, once created, the GitHub Project board) | Per `AI_AGENT_OPERATING_MODEL.md#2-how-to-determine-current-work`: "Current work is whatever GitHub says it is." `docs/ENGINEERING_PLAYBOOK.md` proposed a local `docs/PROJECT_STATE.md` file — it was never built and is not in effect; do not create it without reopening that decision. GitHub Project setup is currently degraded (see `docs/PLAYBOOK_ADOPTION.md`) — the fallback is structured-text fields in issue bodies, not a local state file. |
| **AI operating rules** (conventions, loop, routing) | The four Minimum Baseline files: [`AGENTS.md`](../AGENTS.md), [`CLAUDE.md`](../CLAUDE.md), [`AI_AGENT_OPERATING_MODEL.md`](../AI_AGENT_OPERATING_MODEL.md), [`DECISION_ROUTER.md`](../DECISION_ROUTER.md) | All four are local mirrors of `tfrs-engineering-playbook`; `AI_AGENT_OPERATING_MODEL.md` and `DECISION_ROUTER.md` are repo-agnostic and must not diverge from upstream locally |

## Document Classification

### Static — change rarely, and only deliberately

| Document | Who may change it |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md`, `AI_AGENT_OPERATING_MODEL.md`, `DECISION_ROUTER.md` | Founder approval required (see below) — these mirror `tfrs-engineering-playbook`; a local edit that isn't a re-sync from upstream creates drift |
| `docs/project-management/*` (epics, labels, DoD, acceptance criteria library, agent personas, branch strategy) | Founder approval required — Tier-3 process/taxonomy definitions, rarely revised |
| `docs/ENGINEERING_PLAYBOOK.md`, `docs/ENGINEERING_OPERATING_SYSTEM.md` | Founder approval required — historical record; edits should be corrections, not new proposals |
| `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md`, `IMPLEMENTATION_WORKFLOW.md`, `ARCHITECTURE_PRINCIPLES.md`, `PROMPT_TEMPLATE.md`, `REPOSITORY_INDEX.md` | Claude may propose edits in the same PR as a related change (e.g. adding a new `docs/architecture/*.md` row to `REPOSITORY_INDEX.md`); structural rewrites need founder sign-off |
| `docs/DOCUMENTATION_HIERARCHY.md` (this file) | Founder approval required — the map itself should not silently drift |

### Claude may update automatically, without approval

| Document | When |
| --- | --- |
| `ARCHITECTURE.md` | Same PR that changes a structural boundary |
| `docs/architecture/<DOMAIN>.md` | Same PR that changes that domain's boundary |
| `docs/MASTER_EXECUTION_PROGRAM.md` §6 status markers | Ticking a status marker (`✅ merged (#nnn)`) after a merged PR — restructuring milestones/scope still requires founder approval |
| `docs/PLAYBOOK_ADOPTION.md` | Re-running the Repository Readiness Checklist and recording the new result |
| GitHub Issues / PRs / Project fields | Per `AI_AGENT_OPERATING_MODEL.md#5-how-to-update-github` — this is the actual project-state source of truth and is expected to change continuously |
| `docs/ai/REPOSITORY_INDEX.md` row additions | Adding a row for a new top-level doc, in the same PR that introduces it (its own stated rule) |

### Requires founder approval before changing

- Any of the four Minimum Baseline files (`AGENTS.md`, `CLAUDE.md`, `AI_AGENT_OPERATING_MODEL.md`, `DECISION_ROUTER.md`) — changes belong upstream in `tfrs-engineering-playbook` first, then re-synced here, not authored locally from scratch.
- `docs/MASTER_EXECUTION_PROGRAM.md` structural changes — new/removed milestones, changed v1.0 launch scope, a new Objective.
- Anything that would change which document is authoritative for a concept in the table above.
- GitHub Project schema changes (fields, views) once the Project exists.
- Deleting or archiving any document listed on this page — collapse to a pointer (as done for `docs/ENGINEERING_OPERATING_SYSTEM.md`) rather than deleting outright, so old links don't 404.

## Keeping This Page Current

Add or update a row here in the same PR that changes which document owns a concept, adds a new AI-instruction document, or changes an update-authority rule. If this page and a document's own header ever disagree, treat that as a bug and fix both in the same PR — they must always agree.

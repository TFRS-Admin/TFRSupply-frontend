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
tfrs-engineering-playbook's agents/AGENT_OPERATING_MODEL.md   (the operating loop: session start →
  pick work item → implement → verify → stop) and kernel/DECISION_ROUTER.md (routes the specific
  request to a playbook) — referenced from the Engineering OS, not vendored locally as of the
  2026-08-04 re-sync
  ↓
docs/engineering/backlog/   (one file per open work item, per standards/WORK_ITEM_STANDARD.md —
  glob this directory for current state; read before scanning GitHub Issues directly)
  ↓
  ├─ Task touches this codebase's implementation? → docs/ai/AI_DEVELOPMENT_PLAYBOOK.md →
  │    docs/ai/IMPLEMENTATION_WORKFLOW.md → docs/ai/ARCHITECTURE_PRINCIPLES.md → docs/ai/PROMPT_TEMPLATE.md
  │    (index: docs/ai/REPOSITORY_INDEX.md)
  ├─ Task touches a structural boundary? → docs/architecture/ARCHITECTURE.md → the specific
  │    docs/architecture/<DOMAIN>.md
  ├─ Task needs process detail (labels, DoD, branch strategy, personas)? → docs/project-management/*
  └─ Task needs execution mechanics for a command? → the matching skill in TFRS-Admin/agent-skills,
       per tfrs-engineering-playbook's standards/SKILL_STANDARD.md
```

`AGENTS.md` and `CLAUDE.md` are this repository's baseline files — every other document in this list is repository-specific detail consulted *underneath* that baseline, never a substitute for it. Unlike the predecessor structure, the operating model and decision router are referenced live from the Engineering OS (`agents/AGENT_OPERATING_MODEL.md`, `kernel/DECISION_ROUTER.md`), not vendored as local files — see `AGENTS.md`'s opening paragraph for what changed in the 2026-08-04 re-sync.

## Single Source of Truth, By Concept

| Concept | Single source of truth | Notes |
| --- | --- | --- |
| **Engineering workflow** (which playbook to run, when; lifecycle phases) | [`tfrs-engineering-playbook`](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`playbooks/`, `kernel/DECISION_ROUTER.md`), mirrored locally by `AGENTS.md`/`CLAUDE.md` | `docs/ENGINEERING_PLAYBOOK.md`, `docs/ENGINEERING_OPERATING_SYSTEM.md`, and `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` are **not** workflow authorities — see their headers |
| **Roadmap ownership** (what to build, in what order) | [`docs/MASTER_EXECUTION_PROGRAM.md`](./MASTER_EXECUTION_PROGRAM.md) | `docs/PRODUCTION_ROADMAP.md` is a pointer only, by its own explicit statement — never add roadmap content there |
| **Project state** (what's in flight right now) | **`docs/engineering/backlog/`, then each item file's own metadata block** | Per the Engineering OS's `adrs/0002-file-based-work-items.md`: this repository is file-based, not GitHub-Project-centered. A GitHub Project is optional visualization only and is never required; this repository does not run one, by design, with no readiness penalty. The former `docs/engineering/CURRENT_SPRINT.md`/`BACKLOG.md` monolithic index files are archived at `docs/engineering/archive/` — historical, not current. |
| **AI operating rules** (conventions, loop, routing) | `AGENTS.md`, `CLAUDE.md` (local), plus `agents/AGENT_OPERATING_MODEL.md` and `kernel/DECISION_ROUTER.md` (referenced live from `tfrs-engineering-playbook`, not vendored) | `AGENTS.md`/`CLAUDE.md` are local files that may carry repository-specific overrides; the operating model and decision router are intentionally *not* copied, so they can never drift from upstream |

## Document Classification

### Static — change rarely, and only deliberately

| Document | Who may change it |
| --- | --- |
| `AGENTS.md`, `CLAUDE.md` | Founder approval required (see below) — these state this repository's contract against `tfrs-engineering-playbook`; a local edit that isn't consistent with the current upstream structure creates drift |
| `docs/project-management/*` (epics, labels, DoD, acceptance criteria library, agent personas, branch strategy) | Founder approval required — Tier-3 process/taxonomy definitions, rarely revised |
| `docs/ENGINEERING_PLAYBOOK.md`, `docs/ENGINEERING_OPERATING_SYSTEM.md` | Founder approval required — historical record; edits should be corrections, not new proposals |
| `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md`, `IMPLEMENTATION_WORKFLOW.md`, `ARCHITECTURE_PRINCIPLES.md`, `PROMPT_TEMPLATE.md`, `REPOSITORY_INDEX.md` | Claude may propose edits in the same PR as a related change (e.g. adding a new `docs/architecture/*.md` row to `REPOSITORY_INDEX.md`); structural rewrites need founder sign-off |
| `docs/DOCUMENTATION_HIERARCHY.md` (this file) | Founder approval required — the map itself should not silently drift |

### Claude may update automatically, without approval

| Document | When |
| --- | --- |
| `docs/architecture/ARCHITECTURE.md` | Same PR that changes a structural boundary |
| `docs/architecture/<DOMAIN>.md` | Same PR that changes that domain's boundary |
| `docs/MASTER_EXECUTION_PROGRAM.md` §6 status markers | Ticking a status marker (`✅ merged (#nnn)`) after a merged PR — restructuring milestones/scope still requires founder approval |
| `docs/engineering/ROADMAP.md`, `REPO_HEALTH.md` | Per `playbooks/BUILD_FEATURE.md` and `monitoring/REPOSITORY_HEALTH.md` respectively — these write to these files as part of their normal output |
| `docs/engineering/backlog/*.md` | Updating a work item's own status/history in the same PR as the change it describes, per `standards/WORK_ITEM_STANDARD.md` — never a separate later "docs: sync" commit |
| GitHub Issues / PRs | The originating issue stays open as discussion history even after its `docs/engineering/backlog/` file is created — commenting there when a corresponding work-item file changes is good practice, not required |
| `docs/ai/REPOSITORY_INDEX.md` row additions | Adding a row for a new top-level doc, in the same PR that introduces it (its own stated rule) |

### Requires founder approval before changing

- `AGENTS.md` or `CLAUDE.md` — changes should reflect what's actually current in `tfrs-engineering-playbook`, not invent local policy that diverges from it.
- `docs/MASTER_EXECUTION_PROGRAM.md` structural changes — new/removed milestones, changed v1.0 launch scope, a new Objective.
- Anything that would change which document is authoritative for a concept in the table above.
- GitHub Project schema changes (fields, views) once the Project exists.
- Deleting or archiving any document listed on this page — collapse to a pointer (as done for `docs/ENGINEERING_OPERATING_SYSTEM.md`) or move to `docs/engineering/archive/` (as done for the former `BACKLOG.md`/`CURRENT_SPRINT.md`/`PLAYBOOK_ADOPTION.md` during the 2026-08-04 re-sync) rather than deleting outright, so old links don't 404.

## Keeping This Page Current

Add or update a row here in the same PR that changes which document owns a concept, adds a new AI-instruction document, or changes an update-authority rule. If this page and a document's own header ever disagree, treat that as a bug and fix both in the same PR — they must always agree.

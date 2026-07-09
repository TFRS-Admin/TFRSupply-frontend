<!-- Purpose: Define baseline instructions for AI coding agents operating in this repository. -->
# AGENTS.md — TFRSupply Frontend

> **This file is the single entry point for every AI agent working in this repository — human or automated, Claude Code or otherwise.** Start here, always, before reading any other document. No other document in this repository — including `CLAUDE.md`, any file under `docs/`, or any document that predates this repository's playbook adoption — should be treated as its own starting point; every one of them either points back here or is reference material consulted *after* this file, per the read order below.

This repository has adopted the [TFRS Engineering Playbook](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`tfrs-engineering-playbook`, version **3.0.0**) as its engineering source of truth, and [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) as its shared execution library. This file is the local copy of the playbook's baseline `AGENTS.md`, required per [`commands/setup-from-playbook.md#minimum-baseline`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/setup-from-playbook.md#minimum-baseline) so an agent has it without a live fetch. If anything below ever conflicts with the canonical playbook, the canonical playbook wins unless this file documents an explicit, intentional local override (see "Repository-Specific Overrides" below).

No other document in this repository — including `docs/ENGINEERING_PLAYBOOK.md` and `docs/ENGINEERING_OPERATING_SYSTEM.md` (retained as historical local design references, see their headers) — is authoritative for how work moves through this system. Authority for workflow lives in `tfrs-engineering-playbook` and this baseline set (`AGENTS.md`, `CLAUDE.md`, `AI_AGENT_OPERATING_MODEL.md`, `DECISION_ROUTER.md`).

## Agent Identity & Scope

AI coding agents operating in this repository are authorized to plan, implement, test, document, and review changes that are explicitly requested in issues, pull requests, or maintainer instructions. Agents should optimize for small, safe changes that preserve repository intent and should treat the TFRS Engineering Playbook as the default operating contract unless this file documents a stricter local rule.

## File Naming Conventions

- Prefer **JavaScript-first** repository layouts and documentation examples (this repo is a Vite + React + JavaScript/TypeScript-mixed codebase).
- Use **kebab-case** for general files and folders such as `order-service.js` or `project-board-template.md`.
- Use **PascalCase** for React components, pages, and other framework conventions that expect component naming (see `src/components/`, `src/pages/`).
- Keep filenames descriptive enough that Copilot and Claude can infer intent from path and name alone.

## Code Style Rules

- Prefer **ES modules** over CommonJS in new code.
- Prefer **async/await** over chained `.then()` calls except when a library API makes promises awkward.
- Never introduce `var`; use `const` by default and `let` only when reassignment is required.
- Keep functions focused, name side effects clearly, and default to early returns for guard clauses.
- Reuse repository-standard tooling and patterns before introducing new dependencies — see `ARCHITECTURE.md` for the service/adapter/domain layering already in place.

## Commit Message Format

Use Conventional Commits for every agent-authored commit:

- `feat: add new behavior`
- `fix: correct broken behavior`
- `docs: update standards or usage guidance`
- `chore: maintain tooling or repo structure`

## What Agents Must Not Do

- Do not force push or rewrite shared history unless a human maintainer explicitly owns that operation.
- Do not delete the `.github/` directory or weaken repository protections.
- Do not commit secrets, credentials, tokens, or private keys — see [`SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SECURITY_STANDARD.md) for what to do if one ever is committed anyway.
- Do not make unrelated refactors while addressing a focused task.
- Do not ignore existing tests, lint rules, or review feedback without documenting why.

## How Agents Should Use This Playbook

0. **Start every session with the [Session Initialization Protocol](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/AI_AGENT_OPERATING_MODEL.md#1-session-initialization-protocol)** — this applies even to a plain-language request with no issue number attached; route it with [`DECISION_ROUTER.md`](./DECISION_ROUTER.md) rather than guessing which command applies.
1. Read [`CLAUDE.md`](./CLAUDE.md) for response and execution conventions.
2. Read [`AI_AGENT_OPERATING_MODEL.md`](./AI_AGENT_OPERATING_MODEL.md) for the full operating loop: what to read first, how to pick the next issue, when to stop, and how to update state. Per playbook v3.0.0, this repository is repository-centered, not GitHub-Project-centered — `docs/engineering/CURRENT_SPRINT.md`, `docs/engineering/BACKLOG.md`, `docs/engineering/ROADMAP.md`, and each issue's `## Metadata` block (per [`ISSUE_METADATA_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/ISSUE_METADATA_STANDARD.md)) are the operational source of truth; no GitHub Project is required.
3. Follow [`EXECUTION_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/EXECUTION_STANDARD.md) when coding, and the executable command library under [`commands/`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/README.md) for every phase of the lifecycle.
4. Check [`REVIEW_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REVIEW_STANDARD.md) before asking for or approving a pull request, and [`SECURITY_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SECURITY_STANDARD.md) / [`TESTING_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/TESTING_STANDARD.md) whenever a change touches external input, auth, or behavior that needs test coverage.
5. Use [`AI_ENGINEERING_WORKFLOW.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/AI_ENGINEERING_WORKFLOW.md) to decide what work belongs to humans versus AI.
6. Consult [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md) for the step-by-step execution mechanics of a given task type — this playbook defines *what's required*, [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) defines *how to execute it*.
7. See `ARCHITECTURE.md` at the root of this repository for this codebase's actual layering (adapters/services/domain) before making structural changes.

## Repository-Specific Overrides

Per [`SKILLS_STANDARD.md#precedence-on-conflict`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md#precedence-on-conflict), this repository's own documented conventions win over the playbook's generic defaults. The one active override:

### Branch Naming

This repository uses a wider, issue-scoped branch taxonomy than the playbook's default four prefixes, defined in `docs/project-management/09_branch_strategy.md`:

- `docs/<issue-id>-<short-title>`
- `feature/<issue-id>-<short-title>`
- `migration/<issue-id>-<short-title>`
- `bugfix/<issue-id>-<short-title>`
- `refactor/<issue-id>-<short-title>`
- `infra/<issue-id>-<short-title>`
- `hotfix/<issue-id>-<short-title>`
- `release/<version-or-date>`

Use this list instead of the playbook's generic `feature/ fix/ docs/ chore/` set. All other playbook conventions (commit format, code style, what agents must not do) apply unmodified.

## Related Local Documents

- [`CLAUDE.md`](./CLAUDE.md) — Claude-specific response and PR conventions
- [`AI_AGENT_OPERATING_MODEL.md`](./AI_AGENT_OPERATING_MODEL.md) — the operating loop
- [`DECISION_ROUTER.md`](./DECISION_ROUTER.md) — plain-language request routing
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — this repository's actual system architecture
- [`docs/engineering/ROADMAP.md`](./docs/engineering/ROADMAP.md), [`docs/engineering/BACKLOG.md`](./docs/engineering/BACKLOG.md), [`docs/engineering/CURRENT_SPRINT.md`](./docs/engineering/CURRENT_SPRINT.md), [`docs/engineering/REPO_HEALTH.md`](./docs/engineering/REPO_HEALTH.md) — this repository's required engineering documentation per playbook v3.0.0's repository-centered model; read per [`AI_AGENT_OPERATING_MODEL.md#2-how-to-determine-current-work`](./AI_AGENT_OPERATING_MODEL.md#2-how-to-determine-current-work)
- [`docs/DOCUMENTATION_HIERARCHY.md`](./docs/DOCUMENTATION_HIERARCHY.md) — the full documentation map: read order, what's static, what Claude may update automatically, what requires founder approval
- `docs/project-management/` — repository-specific process detail (labels, DoD, acceptance criteria library, agent personas) that remains in force as Tier-3 reference material

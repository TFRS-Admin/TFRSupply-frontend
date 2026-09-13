<!-- Purpose: Claude Code entry point for this project. -->
# Claude Code Instructions — TFRSupply Frontend

Read `AGENTS.md` (this repository's local contract) first, then use `agent-skills:using-agent-skills` to route to the right Claude Code skill for the session's work — this repo's process is governed by the account-wide `mattpocock-skills:*` and `agent-skills:*` skill sets, not an external playbook repo.

## Project Context

TFRSupply Frontend is a Vite + React (JavaScript/TypeScript-mixed) storefront and fleet-procurement platform, originally scaffolded via Base44 and now integrating directly with Shopify's Storefront/Admin APIs. TFRS is a JavaScript-heavy, AI-assisted shop with a Copilot-first workflow and Claude Code used as a high-leverage implementation and review partner. See `docs/architecture/ARCHITECTURE.md` for the actual system layering before making structural changes.

## Session Style

- Be concise, evidence-driven, and implementation-oriented.
- For multi-step work, maintain `.planning/task_plan.md`, `.planning/findings.md`, and `.planning/progress.md`.
- Read narrowly — load only the documents and source files required for the current step.
- Ask only when a material decision cannot be safely inferred; otherwise state assumptions and proceed.

## Before Editing

Confirm the work item in `docs/engineering/backlog/` is `Ready`, or use `agent-skills:spec-driven-development` / `agent-skills:planning-and-task-breakdown` to create the required planning artifact if none exists yet. Identify this project's local test and build commands from `AGENTS.md`.

## Before Completion

Run this repo's deterministic gate: `npm run lint && npm run typecheck && npm test && npm run build`. Use `agent-skills:test-driven-development` / `mattpocock-skills:tdd` for test discipline while implementing. Summarize changed files, user-visible behavior, evidence, risks, and follow-up work.

## PR Creation Rules

Every pull request prepared by Claude should include a short summary of the change, a file-by-file change overview, testing/validation notes, and any known follow-up items or risks. Use `agent-skills:code-review-and-quality` (or `mattpocock-skills:code-review`) to ensure the PR clears this repository's review bar before opening it.

## When to Ask vs. When to Proceed

- **Proceed** when the task is clear, scoped, and consistent with repository standards.
- **Ask** when requirements conflict, scope is ambiguous, or execution would change architecture, security posture, or repository-wide conventions.

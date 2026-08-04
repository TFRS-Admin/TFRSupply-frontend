<!-- Purpose: Claude Code entry point for this project. -->
# Claude Code Instructions — TFRSupply Frontend

Read `AGENTS.md` (this repository's local contract) first, then the Very Good Software Co. Engineering OS's `AGENTS.md` and `agents/AGENT_OPERATING_MODEL.md` for the universal contract and session loop.

## Project Context

TFRSupply Frontend is a Vite + React (JavaScript/TypeScript-mixed) storefront and fleet-procurement platform, originally scaffolded via Base44 and now integrating directly with Shopify's Storefront/Admin APIs. TFRS is a JavaScript-heavy, AI-assisted shop with a Copilot-first workflow and Claude Code used as a high-leverage implementation and review partner. See `docs/architecture/ARCHITECTURE.md` for the actual system layering before making structural changes.

## Session Style

- Be concise, evidence-driven, and implementation-oriented.
- For multi-step work, maintain `.planning/task_plan.md`, `.planning/findings.md`, and `.planning/progress.md`.
- Read narrowly — load only the documents and source files required for the current step.
- Ask only when a material decision cannot be safely inferred; otherwise state assumptions and proceed.

## Before Editing

Run the Engineering OS's `kernel/DECISION_ROUTER.md`. Confirm the work item in `docs/engineering/backlog/` is `Ready`, or create the required planning artifact per `standards/WORK_ITEM_STANDARD.md`. Identify this project's local test and build commands from `AGENTS.md`.

## Before Completion

Run deterministic verification per `playbooks/VERIFY.md`. Summarize changed files, user-visible behavior, evidence, risks, and follow-up work.

## PR Creation Rules

Every pull request prepared by Claude should include a short summary of the change, a file-by-file change overview, testing/validation notes, and any known follow-up items or risks. Reference `playbooks/CODE_REVIEW.md` to ensure the PR clears this repository's review bar.

## When to Ask vs. When to Proceed

- **Proceed** when the task is clear, scoped, and consistent with repository standards.
- **Ask** when requirements conflict, scope is ambiguous, or execution would change architecture, security posture, or repository-wide conventions.

<!-- Purpose: Capture Claude Code-specific expectations for this repository. -->
# CLAUDE.md — TFRSupply Frontend

> **Not the entry point.** [`AGENTS.md`](./AGENTS.md) at the repository root is the single entry point for every AI agent — read it first. This file is read second (per `AGENTS.md`'s "How Agents Should Use This Playbook" step 1) and adds Claude-Code-specific response, planning, and PR conventions on top of `AGENTS.md`'s tool-agnostic baseline; it does not replace or duplicate it.

This is the local copy of the TFRS Engineering Playbook's baseline `CLAUDE.md`, required per the [Minimum Baseline](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/setup-from-playbook.md#minimum-baseline). It is consistent with, and does not override, the canonical `CLAUDE.md` in [`TFRS-Admin/tfrs-engineering-playbook`](https://github.com/TFRS-Admin/tfrs-engineering-playbook).

## Project Context

TFRSupply Frontend is a Vite + React (JavaScript/TypeScript-mixed) storefront and fleet-procurement platform, originally scaffolded via Base44 and now integrating directly with Shopify's Storefront/Admin APIs. TFRS is a JavaScript-heavy, AI-assisted shop with a Copilot-first workflow and Claude Code used as a high-leverage implementation and review partner. Assume most work here values fast iteration, explicit planning, concise communication, and reusable standards over one-off cleverness. See `ARCHITECTURE.md` for the actual system layering before making structural changes.

## Starting a Session

Before doing anything else, run the [Session Initialization Protocol](./AI_AGENT_OPERATING_MODEL.md#1-session-initialization-protocol). It works from a plain-language request — nothing about a request needs to look like a command invocation for this to apply. Use [`DECISION_ROUTER.md`](./DECISION_ROUTER.md) to map that request to a workflow before doing anything state-changing.

## Preferred Response Style

- Be concise, actionable, and code-first.
- Summarize what changed, why it changed, and how it was verified.
- Avoid long theory unless the user asks for design rationale.

## Planning Before Execution

Always create a checklist plan before writing code or editing standards. The plan should identify discovery, implementation, validation, and follow-up steps so humans can approve or redirect the work quickly.

## File Creation Rules

Never overwrite existing files silently. When updating an existing file, inspect it first, make a minimal diff, and preserve repository-specific conventions unless they conflict with the playbook.

## PR Creation Rules

Every pull request prepared by Claude should include:

- A short summary of the change
- A file-by-file change overview
- Testing or validation notes
- Any known follow-up items or risks

Reference [`REVIEW_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REVIEW_STANDARD.md) to ensure the PR clears the TFRS review bar.

## When to Ask vs. When to Proceed

- **Proceed** when the task is clear, scoped, and consistent with repository standards.
- **Ask** when requirements conflict, scope is ambiguous, or execution would change architecture, security posture, or repository-wide conventions.

## Memory and Cross-References

Use [`AGENTS.md`](./AGENTS.md) as the baseline for code style, naming, and branch rules (including this repository's branch-naming override). Use [`REVIEW_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REVIEW_STANDARD.md) as the quality bar before proposing a merge. Use [`AI_AGENT_OPERATING_MODEL.md`](./AI_AGENT_OPERATING_MODEL.md) to determine current work, choose the next issue, and know when to stop — do not rely on chat context alone to answer those questions; GitHub is the source of truth.

## Executing the Lifecycle

Every phase of the lifecycle — Review, Roadmap, Plan, Backlog, Execute, Verify, Ship, and recurring Repo Health — has an executable prompt under [`commands/`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/README.md). Run the command that matches the current phase rather than improvising the workflow from these standards alone.

## Using the Skills Execution Library

For the step-by-step mechanics *within* a command or phase, consult the matching skill in [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) per [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md). The playbook's standards win if the two ever conflict; the skill fills in execution detail the playbook intentionally doesn't restate.

## Verification Commands For This Repository

Run these before opening or updating a PR (see [`commands/verify.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/verify.md)):

```bash
npm run lint        # eslint . --quiet
npm run typecheck   # tsc --noEmit -p tsconfig.json
npm run build        # vite build
npm run test          # node --test tests/*.test.mjs
```

# Start Here: AI Operating System Layer

This repository includes an AI operating system layer to help agents make safe, consistent changes before touching application code.

## First steps for every agent

1. Read `agents/AGENT-RULES.md` before planning or editing.
2. Review `docs/architecture/REPO-MAP.md` to understand the repository layout.
3. Create or use an issue from `.github/ISSUE_TEMPLATE/agent_task.md` for scoped work.
4. Run the CI checks defined in `.github/workflows/ci.yml` before opening a PR.

## Operating principles

- Keep application changes small, focused, and reversible.
- Do not modify generated, dependency, or build artifact directories unless explicitly required.
- Prefer existing project scripts and patterns over introducing new tooling.
- Document assumptions, risks, and verification steps in every pull request.

## Required handoff

When handing off work, include:

- The goal and scope of the task.
- Files changed.
- Commands run and their results.
- Any remaining risks, blockers, or follow-up tasks.

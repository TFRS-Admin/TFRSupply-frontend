# Start Here

This repository uses an AI operating system for safe agent-assisted development.

## First steps for every agent

1. Read `AGENTS.md`.
2. Read `agents/AGENT-RULES.md`.
3. Read `agents/PERSONAS.md`.
4. Read `agents/WORKFLOW.md`.
5. Review `docs/architecture/REPO-MAP.md`.
6. Check `git status`.
7. Confirm the current branch is not `main`, `production`, or `prod`.

## Operating model

Use **Spec → Build → Verify**:

- **Spec:** clarify scope, protected files, acceptance criteria, and verification.
- **Build:** make the smallest approved change.
- **Verify:** run checks, review the diff, and produce QA.

## Required handoff

- Files created.
- Files changed.
- Summary of changes.
- Tests/checks run.
- Protected-file confirmation.
- Known risks or blockers.

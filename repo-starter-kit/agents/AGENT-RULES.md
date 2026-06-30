# Agent Rules

## Before editing

- Read `AGENTS.md`, `docs/START-HERE.md`, `agents/PERSONAS.md`, and `agents/WORKFLOW.md`.
- Confirm scope, owner persona, acceptance criteria, and likely files.
- Check git status.
- Do not work directly on `main`, `production`, or `prod`.
- Do not change application code unless explicitly in scope.

## During implementation

- Make the smallest approved change.
- Do not refactor, redesign, or alter behavior unless requested.
- Do not touch protected files without approval.
- Do not commit secrets, generated artifacts, dependency folders, or local env files.
- Do not wrap imports in `try`/`catch` blocks.

## Verification

- Run relevant checks.
- Review changed files against scope.
- Include a QA report.

## Stop and ask when

- Scope is unclear.
- Protected files are needed without approval.
- Behavior could change unexpectedly.
- Existing user changes are present in files you need.
- Acceptance criteria or verification expectations are missing.

# Implementation Workflow

> Consulted from [`AGENTS.md`](../../AGENTS.md) (the entry point) once a specific `Ready` issue is being implemented — not a starting point on its own. The playbook's `commands/execute.md` governs which command to run; this document is the repository-specific mechanical detail underneath that command.

## Purpose

This document is the complete lifecycle every AI agent follows to take a TFRSupply issue from `main` to a merged, deleted branch. It complements `docs/project-management/04_workflows.md` (organization-wide workflow policy) with the concrete step-by-step loop an agent chat runs for a single implementation issue.

## Lifecycle

```
main
  |
  v
Create feature branch
  |
  v
New AI chat
  |
  v
Implement ONE issue
  |
  v
Run QA
  |
  v
Open PR
  |
  v
Review
  |
  v
Merge
  |
  v
Delete branch
  |
  v
Repeat
```

## Step Detail

### 1. `main`

- Always branch from the latest protected `main`. Fetch and confirm you are not building on stale history before creating a branch.

### 2. Create feature branch

- Name the branch using the conventions in `docs/project-management/09_branch_strategy.md`: `<type>/<issue-id>-<short-title>` (`docs/`, `feature/`, `migration/`, `bugfix/`, `refactor/`, `infra/`, `hotfix/`, or `release/`).
- One branch maps to exactly one issue.

### 3. New AI chat

- Start a new chat/session scoped to this one issue, per `AI_DEVELOPMENT_PLAYBOOK.md` ("One Chat per Implementation").
- The chat's opening context should include: the issue, this playbook, and the architecture docs named in the issue's affected boundaries.

### 4. Implement ONE issue

- Make only the changes described in the issue's scope. Do not fix unrelated bugs, refactor unrelated code, or expand scope opportunistically.
- Follow the dependency direction and layer conventions in `ARCHITECTURE_PRINCIPLES.md`.
- If the issue's scope turns out to be incomplete or incorrect, stop and raise it rather than silently expanding or shrinking the work.

### 5. Run QA

Run the required checks and capture their exact output for the PR:

```bash
npm run lint
npm run build
npm run typecheck
npm run test
```

Add or update tests per `AI_DEVELOPMENT_PLAYBOOK.md` → "Testing Expectations" before this step is considered complete.

### 6. Open PR

- Open a PR from the feature branch into `main`.
- Link the governing issue.
- Include: summary, files changed, QA command output, screenshots for visual changes, risk assessment, and rollback notes, per `docs/project-management/04_workflows.md`.
- Apply `needs-review` and request reviewers matching the domain labels in `docs/project-management/09_branch_strategy.md` ("Review Ownership").

### 7. Review

- Address review comments with follow-up commits on the same branch.
- Do not force-push away reviewed history unless the reviewer explicitly coordinates a rewrite.
- Apply `ready-for-merge` only once required reviewers approve and checks pass.

### 8. Merge

- Prefer squash merge to keep `main` history readable, per `docs/project-management/09_branch_strategy.md`.
- Merge only after protected branch requirements (required checks, up-to-date branch, review approval) are satisfied.

### 9. Delete branch

- Delete the feature branch immediately after merge. Branches are single-use; do not reuse a merged branch for new work.

### 10. Repeat

- Return to `main`, pull the merged change, and start the next issue with a new branch and a new chat.

## Notes on Merged-Branch Recovery

If a branch's PR is already merged and new follow-up work arrives under the same designated branch name, restart that branch from the latest `main` rather than stacking new commits on merged history. Any PR opened from the restarted branch is a new PR, not a reopening of the merged one.

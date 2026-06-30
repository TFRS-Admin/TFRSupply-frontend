# AI Project Starter Kit

A reusable starter kit for installing an AI operating system into a repository. Copy this folder into a new repo, then use the prompts in `prompts/` to have Codex install or adapt the files.

## What this kit provides

- Repository-wide agent rules for safe AI-assisted development.
- Claude/Codex onboarding instructions.
- Project memory, standards, architecture maps, and ADR templates.
- Agent personas, workflow rules, Definition of Done, and QA report format.
- GitHub issue templates, PR template, and CI workflow template.
- Copy/paste prompts for installing the operating system and creating a GitHub Project.

## Installation overview

1. Copy `repo-starter-kit/` into the target repository.
2. Ask Codex to read `repo-starter-kit/prompts/01-install-ai-os.md` and install the kit into repo-native locations.
3. Review the generated files for project-specific details.
4. Create or confirm a `develop` branch.
5. Configure GitHub branch protection and project fields manually.
6. Run lint/build or equivalent checks.
7. Open a PR against `develop`.

## Target repo file mapping

| Starter kit path | Target repo path |
|---|---|
| `AGENTS.md` | `AGENTS.md` |
| `CLAUDE.md` | `CLAUDE.md` |
| `docs/**` | `docs/**` |
| `agents/**` | `agents/**` |
| `github/ISSUE_TEMPLATE/**` | `.github/ISSUE_TEMPLATE/**` |
| `github/PULL_REQUEST_TEMPLATE.md` | `.github/PULL_REQUEST_TEMPLATE.md` |
| `github/workflows/ci.yml` | `.github/workflows/ci.yml` |

## Branch strategy

- Do not commit directly to `main`, `production`, or `prod`.
- Create or use `develop` as the integration branch.
- Use feature branches for agent tasks.
- Open PRs into `develop` unless a human maintainer specifies another target.
- Protect release branches with required PR review and CI.

## Protected-files strategy

Each repo should define protected files before agents edit code. At minimum, protect:

- Product/business data.
- Configuration and state-management logic.
- Commerce, pricing, checkout, quote, payment, order, and billing flows.
- Auth, user, permission, session, and security logic.
- Environment, secret, deployment, dependency, and lock files.
- Generated artifacts, build outputs, dependencies, caches, and logs.

## Definition of Done

A task is done only when:

- The approved spec is satisfied.
- Only in-scope files changed.
- Protected files were not modified without documented approval.
- Required checks pass or limitations are documented.
- No unintended behavior, data, security, commerce, deployment, or UI changes were introduced.
- The PR contains a complete QA report.

## Required QA report format

Every handoff must include:

- Files created.
- Files changed.
- Summary of changes.
- Tests/checks run with pass/fail status.
- Screenshot links or notes when UI changed.
- Confirmation that no application code changed, unless app code was explicitly in scope.
- Confirmation that no protected files changed without approval.
- Known risks, blockers, and follow-up work.

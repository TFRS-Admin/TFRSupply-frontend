<!-- Purpose: Project-local agent contract. This file states what's true about THIS repository -- process/skill routing is handled by the account-wide Claude Code skills, not a vendored or externally-referenced playbook. -->
# AGENTS.md — TFRSupply Frontend

This repository's engineering process is governed by the Claude Code skills already installed on this account — `mattpocock-skills:*` and `agent-skills:*` (Addy Osmani's pack) — not by an external playbook repository. At the start of any non-trivial session, use `agent-skills:using-agent-skills` to route to the right skill (e.g. `agent-skills:spec-driven-development` / `planning-and-task-breakdown` for scoping work, `agent-skills:test-driven-development` / `mattpocock-skills:tdd` for implementation, `agent-skills:code-review-and-quality` / `mattpocock-skills:code-review` before a PR). This file adds project-specific rules on top of whatever skill is in play, and states a stricter local rule wherever one applies — this file wins on conflict with generic skill guidance.

Previously this repo referenced `TFRS-Admin/tfrs-engineering-playbook` (the "Very Good Software Co. Engineering OS") for `AGENTS.md`/`AGENT_OPERATING_MODEL.md`/`DECISION_ROUTER.md`/`WORK_ITEM_STANDARD.md`/`VERIFY.md`/`CODE_REVIEW.md`. That dependency was removed on 2026-09-13 in favor of the account's own skill set — see "Local Conventions" below for what carries forward unchanged. The 2026-08-04 re-sync's other structural changes remain in place: `ARCHITECTURE.md` lives at `docs/architecture/ARCHITECTURE.md` (alongside ~60 per-domain architecture documents); the backlog is one file per open item under `docs/engineering/backlog/` (10 items, sourced from GitHub's actual open-issue state — see that directory's `README.md`). Historical narrative preserved at `docs/engineering/archive/`.

## Commands

```bash
npm install
npm run lint         # eslint . --quiet
npm run typecheck    # tsc --noEmit -p tsconfig.json
npm run test          # node --test tests/*.test.mjs
npm run test:coverage # c8 node --test tests/*.test.mjs
npm run build         # vite build
npm run dev           # vite
npm run preview       # vite preview
```

Package manager is **npm** (see `package-lock.json`); use `npm run` scripts, not raw `pnpm`/`yarn` invocations. Repo-specific utility scripts: `npm run shopify:ingest`, `npm run shopify:convert-matrixify`, `npm run shopify:gid-overlay` (Shopify catalog ingestion, see `scripts/shopify-catalog-ingest/`).

## Branch Pattern

Pattern A (Single Trunk) — only `main` is a persistent branch. This is a **Local Deviation** from `project-template`'s default (Pattern B, Trunk Plus Staging): this project has no `staging` environment or branch. This repository also uses a **wider, issue-scoped branch-prefix taxonomy** than the Engineering OS's default four, defined in `docs/project-management/09_branch_strategy.md`:

- `docs/<issue-id>-<short-title>`
- `feature/<issue-id>-<short-title>`
- `migration/<issue-id>-<short-title>`
- `bugfix/<issue-id>-<short-title>`
- `refactor/<issue-id>-<short-title>`
- `infra/<issue-id>-<short-title>`
- `hotfix/<issue-id>-<short-title>`
- `release/<version-or-date>`

## Architecture Boundaries

See `docs/architecture/ARCHITECTURE.md` for the system-level overview, and the ~60 per-domain documents alongside it (`docs/architecture/SERVICE_LAYER.md`, `DOMAIN_MODEL.md`, etc.) for subsystem-specific boundary specs — consult the relevant one before changing a boundary. The dependency direction an agent must not cross without explicit approval: `components → hooks → services → adapters → domain → data/loaders/validators`. `src/types/` must remain free of React, service, and API-client imports. Services must not import React or hooks.

## Prohibited Operations

- Do not commit invented SKUs or hardcoded prices — Shopify owns commerce data, configurator JSON owns SKU logic, per the governing principles in GitHub issue #107 ("Vision — TFRSupply Digital Platform").
- Do not add product-family-specific React components without approval (same source).
- Do not treat `docs/architecture/*.md` files marked "foundation" or "additive only" as already wired into runtime component behavior — check the specific domain doc before assuming a boundary is live rather than scaffolded.

## Local Conventions

These are standing rules for this repository, independent of any external playbook:

- **Branch Pattern A** (single trunk, no `staging` branch), plus the wider branch-prefix taxonomy — see Branch Pattern above.
- **113 pre-existing issues (#5-#131)** predate this repository's structured per-issue metadata convention and are explicitly out of scope for the `docs/engineering/backlog/` migration — see that directory's `README.md`. Retrofitting them is tracked as `GH-286`.
- No `adr/` directory exists yet in this repository — architectural rationale currently lives inside each `docs/architecture/*.md` file instead of a separate decision log. Recommend seeding one (see `agent-skills:documentation-and-adrs`) the next time an architecturally significant decision is made (e.g. `GH-289`'s configurator-engine-unification decision), rather than backfilling retroactively.

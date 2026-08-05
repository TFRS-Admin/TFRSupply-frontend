<!-- Purpose: Project-local agent contract. Unlike the Engineering OS's own AGENTS.md, this file is project-specific -- state what's true about THIS repository, not universal rules the OS already covers. -->
# AGENTS.md — TFRSupply Frontend

This repository follows the Very Good Software Co. Engineering OS (`TFRS-Admin/tfrs-engineering-playbook`), version `1.6.0`. That repository defines the universal agent contract, standards, agent roles, and playbooks — this file states what's true about *this* project specifically. Read the Engineering OS `AGENTS.md` and `agents/AGENT_OPERATING_MODEL.md` first; this file adds to it and may state a stricter local rule, which wins on conflict.

Re-synced to this version on 2026-08-04 via `migration/RESYNC_CHECKLIST.md`, from a stale `3.0.0` (predecessor-structure) adoption. What that changed: vendored copies of `AI_AGENT_OPERATING_MODEL.md`/`DECISION_ROUTER.md` deleted (now referenced from the Engineering OS, not copied); `ARCHITECTURE.md` moved to `docs/architecture/ARCHITECTURE.md` (alongside the ~60 existing per-domain architecture documents already there); the monolithic `docs/engineering/BACKLOG.md`/`CURRENT_SPRINT.md` migrated into one file per open item under `docs/engineering/backlog/` (10 items, sourced from GitHub's actual open-issue state — see that directory's `README.md` for what was found stale in the old index, including a `Risk: Critical` unauthenticated-admin-panel finding and a `P0` dropped-customer-quotes bug the old index still listed as open). Historical narrative preserved at `docs/engineering/archive/`.

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

## Local Deviations from the Engineering OS

- **Branch Pattern A**, plus the wider branch-prefix taxonomy — see Branch Pattern above.
- **113 pre-existing issues (#5-#131)** predate this repository's structured per-issue metadata convention and are explicitly out of scope for the `docs/engineering/backlog/` migration — see that directory's `README.md`. Retrofitting them is tracked as `GH-286`.
- No `adr/` directory exists yet in this repository — architectural rationale currently lives inside each `docs/architecture/*.md` file instead of a separate decision log. Recommend seeding one from the Engineering OS's `templates/ADR_TEMPLATE.md` the next time an architecturally significant decision is made (e.g. `GH-289`'s configurator-engine-unification decision), rather than backfilling retroactively.

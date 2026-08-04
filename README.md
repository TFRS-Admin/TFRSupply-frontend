# TFRSupply Frontend

## Engineering Source of Truth

This repository follows the [**Very Good Software Co. Engineering OS**](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`tfrs-engineering-playbook`) as its canonical engineering operating system, and consults [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) as its shared, live execution library for step-by-step task mechanics.

- **Start here:** [`AGENTS.md`](./AGENTS.md) is the single entry point for every AI agent working in this repository.
- **Adopted Engineering OS version:** recorded in [`AGENTS.md`](./AGENTS.md) — the single recorded location; not duplicated here. Re-synced 2026-08-04 from a stale `3.0.0` (predecessor-era) adoption via `migration/RESYNC_CHECKLIST.md`.
- **Local baseline files:** [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md) — the Engineering OS's own `agents/AGENT_OPERATING_MODEL.md` and `kernel/DECISION_ROUTER.md` are referenced, not copied, per `project-template/README.md`'s reference-not-copy convention.
- **Everything else** (standards, playbooks, templates) is referenced live from the Engineering OS repository, never vendored.
- **Repository-specific architecture:** [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md), plus ~60 per-domain documents alongside it.
- **Backlog:** [`docs/engineering/backlog/`](./docs/engineering/backlog/) — one file per work item, per `standards/WORK_ITEM_STANDARD.md`; glob the directory for current state. Historical narrative from before the 2026-08-04 re-sync is preserved at [`docs/engineering/archive/`](./docs/engineering/archive/) (superseded, not current).
- **Full documentation map** (read order, static vs. auto-updated vs. founder-approval-required docs, single source of truth per concept): [`docs/DOCUMENTATION_HIERARCHY.md`](./docs/DOCUMENTATION_HIERARCHY.md).
- **Adoption state:** re-synced to the current Engineering OS structure on 2026-08-04 via `migration/RESYNC_CHECKLIST.md`, from a stale `3.0.0` (predecessor-structure) adoption originally classified in the now-archived [`docs/engineering/archive/PLAYBOOK_ADOPTION.md`](./docs/engineering/archive/PLAYBOOK_ADOPTION.md). What changed: vendored copies of `AI_AGENT_OPERATING_MODEL.md`/`DECISION_ROUTER.md` removed (now referenced, not copied); `ARCHITECTURE.md` moved to `docs/architecture/ARCHITECTURE.md`; the monolithic `docs/engineering/BACKLOG.md`/`CURRENT_SPRINT.md` migrated into one file per open item under `docs/engineering/backlog/` (10 items, sourced from GitHub's actual open-issue state — the old index was confirmed stale, still listing a `Risk: Critical` unauthenticated-admin-panel finding and a `P0` dropped-customer-quotes bug as open when both were already closed); `AGENTS.md`/`CLAUDE.md` rewritten from the current `project-template/`.

[`docs/ENGINEERING_PLAYBOOK.md`](./docs/ENGINEERING_PLAYBOOK.md) remains as this repository's one retained local historical design document; [`docs/ENGINEERING_OPERATING_SYSTEM.md`](./docs/ENGINEERING_OPERATING_SYSTEM.md) is now a short pointer to it. Neither is authoritative for workflow — see their headers.

**Getting Started**

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in your Shopify Storefront API credentials:

```
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
VITE_SHOPIFY_STOREFRONT_API_VERSION=2024-10
```

Run the app: `npm run dev`

**Docs & Support**

- [`AGENTS.md`](./AGENTS.md) — the entry point for engineering conventions and AI agent operating rules.
- [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md) — this repository's actual system architecture.

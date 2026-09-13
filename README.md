# TFRSupply Frontend

## Engineering Source of Truth

**As of 2026-09-13**, this repository's engineering process is governed by Claude Code skills installed on this account — `mattpocock-skills:*` ([`mattpocock/skills`](https://github.com/mattpocock/skills)) and `agent-skills:*` ([`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills)) — not by an external playbook repository. The prior [**Very Good Software Co. Engineering OS**](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`tfrs-engineering-playbook`) dependency described in earlier revisions of this file was removed the same day; see `AGENTS.md`'s changelog note for what carried forward unchanged. *(Verified: 2026-09-13 via this session's loaded-skill list and `~/.claude/settings.json`'s `extraKnownMarketplaces` — both marketplaces currently track an unpinned branch on an individual maintainer's GitHub account, not a version-pinned release; see `.planning/findings.md` §0 for the open pinning/disclosure question.)*

- **Start here:** [`AGENTS.md`](./AGENTS.md) is the single entry point for every AI agent working in this repository.
- **Repository-specific architecture:** [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md), plus ~60 per-domain documents alongside it.
- **Backlog:** [`docs/engineering/backlog/`](./docs/engineering/backlog/) — one file per work item; glob the directory for current state. *(Verified: 2026-09-13 via GitHub MCP `list_issues` — the 10 files present each correspond to a real, currently-open GitHub issue.)* Historical narrative from before the 2026-08-04 re-sync is preserved at [`docs/engineering/archive/`](./docs/engineering/archive/) (superseded, not current).
- **Full documentation map** (read order, static vs. auto-updated vs. founder-approval-required docs, single source of truth per concept): [`docs/DOCUMENTATION_HIERARCHY.md`](./docs/DOCUMENTATION_HIERARCHY.md).
- **Prior adoption history:** this repo previously followed `tfrs-engineering-playbook` v3.0.0 (re-synced 2026-08-04 via `migration/RESYNC_CHECKLIST.md`, itself replacing a stale earlier adoption — see the now-archived [`docs/engineering/archive/PLAYBOOK_ADOPTION.md`](./docs/engineering/archive/PLAYBOOK_ADOPTION.md)) before that dependency was removed on 2026-09-13 in favor of the account-level skill set above.

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

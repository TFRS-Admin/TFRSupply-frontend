# TFRSupply Frontend

## Engineering Source of Truth

This repository follows the [**TFRS Engineering Playbook**](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`tfrs-engineering-playbook`) as its canonical engineering operating system, and consults [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) as its shared, live execution library for step-by-step task mechanics.

- **Start here:** [`AGENTS.md`](./AGENTS.md) is the single entry point for every AI agent working in this repository.
- **Adopted playbook version:** `3.0.0` (see the playbook's [`VERSION.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/VERSION.md) for the changelog). Version 3.0.0 moved the playbook from a GitHub-Project-centered model to a repository-centered one — see [`docs/engineering/`](./docs/engineering/) and each issue's `## Metadata` block, which are now the operational source of truth alongside this repository's own documentation; a GitHub Project remains optional visualization only.
- **Local baseline files** (copied per the playbook's [Minimum Baseline](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/setup-from-playbook.md#minimum-baseline)): [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md), [`AI_AGENT_OPERATING_MODEL.md`](./AI_AGENT_OPERATING_MODEL.md), [`DECISION_ROUTER.md`](./DECISION_ROUTER.md).
- **Everything else** (standards, `commands/`, templates) is referenced live from the playbook repository, never vendored — see [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md) for the precedence rules between this repository, the playbook, and the skills fork.
- **Repository-specific architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **Full documentation map** (read order, static vs. auto-updated vs. founder-approval-required docs, single source of truth per concept): [`docs/DOCUMENTATION_HIERARCHY.md`](./docs/DOCUMENTATION_HIERARCHY.md).
- **Adoption state:** classified in [`docs/PLAYBOOK_ADOPTION.md`](./docs/PLAYBOOK_ADOPTION.md) against the playbook's [Repository Readiness Checklist](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#repository-readiness-checklist).

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
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — this repository's actual system architecture.

**Welcome to your Base44 project** 

## Engineering Source of Truth

This repository follows the [**TFRS Engineering Playbook**](https://github.com/TFRS-Admin/tfrs-engineering-playbook) (`tfrs-engineering-playbook`) as its canonical engineering operating system, and consults [`TFRS-Admin/agent-skills`](https://github.com/TFRS-Admin/agent-skills) as its shared, live execution library for step-by-step task mechanics.

- **Start here:** [`AGENTS.md`](./AGENTS.md) is the single entry point for every AI agent working in this repository.
- **Adopted playbook version:** `2.4.0` (see the playbook's [`VERSION.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/VERSION.md) for the changelog).
- **Local baseline files** (copied per the playbook's [Minimum Baseline](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/commands/setup-from-playbook.md#minimum-baseline)): [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md), [`AI_AGENT_OPERATING_MODEL.md`](./AI_AGENT_OPERATING_MODEL.md), [`DECISION_ROUTER.md`](./DECISION_ROUTER.md).
- **Everything else** (standards, `commands/`, templates) is referenced live from the playbook repository, never vendored — see [`SKILLS_STANDARD.md`](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/SKILLS_STANDARD.md) for the precedence rules between this repository, the playbook, and the skills fork.
- **Repository-specific architecture:** [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **Full documentation map** (read order, static vs. auto-updated vs. founder-approval-required docs, single source of truth per concept): [`docs/DOCUMENTATION_HIERARCHY.md`](./docs/DOCUMENTATION_HIERARCHY.md).
- **Adoption state:** classified in [`docs/PLAYBOOK_ADOPTION.md`](./docs/PLAYBOOK_ADOPTION.md) against the playbook's [Repository Readiness Checklist](https://github.com/TFRS-Admin/tfrs-engineering-playbook/blob/main/REPOSITORY_BOOTSTRAP_GUIDE.md#repository-readiness-checklist).

[`docs/ENGINEERING_PLAYBOOK.md`](./docs/ENGINEERING_PLAYBOOK.md) remains as this repository's one retained local historical design document; [`docs/ENGINEERING_OPERATING_SYSTEM.md`](./docs/ENGINEERING_OPERATING_SYSTEM.md) is now a short pointer to it. Neither is authoritative for workflow — see their headers.

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

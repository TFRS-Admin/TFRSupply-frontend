# Repository Map

This map gives agents a quick orientation before changing code.

## Top-level structure

- `src/` — Application source code. Treat as protected unless application changes are explicitly in scope.
- `src/components/` — React components, including configurator, navigator, effects, templates, and showcase UI.
- `src/pages/` — Route/page-level React modules.
- `src/data/` — Product, catalog, sample, navigator, and resource data. Protected.
- `src/context/` — Shared application context and state logic. Protected.
- `base44/` — Base44 configuration, entities, and connector metadata. Data/entity files are protected.
- `docs/` — Human and agent-facing documentation.
- `agents/` — Agent operating rules and workflow guidance.
- `.github/ISSUE_TEMPLATE/` — GitHub issue templates for scoped agent tasks.
- `.github/workflows/` — GitHub Actions CI workflows.
- `node_modules/` — Installed dependencies; do not edit or commit changes here.

## Key project files

- `AGENTS.md` — Repository-wide agent instructions.
- `CLAUDE.md` — Claude/AI-agent quick guide.
- `package.json` — npm scripts, dependencies, and project metadata. Protected unless dependency/script changes are explicitly approved.
- `package-lock.json` — Locked dependency graph when present. Protected unless dependency changes are explicitly approved.
- `eslint.config.js` — ESLint configuration.
- `index.html` — Vite entry HTML.
- `components.json` — UI component configuration.
- `jsconfig.json` — JavaScript and TypeScript project configuration.

## Common commands

- `npm run lint` — Run lint checks.
- `npm run build` — Build the frontend application.
- `npm run dev` — Start the local development server.
- `git diff --name-only` — Confirm changed files stay within approved scope.

## Protected files and areas

Do not modify without explicit approval:

- Product data and catalogs: `src/data/**`, `base44/entities/**`.
- Configurator logic and state: `src/context/**`, `src/components/configurator/**`, `src/pages/BuildReview.jsx`.
- Commerce and payments: files involving Stripe, checkout, cart, quote, order, or pricing flows.
- Auth and session behavior.
- Environment, secret, deployment, dependency, and lock files.
- Generated artifacts and dependencies including `node_modules/**`, `dist/**`, caches, and logs.

## Change guidance

- Documentation-only tasks should stay within `docs/`, `agents/`, `AGENTS.md`, `CLAUDE.md`, or `.github/` unless explicitly requested otherwise.
- CI workflow changes should be validated with YAML review and, when possible, by running equivalent local npm scripts.
- Application source changes require an approved spec, responsible persona, and QA plan.
- Do not create product-family-specific React components without Product Architect approval.
- Do not mix documentation/workflow changes with unrelated application behavior changes.

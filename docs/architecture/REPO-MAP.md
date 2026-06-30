# Repository Map

This map gives agents a quick orientation before changing code.

## Top-level structure

- `src/` — Application source code when present.
- `base44/` — Base44 configuration, entities, and connector metadata.
- `docs/` — Human and agent-facing documentation.
- `agents/` — Agent operating rules and workflow guidance.
- `.github/ISSUE_TEMPLATE/` — GitHub issue templates for scoped agent tasks.
- `.github/workflows/` — GitHub Actions CI workflows.
- `node_modules/` — Installed dependencies; do not edit or commit changes here.

## Key project files

- `package.json` — npm scripts, dependencies, and project metadata.
- `package-lock.json` — Locked dependency graph when present.
- `eslint.config.js` — ESLint configuration.
- `index.html` — Vite entry HTML.
- `components.json` — UI component configuration.
- `jsconfig.json` — JavaScript and TypeScript project configuration.

## Common commands

- `npm run lint` — Run lint checks.
- `npm run build` — Build the frontend application.
- `npm run dev` — Start the local development server.

## Change guidance

- Documentation-only tasks should stay within `docs/`, `agents/`, or `.github/` unless explicitly requested otherwise.
- CI workflow changes should be validated with YAML review and, when possible, by running equivalent local npm scripts.
- Application source changes should include a clear test plan and should not be mixed with unrelated documentation or workflow changes.

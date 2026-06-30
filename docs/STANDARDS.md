# Repository Standards

These standards are mandatory for all human and AI-agent work in this repository. They apply in addition to `AGENTS.md`, `agents/AGENT-RULES.md`, and accepted ADRs.

## Core architecture standards

### JSON-first architecture

- Product, commerce, fitment, package, and required-component facts must come from approved structured data sources before they reach React UI.
- Prefer JSON-compatible data contracts for product configuration, package rules, SKU mappings, fitment rows, required components, and commerce references.
- Do not hide product facts in JSX, component conditionals, or page-specific constants when they belong in reviewed data.
- If the data shape is unclear, stop and create a spec or ADR before implementation.

### Data-driven UI

- UI should render approved data; it should not invent product behavior.
- Shared components should accept data/configuration instead of branching by product family.
- Product-family differences should be represented through approved data contracts or composition slots.
- Agents must not create product-family-specific React components without explicit Product Architect approval.

### No hardcoded prices

- Do not hardcode prices, discounts, compare-at prices, package totals, or price ranges in React components, docs-as-data, or local constants.
- Pricing must come from the approved commerce source of truth or an approved transformed commerce index.
- If a price is missing, use approved missing-data behavior rather than inventing a value.

### No invented SKUs or product data

- Do not invent SKUs, variant IDs, product names, fitment rows, required components, compatibility rules, or package contents.
- Missing product data is a data-quality issue, not an invitation to fill gaps from assumptions.
- Any placeholder data must be explicitly labeled as placeholder and kept out of production commerce/configurator flows.

### Shopify is commerce source

- Shopify Export is the single source of truth for commerce-facing product data.
- Commerce mappings, SKU references, variant IDs, availability, and pricing must derive from an approved Shopify export or approved transformed index.
- Do not hand-code commerce truth into React components.
- Do not change checkout, cart, quote, order, pricing, Stripe, or Shopify behavior without Commerce Engineer approval.

### Product pages own layout

- Product pages own product storytelling, merchandising layout, resource sections, page-level navigation, and calls to action.
- Shared modules may plug into approved page slots, but must not take over full product page layout.
- Product page layout changes and configurator behavior changes should be scoped and reviewed separately.

### Package Builder architecture

- Package Builder work must follow the generic `ConfiguratorModule` direction.
- Package rules should be data-driven and validated from approved product, fitment, required-component, and commerce sources.
- The Package Builder must not hardcode product-family behavior in React components.
- The Package Builder may plug into Build & Configure areas but must not replace product pages.
- Package Builder implementation requires Product Architect approval for behavior, Data Engineer approval for data contracts, Commerce Engineer approval for commerce mappings, and QA Engineer review for regression coverage.

## Workflow standards

### Feature branch workflow

- Do not commit directly to `production`, `prod`, or `main`.
- Work from a feature branch and target `develop` unless the task explicitly says otherwise.
- Keep PRs focused on the approved issue/spec.
- Do not mix documentation, data, UI, commerce, configurator, and deployment changes unless the issue explicitly requires that scope.

### Protected files and areas

Explicit approval is required before modifying:

- Product data and catalogs: `src/data/**`, `base44/entities/**`.
- Configurator logic and context: `src/context/**`, `src/components/configurator/**`, `src/pages/BuildReview.jsx`.
- Commerce and payments: checkout, cart, quote, order, pricing, Stripe, Shopify identifiers, and related flows.
- Authentication, authorization, users, and session handling.
- Environment, secret, dependency, deployment, and lock files, including `.env*`, `package.json`, lockfiles, deployment config, and CI secrets.
- Generated artifacts and dependencies, including `node_modules/**`, `dist/**`, caches, logs, and build outputs.

## Verification standards

### Required testing

For most frontend or documentation PRs, run:

- `npm run lint`
- `npm run build`

Additional checks are required when the task affects:

- UI behavior: manual route review and screenshots.
- Product data: data validation and sample product checks.
- Commerce: SKU/variant mapping review and checkout/quote risk assessment.
- Configurator/package builder: valid and invalid configuration scenarios.
- Deployment: environment variable review and rollback notes.

If a required check cannot run, document the reason and the exact limitation in the QA report.

### Required screenshots for UI work

Screenshots are required when a change affects visible UI, layout, responsive behavior, product pages, configurator/package-builder surfaces, or user-facing states.

Screenshot reports must include:

- Route or page viewed.
- Viewport size or device class.
- Before/after comparison when practical.
- Notes about any visual risks or known gaps.

Documentation-only changes do not require screenshots unless the task explicitly asks for them.

### Required QA format

Every PR or handoff must include:

- Files created.
- Files changed.
- Summary of standards, workflow, or implementation changes.
- Tests/checks run with pass/fail status.
- Screenshot links or notes when UI changed.
- Confirmation that no application code changed, unless application code was explicitly in scope.
- Confirmation that no protected files changed without approval.
- Confirmation that no product data, prices, SKUs, commerce behavior, or configurator logic were invented or changed without approval.
- Known risks, blockers, and follow-up work.

## What we never do

- We never replace product pages with a configurator or package-builder module.
- We never hardcode prices.
- We never invent SKUs, variant IDs, product names, compatibility rules, required components, or package contents.
- We never treat placeholder data as production truth.
- We never bypass lint/build checks.
- We never skip QA.
- We never commit secrets, tokens, credentials, or local environment values.
- We never edit `node_modules/**`, `dist/**`, caches, logs, or generated artifacts.
- We never make direct changes to `production`, `prod`, or `main`.
- We never create product-family-specific React components without Product Architect approval.
- We never mix unrelated refactors into scoped product, data, commerce, documentation, or QA work.

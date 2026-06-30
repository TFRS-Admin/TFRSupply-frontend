# Project Memory

This document is a decision-oriented briefing for new AI agents. It summarizes how the project has evolved, what architecture decisions are currently binding, what is blocked, and where future work should go. It intentionally does not summarize application code.

## Ten-minute context

This project began as a Base44-managed frontend and is now being shaped into an AI-agent-safe product configuration and commerce platform. The current emphasis is not feature expansion; it is establishing safe operating rules, decision records, standards, and system boundaries before agents change product, configurator, commerce, or deployment behavior.

The repository now has an AI operating layer that requires agents to work from a spec, build only the approved scope, verify with lint/build and QA, and stop when protected files or unclear product decisions are involved. The project is moving toward a JSON-first, data-driven product architecture where product pages own layout, configurator modules plug into approved Build & Configure slots, Shopify remains the commerce source of truth, and future quote/cart flows are built only after data and commerce contracts are approved.

## How this project evolved

1. **Base44 frontend foundation**
   - The repo started as a Base44 frontend project with local npm workflows and Base44 publish/development guidance.
   - Early work was app-centric and did not yet have a formal architecture-decision process or agent workflow.

2. **AI operating system layer**
   - Repository-wide agent instructions were added so agents follow Spec → Build → Verify, avoid direct production/main changes, respect protected files, and report QA outcomes.
   - Issue and PR templates were added to make agent work auditable and scoped.
   - CI was introduced to run lint and build checks for `develop` branch activity.

3. **Architecture governance**
   - ADRs were introduced so major decisions are recorded before implementation.
   - Initial ADRs established the generic `ConfiguratorModule`, Shopify export as commerce source of truth, product page layout ownership, and the rule against product-family-specific React components.

4. **Repository standards**
   - Mandatory standards were documented for JSON-first architecture, data-driven UI, no hardcoded prices, no invented SKUs, Shopify-backed commerce, protected files, testing, screenshots, and QA.

5. **System mapping**
   - The intended high-level system flow was documented as: Product Pages → ConfiguratorModule → Configurator JSON → Vehicle Context → Commerce Lookup → Shopify Index → Quote Builder → Future Cart.

## Major architecture decisions

### 1. Spec → Build → Verify is mandatory

Agents must start from a scoped spec, build the smallest approved change, then verify through relevant checks and QA reporting. Ambiguous scope, protected-file conflicts, product behavior changes, and missing approvals require stopping before editing.

### 2. JSON-first architecture

Product, commerce, fitment, package, and required-component facts should come from approved structured data sources before they reach UI. Product facts should not be hidden in JSX, page constants, or component-specific conditionals.

### 3. Data-driven UI

UI should render approved data and configuration. Product-family differences should be represented through data contracts or approved composition patterns, not product-family-specific React components.

### 4. Generic ConfiguratorModule

Future configurator work should use a generic `ConfiguratorModule` architecture. The module should be reusable across product families and driven by approved configuration/data inputs.

### 5. Product pages own layout

Product pages own storytelling, merchandising layout, page-level navigation, resources, calls to action, and the Build & Configure slot. Configurator modules may plug into that slot but must not replace full product pages.

### 6. Shopify Export is commerce source of truth

Shopify Export is the single source of truth for commerce-facing product data. SKU, variant, availability, and pricing references should derive from an approved Shopify export or approved transformed Shopify index.

### 7. No hardcoded prices or invented SKUs

Agents must never hardcode prices or invent SKUs, variant IDs, product names, compatibility rules, required components, or package contents. Missing data is a blocker or data-quality issue.

### 8. No product-family-specific React components by default

Family-specific components are disallowed unless explicitly approved by the Product Architect and documented as an exception.

### 9. Quote Builder and Future Cart are downstream systems

Quote Builder should consume validated configuration and commerce lookup outputs. Future Cart is downstream of quote/cart approval and must not bypass commerce validation.

## Known technical debt

- **Commerce source not yet operationalized:** Shopify export transformation, validation, ownership, and refresh cadence still need to be defined.
- **Fitment data not yet governed:** Vehicle fitment matrix structure, source of truth, and validation rules are not yet documented as accepted implementation inputs.
- **Required components matrix not yet defined:** Package completeness rules, dependencies, exclusions, and invalid-package behavior remain to be specified.
- **Configurator data contract incomplete:** The generic `ConfiguratorModule` direction is documented, but the exact JSON schema and module contract still need specification before implementation.
- **Quote Builder not yet specified:** Quote-ready payload shape, missing-data behavior, and commerce approval workflow need definition.
- **Future Cart is intentionally deferred:** Cart/checkout implementation requires commerce, payment, auth/session, and QA approvals.
- **Deployment workflow needs operational detail:** Railway deployment settings, environment variable names, rollback steps, and ownership still need documentation.
- **Regression QA needs route inventory:** Product page QA should be backed by an approved route/page inventory and screenshot plan.

## Current blockers

- Current Shopify export access and approved transformed Shopify index are not documented.
- Product data ownership and data refresh process are not fully defined.
- Vehicle fitment matrix is not approved.
- Required components matrix is not approved.
- Package Builder behavior and JSON schema are not approved.
- Quote Builder payload and workflow are not approved.
- Future Cart is blocked until commerce lookup, quote flow, checkout/payment approach, and QA requirements are approved.
- Railway deployment workflow is blocked until project access, environment variable names, deployment branch, and rollback expectations are confirmed.

## Current quote-ready product families

No product family is documented as quote-ready in the current AI operating system, ADRs, standards, or system map.

A family should not be treated as quote-ready until all of the following are approved:

- Product data source and ownership.
- Vehicle fitment matrix when fitment applies.
- Required components matrix when package completeness applies.
- Shopify export-derived commerce mapping.
- Configurator JSON contract.
- Quote Builder payload rules.
- QA scenarios for valid, invalid, missing-data, and commerce mismatch cases.

## Held product families

The following product-family areas should be treated as held for implementation until the required data, commerce, and configurator decisions are approved:

- Police / law-enforcement package builder work.
- Fire / EMS package builder work.
- Work truck package builder work.
- Any future product family that requires fitment, package completeness, commerce lookup, quote generation, or cart handoff.

Held means agents may write specs, ADRs, matrices, and QA plans, but must not implement app behavior or modify protected files without approval.

## Future roadmap

### Phase 1 — Governance and project operations

- Keep AI operating docs, ADRs, standards, issue templates, PR templates, and CI current.
- Create GitHub Project workstreams for repo safety, deployment, package builder, commerce index, fitment matrix, required components matrix, product page QA, and ADRs.
- Enforce protected-file and QA reporting expectations.

### Phase 2 — Data foundations

- Define and approve the Shopify export transformation process.
- Define the vehicle fitment matrix.
- Define the required components matrix.
- Define the Configurator JSON schema.
- Establish data validation and ownership.

### Phase 3 — Product and configurator specification

- Write product-family package-builder specs before implementation.
- Define Build & Configure slot requirements on product pages.
- Define valid/invalid package scenarios and missing-data behavior.
- Confirm no family-specific React component exceptions are needed, or document approved exceptions.

### Phase 4 — Commerce and quote workflow

- Build commerce lookup from the approved Shopify index.
- Define Quote Builder payloads, warnings, and review flow.
- Validate SKU, variant, availability, and pricing references.
- Add quote QA coverage.

### Phase 5 — Future cart and checkout

- Design Future Cart only after quote workflow and commerce lookup are approved.
- Review checkout/payment/security implications.
- Add cart/checkout regression QA and rollback plans.

### Phase 6 — Deployment and release operations

- Document Railway deployment workflow.
- Confirm environment variables and secrets are managed outside the repo.
- Define release, rollback, and branch protection policies.

## Guidance for the next AI agent

Start by reading:

1. `AGENTS.md`
2. `docs/START-HERE.md`
3. `agents/AGENT-RULES.md`
4. `agents/PERSONAS.md`
5. `agents/WORKFLOW.md`
6. `docs/STANDARDS.md`
7. `docs/architecture/REPO-MAP.md`
8. `docs/architecture/SYSTEM-MAP.md`
9. `docs/adr/README.md`
10. Accepted ADRs in `docs/adr/`

Then identify the task type:

- Documentation-only: stay in docs/templates unless explicitly approved otherwise.
- Product architecture: create or update specs/ADRs before implementation.
- Data work: define source, schema, owner, validation, and protected-file approval.
- Commerce work: require Shopify export/index, Commerce Engineer approval, and QA plan.
- Configurator/package work: require Product Architect approval, Data Engineer contract, and QA scenarios.
- UI work: require screenshots and confirmation that product pages still own layout.

If a request asks for product behavior, commerce, data, configurator, quote, cart, deployment, or protected-file changes without approvals, stop and ask for clarification.

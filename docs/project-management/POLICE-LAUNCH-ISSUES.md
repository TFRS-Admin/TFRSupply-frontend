# Police Package Builder Launch Issues

Milestone for every issue: `Police Package Builder Launch`.

This list is organized by phase:

1. SPEC issues first.
2. BUILD issues second.
3. QA issues last.

Every BUILD issue is blocked by at least one approved SPEC issue.

---

# SPEC Issues

## SPEC-001 — Verify launch branch protection and CI gates

```md
# [SPEC] Verify launch branch protection and CI gates

## Epic
Epic 000 Repository Foundation

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
QA Engineer

## Goal
Confirm the repository is ready for AI-agent-safe launch work by verifying branch strategy, CI requirements, PR templates, issue templates, and protected-file review expectations before product/package-builder implementation begins.

## Acceptance criteria
- [ ] Confirm `develop` exists or document the current integration branch.
- [ ] Confirm launch work does not target `main`, `production`, or `prod` directly.
- [ ] Confirm CI runs on PRs targeting `develop`.
- [ ] Confirm CI includes `npm run lint`.
- [ ] Confirm CI includes `npm run build`.
- [ ] Confirm PR and issue templates support QA reporting and protected-file review.
- [ ] Document any manual GitHub settings required.
- [ ] Confirm no application source code changes.

## Protected files warning
Do not modify application source code, product data, configurator logic, commerce flows, auth/session behavior, secrets, dependency files, or deployment settings.

## Likely files involved
- `.github/workflows/ci.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/agent_task.md`
- `AGENTS.md`
- `agents/WORKFLOW.md`
- `docs/STANDARDS.md`

## Blockers
- GitHub admin/settings access may be required.
- Hosted CI status may require an open PR.

## QA requirements
- [ ] Include protected-file confirmation.
- [ ] Include manual settings checklist.
- [ ] Include QA report.
```

## SPEC-002 — Create launch decision index

```md
# [SPEC] Create launch decision index

## Epic
Documentation & ADRs

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Documentation Engineer

## Goal
Create a launch decision index that links accepted ADRs, standards, project memory, and missing decisions required before Police Package Builder implementation.

## Acceptance criteria
- [ ] Identify accepted ADRs relevant to launch.
- [ ] Identify missing ADRs required before implementation.
- [ ] Confirm whether ADRs are needed for Configurator JSON, Shopify Index, and Quote Builder payloads.
- [ ] Preserve TFR Supply-specific project memory.
- [ ] Confirm no application source code changes.

## Protected files warning
Documentation-only issue. Do not modify application source code, product data, configurator logic, commerce flows, auth/session logic, secrets, dependency files, or deployment settings.

## Likely files involved
- `docs/adr/README.md`
- `docs/adr/000-template.md`
- `docs/PROJECT-MEMORY.md`
- `docs/STANDARDS.md`
- `docs/architecture/SYSTEM-MAP.md`

## Blockers
- Product Architect review may be needed if new ADRs introduce launch architecture decisions.

## QA requirements
- [ ] Run `npm run lint` if files change.
- [ ] Run `npm run build` if files change.
- [ ] Confirm no app code changed.
- [ ] Include QA report.
```

## SPEC-003 — Define Police launch catalog scope

```md
# [SPEC] Define Police launch catalog scope

## Epic
Police Launch

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Product Architect

## Goal
Define the initial Police launch catalog scope for Package Builder work without inventing product data, SKUs, prices, fitment, or required components.

## Acceptance criteria
- [ ] Identify Police product categories in scope.
- [ ] Identify Police package types in scope.
- [ ] Identify product families excluded from launch.
- [ ] Identify data needed before quote readiness.
- [ ] Identify fitment needs.
- [ ] Identify required component needs.
- [ ] Identify Shopify commerce mapping needs.
- [ ] Define launch readiness gates.
- [ ] Confirm no product data is invented.
- [ ] Confirm no application source code changes.

## Protected files warning
Product data, product-family taxonomy, package definitions, fitment, required components, and commerce mappings are protected. Do not modify protected data or implementation files without explicit approval.

## Likely files involved
- `docs/catalog/police-launch-scope.md` if created
- `docs/PROJECT-MEMORY.md`
- `docs/STANDARDS.md`
- `docs/adr/`

## Blockers
- Product owner approval.
- Shopify Commerce Platform specs.
- Vehicle Fitment System specs.
- Required Components Matrix specs.

## QA requirements
- [ ] Confirm launch scope is documented.
- [ ] Confirm held/out-of-scope families are listed.
- [ ] Confirm no invented product data.
- [ ] Confirm no app code changed.
- [ ] Include QA report.
```

## SPEC-004 — Define Shopify export fields for Police commerce

```md
# [SPEC] Define Shopify export fields for Police commerce

## Epic
Commerce Platform

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Commerce Engineer

## Goal
Define the Shopify export fields required to support Police Package Builder commerce lookup, quote readiness, SKU validation, variant mapping, availability checks, and future cart handoff.

## Acceptance criteria
- [ ] List required Shopify export fields.
- [ ] Identify SKU, variant ID, product title, handle, availability, pricing reference, and status fields.
- [ ] Define missing SKU handling.
- [ ] Define duplicate SKU handling.
- [ ] Define retired/unavailable product handling.
- [ ] Define ownership and refresh cadence.
- [ ] Confirm no hardcoded prices are introduced.
- [ ] Confirm no invented SKUs are introduced.
- [ ] Confirm no application source code changes unless explicitly approved in a follow-up issue.

## Protected files warning
Commerce data, SKU mappings, pricing references, checkout, quote, cart, order, Stripe, Shopify identifiers, and product data are protected. Do not modify commerce behavior or product data without explicit approval.

## Likely files involved
- `docs/commerce/shopify-export-fields.md` if created
- `docs/adr/`
- `docs/STANDARDS.md`
- `docs/PROJECT-MEMORY.md`

## Blockers
- Shopify export access is required.
- Commerce Engineer approval is required.
- Data Engineer validation review is required.

## QA requirements
- [ ] Validate field list against an actual Shopify export if available.
- [ ] Document unavailable access as a blocker if no export is available.
- [ ] Confirm no prices/SKUs/product data were invented.
- [ ] Confirm no application source code changed.
- [ ] Include QA report.
```

## SPEC-005 — Specify Shopify Index transformation and validation rules

```md
# [SPEC] Specify Shopify Index transformation and validation rules

## Epic
Commerce Platform

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Commerce Engineer + Data Engineer

## Goal
Specify how the approved Shopify export becomes the app-consumable Shopify Index used by commerce lookup and quote-ready Police package selections.

## Acceptance criteria
- [ ] Define Shopify Index schema.
- [ ] Define export-to-index transformation rules.
- [ ] Define validation for missing SKUs.
- [ ] Define validation for duplicate SKUs.
- [ ] Define validation for unavailable/retired products.
- [ ] Define how price references are represented without hardcoding prices.
- [ ] Define how package-builder selections reference Shopify Index entries.
- [ ] Define QA checks for index freshness and mismatch reporting.
- [ ] Confirm no application source code changes unless separately approved.

## Protected files warning
Shopify Index, commerce lookup, pricing references, quote/cart/order/checkout flows, Stripe, Shopify identifiers, product data, and environment secrets are protected.

## Likely files involved
- `docs/commerce/shopify-index.md` if created
- `docs/adr/`
- `docs/architecture/SYSTEM-MAP.md`

## Blockers
- Blocks on approved SPEC-004.
- Requires Shopify export access.
- Requires Commerce Engineer and Data Engineer approval.

## QA requirements
- [ ] Include transformation examples.
- [ ] Include validation checklist.
- [ ] Confirm no hardcoded prices.
- [ ] Confirm no invented SKUs.
- [ ] Confirm no application source code changed.
- [ ] Include QA report.
```

## SPEC-006 — Define Police vehicle fitment matrix schema

```md
# [SPEC] Define Police vehicle fitment matrix schema

## Epic
Product Data Platform

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Data Engineer

## Goal
Define the vehicle fitment matrix schema needed to determine Police package compatibility without changing configurator logic or product data.

## Acceptance criteria
- [ ] Define required vehicle fields such as year, make, model, trim/body, and role/use case.
- [ ] Define fitment status values.
- [ ] Define compatibility notes format.
- [ ] Define missing fitment behavior.
- [ ] Define ambiguous fitment behavior.
- [ ] Define validation rules.
- [ ] Define data owner and refresh process.
- [ ] Confirm no app behavior changes.
- [ ] Confirm no product data changes unless separately approved.

## Protected files warning
Vehicle fitment data, product data, configurator logic, vehicle context, and package-builder validation are protected. Do not modify `src/data/**`, `src/context/**`, `src/components/configurator/**`, or `src/pages/BuildReview.jsx` without explicit approval.

## Likely files involved
- `docs/data/police-vehicle-fitment-matrix.md` if created
- `docs/adr/`
- `docs/architecture/SYSTEM-MAP.md`

## Blockers
- Product Architect must confirm target Police vehicle scope.
- Data source for fitment must be identified.

## QA requirements
- [ ] Include valid fitment example.
- [ ] Include invalid fitment example.
- [ ] Include missing-data example.
- [ ] Confirm no application source code changed.
- [ ] Include QA report.
```

## SPEC-007 — Define Police required-components schema

```md
# [SPEC] Define Police required-components schema

## Epic
Product Data Platform

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Product Architect + Data Engineer

## Goal
Define the required-components matrix for Police packages, including required, optional, excluded, and dependent components needed for complete quote-ready package selections.

## Acceptance criteria
- [ ] Define required component fields.
- [ ] Define optional component fields.
- [ ] Define excluded/incompatible component fields.
- [ ] Define dependency rules.
- [ ] Define incomplete-package behavior.
- [ ] Define how required components relate to vehicle fitment.
- [ ] Define how required components relate to Shopify commerce references.
- [ ] Define QA scenarios for complete, incomplete, and invalid packages.
- [ ] Confirm no product data is invented.

## Protected files warning
Product data, required component rules, package validation, configurator logic, commerce mappings, and quote behavior are protected. Do not modify protected implementation files without explicit approval.

## Likely files involved
- `docs/data/police-required-components-matrix.md` if created
- `docs/adr/`
- `docs/STANDARDS.md`

## Blockers
- Product Architect approval.
- Data Engineer source-of-truth review.
- Approved SPEC-005.
- Approved SPEC-006 where fitment affects required components.

## QA requirements
- [ ] Include complete package example.
- [ ] Include incomplete package example.
- [ ] Include incompatible component example.
- [ ] Confirm no invented product data.
- [ ] Confirm no application source code changed.
- [ ] Include QA report.
```

## SPEC-008 — Define generic Configurator JSON contract for Police launch

```md
# [SPEC] Define generic Configurator JSON contract for Police launch

## Epic
Package Builder UI

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Product Architect + Frontend Engineer + Data Engineer

## Goal
Define the JSON contract that will drive the generic ConfiguratorModule for Police Package Builder launch without creating product-family-specific React components.

## Acceptance criteria
- [ ] Define top-level Configurator JSON structure.
- [ ] Define package steps/sections.
- [ ] Define option shape.
- [ ] Define dependency rule shape.
- [ ] Define required component references.
- [ ] Define vehicle fitment references.
- [ ] Define commerce lookup references.
- [ ] Define validation state outputs.
- [ ] Define quote-ready payload output.
- [ ] Confirm no product-family-specific React components are required, or document Product Architect approval for any exception.
- [ ] Confirm no implementation code changes in this spec issue.

## Protected files warning
Configurator logic, state, package-builder validation, product data, vehicle fitment data, required components data, and commerce mappings are protected.

## Likely files involved
- `docs/package-builder/police-configurator-json-contract.md` if created
- `docs/adr/`
- `docs/architecture/SYSTEM-MAP.md`

## Blockers
- Blocks on approved SPEC-005.
- Blocks on approved SPEC-006.
- Blocks on approved SPEC-007.
- Requires Product Architect approval.

## QA requirements
- [ ] Include example valid JSON payload.
- [ ] Include example invalid/missing-data payload.
- [ ] Confirm no application source code changed.
- [ ] Confirm no protected implementation files changed.
- [ ] Include QA report.
```

## SPEC-009 — Define Build & Configure slot integration

```md
# [SPEC] Define Build & Configure slot integration

## Epic
Package Builder UI

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Product Architect + Frontend Engineer

## Goal
Define how Police product pages will expose a Build & Configure slot for the generic ConfiguratorModule while preserving product page layout ownership.

## Acceptance criteria
- [ ] Define where Build & Configure appears on Police product pages.
- [ ] Define what page context is passed into ConfiguratorModule.
- [ ] Define what ConfiguratorModule returns to the page.
- [ ] Define loading, missing-data, invalid-selection, and quote-ready states.
- [ ] Define screenshot requirements for future UI implementation.
- [ ] Confirm product pages retain layout ownership.
- [ ] Confirm ConfiguratorModule does not replace product pages.
- [ ] Confirm no application source code changes in this spec issue.

## Protected files warning
Product page layout, configurator modules, route/page files, product data, and configurator state are protected. Do not modify `src/pages/**`, `src/components/configurator/**`, `src/context/**`, or `src/data/**` without explicit approval.

## Likely files involved
- `docs/package-builder/police-build-configure-slot.md` if created
- `docs/architecture/SYSTEM-MAP.md`
- `docs/adr/003-product-pages-own-layout-configurator-module-build-configure.md`

## Blockers
- Blocks on approved SPEC-003.
- Blocks on approved SPEC-008.
- Product Architect approval of Police product page scope.

## QA requirements
- [ ] Include UI state checklist.
- [ ] Include screenshot checklist for future implementation.
- [ ] Confirm no application source code changed.
- [ ] Include QA report.
```

## SPEC-010 — Create Police package readiness checklist

```md
# [SPEC] Create Police package readiness checklist

## Epic
Police Launch

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Product Architect + QA Engineer

## Goal
Create a readiness checklist for determining when a Police package is quote-ready.

## Acceptance criteria
- [ ] Define quote-ready criteria.
- [ ] Include product data source check.
- [ ] Include fitment matrix check.
- [ ] Include required components matrix check.
- [ ] Include Shopify commerce mapping check.
- [ ] Include Configurator JSON contract check.
- [ ] Include Quote Builder payload check.
- [ ] Include QA scenario check.
- [ ] Include missing-data blocker criteria.
- [ ] Confirm no product family is marked quote-ready without all gates passing.

## Protected files warning
Quote-readiness affects product data, fitment, required components, commerce mappings, configurator logic, and quote behavior. Do not modify protected implementation files without explicit approval.

## Likely files involved
- `docs/catalog/police-quote-readiness-checklist.md` if created
- `docs/PROJECT-MEMORY.md`
- `docs/STANDARDS.md`

## Blockers
- Blocks on approved SPEC-003.
- Blocks on approved SPEC-005.
- Blocks on approved SPEC-006.
- Blocks on approved SPEC-007.
- Blocks on approved SPEC-008.

## QA requirements
- [ ] Include ready example.
- [ ] Include not-ready example.
- [ ] Confirm no app code changed.
- [ ] Confirm no invented data.
- [ ] Include QA report.
```

## SPEC-011 — Draft ADR for Police Package Builder data contract

```md
# [SPEC] Draft ADR for Police Package Builder data contract

## Epic
Documentation & ADRs

## Milestone
Police Package Builder Launch

## Phase
SPEC

## Agent Persona
Documentation Engineer + Product Architect + Data Engineer

## Goal
Draft an ADR for the Police Package Builder data contract once the fitment, required-components, Shopify Index, and Configurator JSON schemas are specified.

## Acceptance criteria
- [ ] Use `docs/adr/000-template.md`.
- [ ] Document context and constraints.
- [ ] Document chosen data contract approach.
- [ ] Document protected files and required approvals.
- [ ] Document implementation guidance for future agents.
- [ ] Document consequences and risks.
- [ ] Keep status as Proposed until reviewed.
- [ ] Confirm no application source code changes.

## Protected files warning
ADR-only work should not modify app source. Future implementation may touch protected product data, configurator logic, commerce mappings, and quote behavior only after approval.

## Likely files involved
- `docs/adr/000-template.md`
- `docs/adr/005-police-package-builder-data-contract.md` if created
- `docs/PROJECT-MEMORY.md`

## Blockers
- Blocks on approved SPEC-005.
- Blocks on approved SPEC-006.
- Blocks on approved SPEC-007.
- Blocks on approved SPEC-008.

## QA requirements
- [ ] ADR includes status, date, owners, context, decision, consequences, implementation guidance, protected files, related issues, and supersession references.
- [ ] Confirm no app code changed.
- [ ] Include QA report.
```

---

# BUILD Issues

## BUILD-001 — Implement Shopify Index artifact

```md
# [BUILD] Implement Shopify Index artifact

## Epic
Commerce Platform

## Milestone
Police Package Builder Launch

## Phase
BUILD

## Agent Persona
Commerce Engineer + Data Engineer

## Goal
Implement the approved Shopify Index artifact or data file for Police Package Builder commerce lookup.

## Acceptance criteria
- [ ] Implementation follows approved SPEC-004 and SPEC-005.
- [ ] No SKUs, prices, variants, availability, or product data are invented.
- [ ] Missing/duplicate/unavailable products follow approved behavior.
- [ ] Protected-file approval is documented before editing.
- [ ] Lint/build pass.

## Protected files warning
This build likely touches protected commerce/product data files. Do not start until approved specs and protected-file approvals are linked.

## Likely files involved
- To be defined by approved SPEC-005.
- Possible protected data/index files under `src/data/**` or a future approved data location.

## Blockers
- BLOCKED by approved SPEC-004.
- BLOCKED by approved SPEC-005.
- BLOCKED by Commerce Engineer approval.
- BLOCKED by Data Engineer approval.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Include SKU/variant validation evidence.
- [ ] Confirm no invented commerce data.
- [ ] Include QA report.
```

## BUILD-002 — Implement Police fitment matrix artifact

```md
# [BUILD] Implement Police fitment matrix artifact

## Epic
Product Data Platform

## Milestone
Police Package Builder Launch

## Phase
BUILD

## Agent Persona
Data Engineer

## Goal
Implement the approved Police vehicle fitment matrix artifact according to the approved schema.

## Acceptance criteria
- [ ] Implementation follows approved SPEC-006.
- [ ] Fitment data source is documented.
- [ ] Missing/ambiguous fitment behavior is represented as approved.
- [ ] No fitment rows are invented.
- [ ] Protected-file approval is documented before editing.
- [ ] Lint/build pass.

## Protected files warning
This build likely touches protected fitment/product data. Do not start until approved specs and protected-file approvals are linked.

## Likely files involved
- To be defined by approved SPEC-006.
- Possible protected files under `src/data/**` or future approved data location.

## Blockers
- BLOCKED by approved SPEC-006.
- BLOCKED by Data Engineer approval.
- BLOCKED by Product Architect approval for vehicle scope.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Validate valid, invalid, and missing fitment examples.
- [ ] Confirm no invented fitment data.
- [ ] Include QA report.
```

## BUILD-003 — Implement Police required-components matrix artifact

```md
# [BUILD] Implement Police required-components matrix artifact

## Epic
Product Data Platform

## Milestone
Police Package Builder Launch

## Phase
BUILD

## Agent Persona
Product Architect + Data Engineer

## Goal
Implement the approved Police required-components matrix artifact according to the approved schema.

## Acceptance criteria
- [ ] Implementation follows approved SPEC-007.
- [ ] Required/optional/excluded/dependent components are represented as approved.
- [ ] No components or dependencies are invented.
- [ ] Protected-file approval is documented before editing.
- [ ] Lint/build pass.

## Protected files warning
This build likely touches protected product/package data. Do not start until approved specs and protected-file approvals are linked.

## Likely files involved
- To be defined by approved SPEC-007.
- Possible protected files under `src/data/**` or future approved data location.

## Blockers
- BLOCKED by approved SPEC-007.
- BLOCKED by approved SPEC-005 if commerce references are required.
- BLOCKED by approved SPEC-006 if fitment references are required.
- BLOCKED by Product Architect and Data Engineer approval.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Validate complete, incomplete, and incompatible package examples.
- [ ] Confirm no invented component data.
- [ ] Include QA report.
```

## BUILD-004 — Implement Configurator JSON for Police Package Builder

```md
# [BUILD] Implement Configurator JSON for Police Package Builder

## Epic
Package Builder UI

## Milestone
Police Package Builder Launch

## Phase
BUILD

## Agent Persona
Product Architect + Frontend Engineer + Data Engineer

## Goal
Implement the approved Configurator JSON contract for the Police Package Builder.

## Acceptance criteria
- [ ] Implementation follows approved SPEC-008.
- [ ] References Shopify Index, fitment matrix, and required-components matrix as approved.
- [ ] Does not introduce product-family-specific React components.
- [ ] Does not hardcode product facts in JSX.
- [ ] Protected-file approval is documented before editing.
- [ ] Lint/build pass.

## Protected files warning
This build likely touches protected configurator/product data files. Do not start until approved specs and protected-file approvals are linked.

## Likely files involved
- To be defined by approved SPEC-008.
- Possible protected files under `src/data/**` or approved Configurator JSON location.

## Blockers
- BLOCKED by approved SPEC-005.
- BLOCKED by approved SPEC-006.
- BLOCKED by approved SPEC-007.
- BLOCKED by approved SPEC-008.
- BLOCKED by Product Architect, Frontend Engineer, and Data Engineer approval.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Validate approved valid and invalid JSON examples.
- [ ] Confirm no family-specific React components were added.
- [ ] Include QA report.
```

## BUILD-005 — Integrate ConfiguratorModule into Police Build & Configure slot

```md
# [BUILD] Integrate ConfiguratorModule into Police Build & Configure slot

## Epic
Package Builder UI

## Milestone
Police Package Builder Launch

## Phase
BUILD

## Agent Persona
Frontend Engineer + Product Architect

## Goal
Integrate the generic ConfiguratorModule into the approved Police product page Build & Configure slot without replacing product page layout.

## Acceptance criteria
- [ ] Implementation follows approved SPEC-009.
- [ ] Product pages retain layout ownership.
- [ ] ConfiguratorModule plugs into the approved Build & Configure slot only.
- [ ] No product-family-specific React components are added unless exception approval is documented.
- [ ] Loading, missing-data, invalid-selection, and quote-ready states follow approved spec.
- [ ] Screenshots are captured for affected UI states.
- [ ] Lint/build pass.

## Protected files warning
This build likely touches protected product page and configurator files. Do not start until approved specs and protected-file approvals are linked.

## Likely files involved
- To be defined by approved SPEC-009.
- Possible protected files under `src/pages/**`, `src/components/configurator/**`, and `src/context/**`.

## Blockers
- BLOCKED by approved SPEC-008.
- BLOCKED by approved SPEC-009.
- BLOCKED by approved SPEC-010 for quote-ready gates.
- BLOCKED by Product Architect and Frontend Engineer approval.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Provide screenshots for desktop and mobile states.
- [ ] Confirm product pages were not replaced.
- [ ] Confirm no unapproved protected files changed.
- [ ] Include QA report.
```

---

# QA Issues

## QA-001 — Police Package Builder QA matrix

```md
# [QA] Police Package Builder QA matrix

## Epic
QA & Regression

## Milestone
Police Package Builder Launch

## Phase
QA

## Agent Persona
QA Engineer

## Goal
Verify Police Package Builder behavior against approved specs, including valid selections, invalid selections, missing data, fitment mismatch, required-component gaps, commerce mapping gaps, and quote-ready output.

## Acceptance criteria
- [ ] Valid package scenarios pass.
- [ ] Invalid package scenarios fail safely.
- [ ] Missing fitment scenarios show approved behavior.
- [ ] Missing required component scenarios show approved behavior.
- [ ] Missing Shopify mapping scenarios show approved behavior.
- [ ] Quote-ready output matches approved payload rules.
- [ ] Lint/build pass.
- [ ] Screenshots are attached for UI states.

## Protected files warning
QA should not modify protected implementation files. If test fixes are required, open a separate issue linked to the failing spec/build issue.

## Likely files involved
- `docs/qa/police-package-builder-qa-matrix.md` if created
- QA evidence attached to GitHub issue/PR

## Blockers
- BLOCKED by BUILD-001.
- BLOCKED by BUILD-002.
- BLOCKED by BUILD-003.
- BLOCKED by BUILD-004.
- BLOCKED by BUILD-005.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Attach scenario results.
- [ ] Attach screenshots for UI states.
- [ ] Confirm no app code changed during QA unless explicitly approved.
- [ ] Include QA report.
```

## QA-002 — Police product page regression checklist

```md
# [QA] Police product page regression checklist

## Epic
QA & Regression

## Milestone
Police Package Builder Launch

## Phase
QA

## Agent Persona
QA Engineer

## Goal
Verify Police product pages preserve layout ownership, Build & Configure slot placement, responsive behavior, content integrity, and no unintended product page regressions.

## Acceptance criteria
- [ ] Police product page route inventory is reviewed.
- [ ] Desktop viewport checks pass.
- [ ] Mobile viewport checks pass.
- [ ] Build & Configure slot appears only where approved.
- [ ] Product page layout remains owned by product pages.
- [ ] Missing product/not-found behavior is not regressed.
- [ ] Screenshots are attached.
- [ ] Lint/build pass.

## Protected files warning
QA should not modify protected implementation files. If product page fixes are required, open a separate build/fix issue linked to the relevant approved spec.

## Likely files involved
- `docs/qa/police-product-page-regression.md` if created
- QA evidence attached to GitHub issue/PR

## Blockers
- BLOCKED by BUILD-005.
- BLOCKED by approved SPEC-009.

## QA requirements
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Attach desktop screenshots.
- [ ] Attach mobile screenshots.
- [ ] Confirm no unapproved app source changes during QA.
- [ ] Include QA report.
```

## QA-003 — Launch protected-file audit

```md
# [QA] Launch protected-file audit

## Epic
Epic 000 Repository Foundation

## Milestone
Police Package Builder Launch

## Phase
QA

## Agent Persona
QA Engineer + Security / Platform Engineer

## Goal
Audit the Police Package Builder launch work for protected-file compliance before release.

## Acceptance criteria
- [ ] Review all spec issues.
- [ ] Review all build issues.
- [ ] Review all QA issues.
- [ ] Identify changes to `src/data/**`.
- [ ] Identify changes to `src/context/**`.
- [ ] Identify changes to `src/components/configurator/**`.
- [ ] Identify changes to commerce, checkout, cart, quote, order, pricing, Stripe, or Shopify flows.
- [ ] Identify changes to auth/session/security/deployment/dependencies/secrets.
- [ ] Confirm approvals exist for every protected change.
- [ ] Confirm no secrets or generated artifacts were committed.

## Protected files warning
Audit-only issue. Do not modify protected files. Do not modify application source code unless a separately approved fix issue is opened.

## Likely files involved
- GitHub Project issues and PRs
- QA evidence
- `agents/WORKFLOW.md`
- `docs/STANDARDS.md`

## Blockers
- BLOCKED by all Police Package Builder launch PRs being ready for audit.

## QA requirements
- [ ] Include protected-file audit table.
- [ ] Include approval owner for each protected area.
- [ ] Run or confirm `npm run lint`.
- [ ] Run or confirm `npm run build`.
- [ ] Include QA report.
```

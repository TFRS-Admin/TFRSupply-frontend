# Epics

## EPIC-01 Platform Architecture Governance

### Objective
Establish the repository architecture, ownership boundaries, and review gates that keep TFRSupply migrations additive, typed, testable, and safe.

### Business Value
A stable architecture reduces regression risk across Police, Fire/EMS, and Work Truck catalog experiences while allowing AI agents and humans to work from one operating model.

### Exit Criteria
- Architecture documents are current for domain model, service layer, validation, catalog service, pricing domain, and product data platform.
- Every architectural change has an approved architecture issue and PR.
- Dependency direction is enforced in review: React to hooks, hooks to services, services to loaders, loaders to validators, validators to schemas/types, schemas/types to JSON.

### Deliverables
- Architecture decision records for new platform boundaries.
- Dependency diagrams for service, catalog, pricing, commerce, configurator, vehicle, and quote flows.
- Review checklist covering no direct JSON imports in new migrated React code.

### Risks
- Unreviewed changes may couple React directly to data loaders.
- Service abstractions may become too broad without explicit ownership.
- Architecture-only work may drift from runtime migration needs.

### Dependencies
- Repository standards and TypeScript foundation.
- Product Data Platform validation contracts.
- Service Layer Foundation.

### Definition of Done
- Documentation is updated in the same PR as architecture changes.
- No application runtime behavior changes unless the issue explicitly approves them.
- Lint, build, and typecheck pass or failures are documented as environment limitations.

## EPIC-02 Product Data Platform

### Objective
Make product, category, vertical, and configurator data load through typed loaders, normalizers, and Zod validation before wider runtime migration.

### Business Value
Typed and validated product data prevents silent catalog defects, supports AI-safe changes, and creates reliable source-of-truth contracts for storefront, quote, and commerce work.

### Exit Criteria
- All catalog and configurator JSON can be validated through typed loaders.
- Validation errors include filename, stable identifier, SKU when available, field path, and actionable message.
- CI has an explicit product-data validation check before release.

### Deliverables
- Loader coverage for products, categories, verticals, configurators, and future package data.
- Cross-file semantic validation for IDs, categories, vertical membership, configurator references, and SKU references.
- Data-quality report suitable for issue creation.

### Risks
- Existing JSON shapes may contain inconsistent legacy fields.
- Strict validation may block release if introduced without staged remediation.
- Product data corrections may accidentally change merchandising behavior.

### Dependencies
- Domain Model.
- Validation architecture.
- Catalog Service.

### Definition of Done
- Data validation is deterministic and fails loudly.
- Remediation issues are created for every blocking data defect.
- Product data changes remain isolated from application code unless explicitly scoped.

## EPIC-03 Catalog Runtime Migration

### Objective
Move read-only catalog experiences from legacy loaders to catalog hooks and services without changing visual behavior.

### Business Value
Catalog pages become safer to maintain and easier for AI agents to evolve while preserving conversion-critical product discovery paths.

### Exit Criteria
- Category, vertical, product detail, and navigation catalog reads use service-backed hooks.
- No migrated React catalog surface imports product JSON or legacy data loaders directly.
- Browser smoke tests confirm no visible catalog regressions.

### Deliverables
- Hook-backed catalog page migrations.
- Catalog service tests for list, get, null, and validation-error behavior.
- Migration documentation for each completed surface.

### Risks
- Subtle view-model differences may alter product presentation.
- Loading and error states may affect SSR or hydration behavior.
- Legacy components may retain hidden data dependencies.

### Dependencies
- Product Data Platform.
- Service Layer Foundation.
- Frontend QA coverage.

### Definition of Done
- Migrated surfaces preserve routes, content order, styling, and fallback behavior.
- Tests cover service and hook contracts.
- Direct legacy catalog imports are removed from the migrated scope.

## EPIC-04 Configurator Platform Migration

### Objective
Move configurator data access, option resolution, SKU filtering, accessory selection, and quote handoff behind typed services while preserving existing configurator behavior.

### Business Value
The configurator is central to high-value emergency vehicle sales; typed service boundaries reduce risk before pricing, quote, and commerce capabilities are expanded.

### Exit Criteria
- Configurator UI reads through configurator service and typed loader.
- SKU filtering, dead-end prevention, accessory toggling, and quote payload output have automated coverage.
- Configurator option contracts support vehicle rules, section maps, SKU attributes, and verification metadata.

### Deliverables
- Configurator service expansion.
- Browser-capable configurator interaction tests.
- Configurator migration documentation and rollback notes.

### Risks
- SKU filtering regressions may produce invalid builds.
- Accessory selections may drift from quote output.
- Vehicle rules may be interpreted differently than legacy behavior.

### Dependencies
- Product Data Platform.
- Vehicle domain.
- Pricing and quote contracts.

### Definition of Done
- Existing configurator workflows render and behave identically unless explicitly changed.
- Commerce and pricing behavior remain untouched until their issues are approved.
- All configurator tests pass for representative Police, Fire/EMS, and Work Truck products.

## EPIC-05 Pricing Engine Foundation

### Objective
Create a safe pricing domain for MSRP, dealer cost, contract pricing, bundle pricing, margin, and quote pricing without coupling pricing policy to React.

### Business Value
Reliable pricing protects margin, supports contract sales, and enables quote automation for complex vehicle packages.

### Exit Criteria
- Pricing source hierarchy is implemented and tested behind pricing services.
- Contract windows, promotional bundles, dealer cost, and list price remain separately modeled.
- Quote pricing results include warnings for missing costs, expired contracts, and margin concerns.

### Deliverables
- Pure pricing resolver.
- Pricing source adapters.
- Margin calculation tests.
- Pricing acceptance criteria and review checklist.

### Risks
- Mixing list price, cost, and selling price can create margin errors.
- Contract expiration logic may be misapplied.
- UI display changes may expose incomplete pricing.

### Dependencies
- Pricing Domain.
- Commerce mapping.
- Quote contracts.
- Product and SKU identity validation.

### Definition of Done
- Pricing calculations are pure, deterministic, and covered by tests.
- Pricing warnings are explicit and reviewable.
- No storefront price display changes occur without a feature issue.

## EPIC-06 Commerce and Checkout Integration

### Objective
Formalize Shopify product, variant, inventory, cart, and checkout boundaries through commerce services and adapters.

### Business Value
Commerce integrity ensures configured products map to purchasable variants only when data is complete and checkout behavior is safe.

### Exit Criteria
- Commerce service owns Shopify-facing product and variant mappings.
- Add-to-cart readiness is determined by validated mappings and inventory state.
- Checkout changes have rollback paths and production smoke tests.

### Deliverables
- Commerce adapter contracts.
- Variant mapping validation.
- Cart readiness tests.
- Checkout workflow documentation.

### Risks
- Invalid variant mappings may send customers to wrong products.
- Inventory state may be stale or unavailable.
- Checkout changes may affect revenue-critical flows.

### Dependencies
- Product Data Platform.
- Configurator SKU contracts.
- Pricing source rules.

### Definition of Done
- Shopify identifiers remain isolated to commerce contracts.
- Cart behavior is tested before release.
- Failed commerce lookups fail safe and never create ambiguous cart lines.

## EPIC-07 Quote Builder and Review Workflow

### Objective
Implement quote creation, review flags, payload persistence, pricing handoff, and submission workflows behind quote services.

### Business Value
Quote automation accelerates sales cycles while preserving human review for high-risk configurations, contract prices, and incomplete data.

### Exit Criteria
- Quote payloads are typed, validated, and traceable to product, SKU, accessory, vehicle, pricing, and customer context.
- Review flags are generated for missing pricing, compatibility concerns, and manual-review rules.
- Quote submission has success, failure, retry, and audit behavior.

### Deliverables
- Quote service implementation.
- Quote payload validation tests.
- Review workflow documentation.
- Sales handoff checklist.

### Risks
- Quotes may omit required configuration or pricing context.
- Manual review flags may be too noisy or too permissive.
- Submission failures may lose customer intent.

### Dependencies
- Configurator migration.
- Pricing resolver.
- Vehicle fitment.
- Commerce mapping.

### Definition of Done
- Every quote line has validated product and option identity.
- Pricing and review warnings are visible to the quote workflow.
- Submission outcomes are observable and recoverable.

## EPIC-08 Vehicle and Fitment Intelligence

### Objective
Create a vehicle and fitment service that supports compatibility rules across catalog, configurator, package builder, pricing, and quote workflows.

### Business Value
Vehicle-aware recommendations reduce invalid configurations and improve buyer confidence for emergency and work truck equipment.

### Exit Criteria
- Vehicle make, model, year, body, and fitment contracts are validated.
- Compatibility rules can be evaluated without React dependencies.
- Fitment results can explain allowed, blocked, and review-required choices.

### Deliverables
- Vehicle data contracts and loaders.
- Fitment evaluation service.
- Compatibility test matrix.
- Fitment documentation.

### Risks
- Incomplete vehicle data may block valid configurations.
- Rules may be too coarse for specialized fleet upfits.
- Fitment claims may require manual verification.

### Dependencies
- Domain Model.
- Configurator rules.
- Product data validation.

### Definition of Done
- Fitment results are deterministic and explainable.
- Unknown fitment fails to review-required rather than approved.
- Tests cover supported vertical examples.

## EPIC-09 Testing, QA, and Release Reliability

### Objective
Build an automated quality system for linting, type checking, unit tests, data validation, browser smoke tests, and release evidence.

### Business Value
Reliable automation enables AI-managed delivery without increasing production risk.

### Exit Criteria
- Required checks run for every PR.
- Release candidates include test evidence and rollback notes.
- QA issues are generated from failed checks with clear reproduction steps.

### Deliverables
- CI workflow definitions.
- Browser-capable component and E2E test layers.
- Release checklist.
- QA evidence template.

### Risks
- Tests may be flaky without stable fixtures.
- Browser tests may slow delivery if not scoped.
- Missing test ownership may create stale coverage.

### Dependencies
- Project workflows.
- Service contracts.
- Deployment environments.

### Definition of Done
- Tests are meaningful, deterministic, and documented.
- Failures block merge unless an approved exception exists.
- Release evidence is attached to every release PR.

## EPIC-10 DevOps, Environments, and AI Operations

### Objective
Standardize environments, protected branches, deployment gates, rollback, agent responsibilities, and project bootstrap for AI-managed development.

### Business Value
Operational discipline lets AI agents create, test, review, and release changes safely under human-approved governance.

### Exit Criteria
- Branch protections and required checks are documented and enforced.
- Preview, staging, and production deployment expectations are explicit.
- Agent personas have clear ownership and escalation paths.

### Deliverables
- Branch strategy.
- Project bootstrap guide.
- Release and hotfix workflows.
- Agent persona operating model.

### Risks
- AI agents may act outside their authorized scope.
- Emergency changes may bypass documentation.
- Environment drift may invalidate QA evidence.

### Dependencies
- Definition of Done.
- Workflow documentation.
- CI and deployment provider configuration.

### Definition of Done
- Every operational workflow has an owner, gate, and rollback path.
- Agents can start new projects from the documented bootstrap process.
- Production changes are traceable to issues, PRs, tests, and release notes.

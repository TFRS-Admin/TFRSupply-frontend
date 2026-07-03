# Repository Index

## Purpose

This is the entry point for AI coding agents and human contributors joining the TFRSupply frontend repository. Start here, then follow the links below to the specific doc a task requires. No repository-wide index existed before this document.

## Start Here

1. `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` — governance, workflow, and layer conventions every agent must follow.
2. `docs/ai/IMPLEMENTATION_WORKFLOW.md` — the branch-to-merge lifecycle for a single issue.
3. `docs/ai/ARCHITECTURE_PRINCIPLES.md` — condensed architectural rules and anti-patterns.
4. `docs/ai/PROMPT_TEMPLATE.md` — short prompt templates for foundation, feature, refactor, bug fix, and documentation issues.

## AI Playbook (`docs/ai/`)

| Doc | Covers |
| --- | --- |
| `AI_DEVELOPMENT_PLAYBOOK.md` | Repository philosophy, AI-first workflow, branch/PR/QA expectations, layer conventions |
| `IMPLEMENTATION_WORKFLOW.md` | Full issue lifecycle from `main` to merged and deleted branch |
| `ARCHITECTURE_PRINCIPLES.md` | Service-oriented, domain-driven, validation, and adapter principles |
| `PROMPT_TEMPLATE.md` | Reusable short prompt templates by issue type |
| `REPOSITORY_INDEX.md` | This document |

## Architecture (`docs/architecture/`)

| Doc | Covers |
| --- | --- |
| `SERVICE_LAYER.md` | Service layer boundaries, dependency direction, service ownership table |
| `VALIDATION.md` | Zod schema organization, source-of-truth rule, import rules |
| `DOMAIN_MODEL.md` | Shared `src/types` contracts, type relationships, naming conventions |
| `CATALOG_SERVICE.md` | Catalog service (products, categories, verticals) |
| `PRODUCT_DATA_PLATFORM.md` | Typed product data loaders and validation platform |
| `CONFIGURATOR` (see `docs/migrations/CONFIGURATOR_MIGRATION.md`) | Configurator runtime migration |
| `COMMERCE_FOUNDATION.md` | Shopify-facing commerce service and adapter boundaries |
| `PRICING_DOMAIN.md` | Pricing service, adapter, engine-contract, and pricing import pipeline foundations |
| `QUOTE_BUILDER_FOUNDATION.md` | Quote lifecycle service and contract foundations |
| `QUOTE_PDF_GENERATION.md` | Quote PDF render orchestration and validation |
| `SHOPIFY_CUSTOMER_INTEGRATION.md` | Shopify customer creation and synchronization foundation |
| `SHOPIFY_ORDER_INTEGRATION.md` | Shopify order creation and synchronization foundation |
| `SHOPIFY_FULFILLMENT_FOUNDATION.md` | Shopify fulfillment and shipment synchronization foundation |
| `SHOPIFY_INVENTORY_SYNCHRONIZATION.md` | Shopify inventory synchronization foundation |
| `SHOPIFY_WEBHOOK_FOUNDATION.md` | Shopify inbound webhook receive/validate/normalize/route foundation |
| `SHOPIFY_SYNC_ORCHESTRATOR.md` | Shopify synchronization orchestrator coordination layer |
| `SHOPIFY_JOB_QUEUE_FOUNDATION.md` | Shopify job queue contracts, adapter boundary, and dependency handling foundation |
| `SHOPIFY_SYNC_ADMIN_DASHBOARD.md` | Visible `/admin/shopify-sync` dashboard composing existing Shopify sync services against mock adapters |
| `VEHICLE_FITMENT_SERVICE.md` | Vehicle lookup and fitment evaluation service |
| `PACKAGE_BUILDER_FOUNDATION.md` | Package composition and validation service |
| `ADMIN_AUTHENTICATION_WORKSPACE.md` | Frontend admin authentication service, adapter boundary, and mock-identity session gate for `/admin/shopify-sync` and `/admin/quote-builder` |
| `ADMIN_SALES_DASHBOARD.md` | Authenticated `/admin` landing page composing authentication, Shopify sync, pricing import, and quote builder/persistence foundations into one status and metrics overview |
| `CUSTOMER_WORKSPACE.md` | Customer Workspace Foundation — `/admin/customers` list/search/filter/detail view over deterministic customer fixtures, reusing `QuoteCustomerMetadata` and `ShopifyCustomerSyncStatus` |
| `PRODUCT_DISCOVERY.md` | Product Discovery Foundation — customer-facing `/search` page, `catalogService.searchProducts()`, and the shared `ProductCard`/`ProductSearchBar`/`ProductFilterPanel` components reused by `CategoryTemplate` |
| `PRODUCT_DETAIL_EXPERIENCE.md` | Product Detail Experience — commerce summary, fitment summary, deterministic recommendations, related packages, and CTA area composed onto `ProductDetailTemplate` from the Catalog Service, Commerce Foundation, Vehicle Fitment Service, and Package Builder Foundation |
| `CART_WORKSPACE_EXPERIENCE.md` | Cart Workspace Experience — customer-facing `/cart` page, reusable header `MiniCart`, `cartWorkspaceService`'s deterministic in-memory adapter, and checkout-preparation handoff to the existing Commerce Foundation |
| `CONFIGURATOR_EXPERIENCE.md` | Configurator Experience — vehicle summary, configuration summary, pricing summary, fitment feedback, and commerce action panels composed around the existing, unchanged `ConfiguratorModule` from the Vehicle Fitment Service, Package Builder Foundation, Pricing Engine, Cart Workspace, and Quote Builder |

## TypeScript (`docs/typescript/`)

| Doc | Covers |
| --- | --- |
| `TYPESCRIPT_FOUNDATION.md` | Mixed JS/TS setup, migration rules, `npm run typecheck` |

## Testing (`docs/migrations/`)

| Doc | Covers |
| --- | --- |
| `TESTING_NOTES.md` | Current `node --test` + Vite SSR test stack, coverage, and next testing layer |
| `FIRST_REACT_MIGRATION.md` | First legacy-to-React migration precedent |
| `PRODUCT_DETAIL_MIGRATION.md` | Product detail page migration |
| `VERTICAL_LANDING_MIGRATION.md` | Vertical landing page migration |
| `CONFIGURATOR_MIGRATION.md` | Configurator runtime migration |

## Project Management (`docs/project-management/`)

| Doc | Covers |
| --- | --- |
| `01_epics.md` | Platform epics, exit criteria, dependencies |
| `02_issue_templates.md` | Issue templates by type (architecture, feature, migration, bug, refactor, docs, research, QA, performance, infrastructure) |
| `03_labels.md` | Label taxonomy |
| `04_workflows.md` | Issue lifecycle, branch naming, commit format, PR/release/hotfix/rollback workflows |
| `05_definition_of_done.md` | Organization-wide Definition of Done |
| `06_acceptance_criteria_library.md` | Reusable acceptance criteria by area (frontend, backend, services, pricing, commerce, documentation, migration, testing) |
| `07_agent_personas.md` | Agent persona ownership and review responsibilities |
| `08_dependency_map.md` | Epic and issue dependency rules, platform/runtime/issue-flow diagrams |
| `09_branch_strategy.md` | Branch naming, release cadence, merge policy, protected branch policy, review ownership |
| `10_project_bootstrap.md` | Bootstrapping a new TFRSupply-style repository end to end |

## Deployment (`docs/deployment/`)

| Doc | Covers |
| --- | --- |
| `RAILWAY_DEPLOYMENT.md` | Railway deployment configuration and process |

## Architecture Decision Records

No dedicated ADR directory exists yet. Architecture decisions are currently captured as narrative sections inside the relevant `docs/architecture/*.md` foundation doc (Purpose, Rules, Anti-patterns, Current Implementation Boundary). If ADR-style records are introduced, add them under `docs/architecture/decisions/` and link them from this index.

## Application-Level Docs (`src/docs/`)

These describe specific application surfaces rather than platform architecture; consult them when working inside the corresponding feature area:

| Doc | Covers |
| --- | --- |
| `configurator-architecture.md` | Configurator module implementation notes |
| `configurator-test-cases.md` | Configurator test case catalog |
| `data-schemas.md` | Legacy/application data schema notes |
| `police-lightbar-configurator-readiness.md` | Police lightbar configurator readiness notes |
| `quote-request-flow.md` | Quote request flow notes |
| `shopify-cart-architecture.md` | Shopify cart architecture notes |
| `shopify-data-collection-checklist.md` | Shopify data collection checklist |
| `shopify-mapping-contract.md` | Shopify mapping contract notes |

## Root Docs

| Doc | Covers |
| --- | --- |
| `README.md` | Base44 project setup, local dev, and publishing instructions |

## Keeping This Index Current

Add a row to the relevant table above in the same PR that introduces a new top-level doc under `docs/`. Do not leave a new doc undiscoverable from this index.

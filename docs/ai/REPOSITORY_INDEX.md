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
| `PRODUCT_COMPARISON.md` | Product Comparison and Selection — `CompareContext` selection state (max 4, `localStorage`-persisted), pure add/remove/limit rules in `src/domain/catalog/compareSelection.ts`, compare buttons on `ProductCard`/`CommerceActionPanel`, the sticky site-wide `CompareTray`, and the `/compare` page composed entirely from `catalogService` reads |
| `RECENTLY_VIEWED_PRODUCTS.md` | Recently Viewed Products — `RecentlyViewedContext` tracked-id state (max 8, `localStorage`-persisted), pure tracking/dedupe/limit rules in `src/domain/catalog/recentlyViewed.ts`, view tracking on `ProductDetailTemplate`, and the `RecentlyViewedProducts` section composed onto Product Detail, Search, and the homepage entirely from `catalogService` reads |
| `SAVED_PRODUCTS.md` | Save for Later / Saved Products — `SavedProductsContext` saved-id state (`localStorage`-persisted), pure save/unsave/dedupe rules in `src/domain/catalog/savedProducts.ts`, `SaveForLaterButton` on `ProductCard`/`CommerceActionPanel`, the header `SavedProductsButton`, the homepage `SavedProductsSection`, and the `/saved-products` page composed entirely from `catalogService` reads |
| `CART_WORKSPACE_EXPERIENCE.md` | Cart Workspace Experience — customer-facing `/cart` page, reusable header `MiniCart`, `cartWorkspaceService`'s deterministic in-memory adapter, and checkout-preparation handoff to the existing Commerce Foundation |
| `CONFIGURATOR_EXPERIENCE.md` | Configurator Experience — vehicle summary, configuration summary, pricing summary, fitment feedback, and commerce action panels composed around the existing, unchanged `ConfiguratorModule` from the Vehicle Fitment Service, Package Builder Foundation, Pricing Engine, Cart Workspace, and Quote Builder |
| `CHECKOUT_PREPARATION.md` | Checkout Preparation Layer — `checkoutPreparationService`, the `/cart` Checkout Readiness panel, and cart/configuration/package/pricing/commerce validation and payload-preview generation composed from the Cart Workspace, Commerce Foundation, Package Builder, and Pricing Engine, with no live Shopify calls, redirects, or payments |
| `SHOPIFY_STOREFRONT_API_FOUNDATION.md` | Shopify Storefront API Foundation — `ShopifyStorefrontAdapter` boundary (mock/unavailable/live-stub), `shopifyStorefrontService`, and `useShopifyStorefront()`/`useStorefrontAvailability()` hooks; a read-only availability badge is the only current integration point, surfaced in the `/cart` Checkout Readiness panel, with no live Storefront API calls |
| `SHOPIFY_STOREFRONT_CART_ADAPTER.md` | Shopify Storefront Cart Adapter Foundation — `ShopifyStorefrontCartAdapter` boundary (mock/unavailable/live-stub), `shopifyStorefrontCartService` cart-line mapping and mutation-preview generation composed from the Cart Workspace and Commerce Foundation, and `useShopifyStorefrontCart()`/`useShopifyStorefrontCartPreview()` hooks; a read-only Storefront cart preview is the only current integration point, surfaced in the `/cart` Checkout Readiness panel, with no live checkout, redirect, or Shopify API calls |
| `SHOPIFY_CHECKOUT_URL_PREVIEW.md` | Shopify Checkout URL Preview Foundation — `ShopifyCheckoutPreviewAdapter` boundary (mock/unavailable/live-stub), `shopifyCheckoutPreviewService` blocker/warning aggregation and checkout-URL-preview generation composed from the Checkout Preparation Layer and Shopify Storefront Cart Adapter Foundation, and `useShopifyCheckoutPreview()` hook; the final, read-only checkout URL preview (status, adapter mode, blockers, warnings, "checkout redirect disabled" message) is surfaced in the `/cart` Checkout Readiness panel, with no live checkout, redirect, or Shopify API calls |
| `SHOPIFY_STOREFRONT_PRODUCT_SYNC.md` | Shopify Storefront Product Sync Foundation — `ShopifyStorefrontProductAdapter` boundary (mock/unavailable/live-stub), `shopifyStorefrontProductService` product-to-Shopify mapping derivation and query-preview generation composed from the Product Data Platform and Catalog Service, and `useShopifyStorefrontProduct()`/`useShopifyStorefrontProductPreview()` hooks; a read-only Storefront Product panel (readiness, mapping status, variant count, media count, handle, adapter mode) is the only current integration point, surfaced on Product Detail, with no live Storefront API calls or GraphQL execution |
| `SHOPIFY_STOREFRONT_COLLECTION_SYNC.md` | Shopify Storefront Collection Sync Foundation — `ShopifyStorefrontCollectionAdapter` boundary (mock/unavailable/live-stub), `shopifyStorefrontCollectionService` category-to-Shopify-collection mapping derivation and query-preview generation composed from the Product Data Platform and Catalog Service, and `useShopifyStorefrontCollection()`/`useShopifyStorefrontCollectionPreview()` hooks; a read-only Storefront Collection panel (readiness, collection handle, product count, mapping status, adapter mode) is the only current integration point, surfaced on the customer-facing Category page, with no live Storefront API calls, GraphQL execution, or collection publishing |
| `SHOPIFY_STOREFRONT_LIVE_CONFIG_READINESS.md` | Shopify Storefront Live Configuration Readiness — `shopifyStorefrontConfigService` reads frontend-safe Vite env vars (`VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_API_VERSION`, `VITE_SHOPIFY_STOREFRONT_ENABLED`), validates config shape, redacts the store domain, and aggregates `getCapabilities()` from the existing Storefront API/Cart Adapter/Product Sync/Collection Sync foundations into a `ShopifyStorefrontCapabilitySummary`; `useShopifyStorefrontConfig()`/`useShopifyStorefrontCapabilities()` hooks feed a shared, read-only `StorefrontConfigReadinessRow` surfaced in the `/cart` Checkout Readiness panel, Product Detail's Storefront Product panel, and the Category page's Storefront Collection panel; no Storefront access token is ever read or displayed, `liveAdapterReady` is always `false`, and no live Shopify API call is made |
| `PROJECT_WORKSPACE.md` | Project Workspace — customer-facing `/workspace` dashboard composing Saved Products, Recently Viewed, Compare Queue, Cart Summary, Selected Vehicle, a Recent Configurations placeholder, and a Quote Builder shortcut from existing contexts/hooks/`catalogService`; the header's `WorkspaceButton` and the mobile drawer's "My Workspace" entry point are the only new navigation surfaces, no new persistence, pricing, commerce, or configurator logic is introduced |
| `SHOPIFY_STOREFRONT_CATALOG_ADAPTER.md` | Shopify Storefront Catalog Adapter — the first live-capable Shopify Storefront integration; a `CatalogAdapter` boundary (mock/unavailable/live) and `catalogAdapterService` that `catalogService` reads through (with loader-based fallback, interface unchanged), a live adapter that performs a real `fetch()` against the Storefront GraphQL API when given an explicit config, pure Storefront→Product/Category mapping, and the `/dev/storefront` dev dashboard (active adapter, fetch status, last sync time, mapping validation) |
| `SHOPIFY_STOREFRONT_RUNTIME_READINESS.md` | Shopify Storefront Runtime Readiness — `shopifyStorefrontRuntimeService` composes `shopifyStorefrontConfigService` and the Storefront API/Cart Adapter/Product Sync/Collection Sync/Checkout URL Preview foundations' `getCapabilities()` into a `ShopifyStorefrontRuntimeStatus` (runtime mode detection, capability matrix, feature flag summary, environment diagnostics, developer readiness summary); `useShopifyStorefrontRuntimeStatus()` feeds the developer-only, read-only `/dev/storefront` dashboard (`DevStorefrontDashboard.jsx`); no new adapter, env variable, adapter-selection wiring, or live Shopify API call is introduced, and no secret or access token is ever displayed |

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

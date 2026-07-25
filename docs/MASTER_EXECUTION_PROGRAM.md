# TFRSupply — Master Execution Program (v1.0 Launch)

**Status:** SOURCE OF TRUTH for all execution until v1.0 launch.
**Audited:** 2026-07-08, against commit `430b52e` (post base44 removal, PR #273).
**Method:** Full repository audit — routes, pages, services, adapters, domain, data, configurators, Shopify index, ingestion scripts, tests, build, deployment, docs, and open GitHub issues. Where docs and code disagreed, code won. All claims below are grounded in files in this repo.

**Rule zero for every future session:** Read this document before writing any code. Execute the PR plan in Section 6 in order. Do not invent new scope. Do not rebuild anything listed in Section 1.4.

---

## 1. Executive Summary

### 1.1 Production readiness score

**6/10 overall — architecture is ahead of activation.**

| Dimension | Score | Basis |
|---|---|---|
| Architecture & code quality | 9/10 | Ports-and-adapters, 38 Zod schemas, ~58 type modules, 13 domain subdomains, 1,143 tests |
| Commerce path (checkout) | 6/10 | Fully coded live `cartCreate` → hosted checkout; never activated or verified against the real store |
| Catalog & data | 6/10 | 989-SKU committed variant index with real Shopify GIDs; stale vs. last ingest (1,839); 18 unmatched SKUs |
| Customer accounts | 2/10 | Entirely stubbed (hardcoded mock user); auth pages built but unrouted |
| Production posture | 3/10 | "PROTOTYPE — NOT FOR PRODUCTION" banner ships unconditionally; deploy docs inject dead base44 env vars |
| Process (CI/quality gates) | 2/10 | No `.github/` directory at all; 2 failing tests on main |

### 1.2 What is actually built (verified in code)

- **A real, dormant checkout path.** `/cart` (`CartWorkspace.jsx`) → `useShopifyStorefrontCartCreate` → `shopifyStorefrontCartCreateService` → `liveShopifyStorefrontCartAdapter` performs a **real `cartCreate` GraphQL mutation** and redirects to Shopify's hosted `checkoutUrl`. It activates when `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `VITE_SHOPIFY_STOREFRONT_ENABLED=true` are set. It sends only `merchandiseId` + `quantity`, so Shopify re-prices authoritatively — no client price authority risk.
- **A real SKU→variant pipeline.** `src/data/shopify/shopify-variant-index.json` (989 SKUs, real `gid://shopify/ProductVariant/...` IDs and prices) resolved via `commerceLookupService` → `shopifyVariantResolverService`. `canAddToCart` requires GID + price; unresolvable SKUs degrade to quote-only.
- **16 data-driven configurators** (`src/data/configurators/*.json`) over `src/components/configurator/ConfiguratorModule.tsx` (`src/domain/configuration/configuratorEngine.js` was a separate, never-mounted parallel engine — deleted as dead code in #321), covering Valor, Integrity, Allegiant Max, Vision SLR (bar + beacon), Navigator (4 variants), Reliant S2, SignalMaster (3 variants), MicroPulse Ultra, SpectraLux ILS, FireRay. Configurator output maps SKU → GID → cart line. No hardcoded prices.
- **Real ingestion tooling.** `npm run shopify:ingest` rebuilds the variant index from `data/shopify-exports/products_export.csv` with a data-quality report; `npm run shopify:gid-overlay` is the repo's only live Shopify Admin API caller (build-time, env-secured, tokens never in frontend).
- **Complete storefront shell.** Centralized routing in `src/App.jsx` with catch-all 404 (`PageNotFound`) and product-not-found handling (`NotFound` / `ProductComingSoon` in `ProductDetailTemplate.tsx:151-155`); sticky header, mega-menu (`NavigationMegaMenu`), mobile drawer, mini-cart; template-driven `/:vertical/:category/:product` pages fed by typed JSON loaders; working search, compare (max 4), saved products, recently viewed.
- **Real pricing domain.** `src/domain/pricing/pricingEngine.ts` — money math, three-tier (list/dealer/contract), quantity breaks, margin — Zod-validated, tested.
- **A large real test suite.** 69 files, 1,143 tests, ~71s, node built-in runner. Typecheck and lint pass with 0 errors. Production build succeeds (1.95 MB JS / 428 KB gzip, single bundle).
- **Extensive fleet/quote domain logic** (fleet builds/projects/quotes, procurement packages, department standards, upfit builder) — genuine, tested pure functions with React contexts, persisted only to localStorage.

### 1.3 What is prototype / stub (verified in code)

- **Customer auth:** `src/lib/AuthContext.tsx` hardcodes `MOCK_USER` (`demo@tfrsupply.com`, role `admin`), `isAuthenticated: true`; every action (`login`, `register`, `logout`, OTP, password reset) is a no-op. `Login/Register/ForgotPassword/ResetPassword.tsx` are fully built UI but **not routed** — links to `/login` 404.
- **Admin auth:** two parallel mock gates. `AdminAuthGuard` uses `mockAdminAuthAdapter` (pick a demo user, no password); `adminAccessService.ts` literally returns `{ authorized: true }` unconditionally and says "NOT a real security boundary". Only 3 of 7 admin routes are guarded at all; `/admin/debug`, `/admin/quotes`, `/admin/customers`, `/admin/pricing-imports`, `/dev/storefront` are open.
- **Cart persistence:** `mockCartWorkspaceAdapter` is in-memory — cart is lost on refresh. Shipping/tax are explicit `null` placeholders (fine — Shopify checkout owns them).
- **Quote delivery:** `quoteRequestAdapter.ts` logs to console and returns fake success (`savedRecord: false`). "Request Quote" flows currently **lose the lead silently**. Compare-page quote is a `mailto:` link (that one works).
- **All Shopify back-office "sync" services** (orders, inventory, fulfillment, webhooks, HMAC, job queue, orchestrator, email) are typed contracts + mock adapters. They need a backend that does not exist in this repo. They are architecture, not features.
- **Quote PDF:** `jspdf` installed, never imported; renderer is `unavailableQuotePdfRenderer`.
- **Stripe:** both `@stripe/*` packages installed, **zero references in `src/`**. Dead weight — Shopify hosts payment.
- **Dead/unrouted pages:** `PoliceLanding`, `FireEMSLanding`, `WorkTruckLanding`, `FamilyPage`, `NavigatorPage`, `CheckoutDecision`, `BuildReview`, the four auth pages, `team44/Layout.tsx`, legacy `sampleData.js` FAMILIES (hardcoded prices), legacy `shopifyCartService.js`.

### 1.4 What must NOT be rebuilt

These exist, work, and are tested. Any session proposing to rewrite them is off-roadmap:

1. The configurator engine + 16 configurator JSONs.
2. The SKU→variant resolution chain (`commerceLookupService`, `shopifyVariantResolverService`).
3. The live cart/checkout service chain (`shopifyStorefrontCartCreateService`, `liveShopifyStorefrontCartAdapter`, `shopifyStorefrontCheckoutOutcome`).
4. The pricing domain (`pricingEngine.ts`).
5. The template-driven page system (`VerticalLandingTemplate`, `CategoryTemplate`, `ProductDetailTemplate`) and catalog loaders/services.
6. The ingestion scripts (`shopify-catalog-ingest`, `shopify-variant-gid-overlay`).
7. The adapter-pattern service layer, Zod schemas, and the test suite.
8. The routing/404/not-found system, header/mega-menu/mobile nav.
9. The fleet/procurement/quote domain logic (keep as-is; activate post-launch).

### 1.5 What blocks launch (summary — detail in Section 3)

The blockers are **activation, data freshness, and production posture** — not missing features:
checkout never verified live; variant index stale; prototype banner unconditional; deploy config injects dead base44 vars; no CI + red main; open/mock admin routes; silent quote-lead loss; in-memory cart; no footer/legal pages; product content gaps in Shopify itself (only 60 of 115 products active).

---

## 2. Full Feature Inventory

Statuses: **Production-ready** (ship as-is) · **Partial** (real logic, gap named) · **Prototype** (demo only) · **Missing** · **Post-launch** (real or planned; deliberately out of v1.0).

| Area | Status | Evidence & gap |
|---|---|---|
| UI/UX shell (routing, header, mega-menu, mobile nav) | **Production-ready** | `src/App.jsx`, `SiteHeader.jsx`, `NavigationMegaMenu.jsx`, `MobileNavDrawer.jsx`. Gap: no global footer is wired; `PrototypeFooter` exists unused |
| 404 / product-not-found | **Production-ready** | Catch-all `PageNotFound` (`App.jsx:122`); `NotFound`/`ProductComingSoon` in `ProductDetailTemplate.tsx:151-155` |
| Prototype banner | **Blocker (inverse)** | `PrototypeBanner.jsx` renders "NOT FOR PRODUCTION USE" unconditionally on ~22 pages, incl. production build |
| Homepage / vertical landings (routed templates) | **Production-ready** | `StoreLanding.jsx` + `VerticalLandingTemplate.jsx`, data-driven; old static `PoliceLanding` etc. are dead code |
| Product pages (PDP) | **Partial** | `ProductDetailTemplate.tsx` real + data-driven; 37 product JSONs; gap: content/image completeness per family, variant-selector polish for non-configurator families |
| Configurators | **Production-ready (top 7 families)** / Partial (Navigator accessories) | 16 JSONs + engine; 18 Navigator-family SKUs unresolvable against Shopify export (ingest report) |
| Cart | **Partial** | Real cart workspace UI + money math; adapter is in-memory (`mockCartWorkspaceAdapter`) — no refresh persistence |
| Checkout | **Partial (dormant, production-shaped)** | Live `cartCreate` + hosted-checkout redirect fully coded; never run against the real store; requires 3 env vars incl. undocumented `VITE_SHOPIFY_STOREFRONT_ENABLED` |
| Shopify integration (storefront read) | **Partial** | `liveShopifyStorefrontCatalogAdapter` fetch-capable but opt-in via dev dashboard; app runs on committed JSON snapshot by default (acceptable for v1.0) |
| Shopify integration (back-office sync/webhooks/orders/email) | **Post-launch** | ~12 contract-only foundations with mock adapters; require a backend this repo doesn't have |
| Pricing | **Production-ready (display)** | Variant-index prices + `pricingEngine.ts`; Shopify re-prices at checkout. Dealer/contract tiers: keep out of customer UI |
| Product ingestion | **Production-ready** | `npm run shopify:ingest`, `npm run shopify:gid-overlay`; committed index is stale vs. last report (989 vs 1,839 SKUs) |
| Search | **Production-ready** | `ProductSearchPage` + `useProductSearch`, URL params, filters, recommendations |
| Navigation / category browse | **Production-ready** | `CategoryTemplate`, `NAV_VERTICALS` (3 catalog verticals; 2 nav entries have `path: null`) |
| Compare / saved products / recently viewed | **Production-ready (client-side)** | Contexts + localStorage; no account persistence (fine for v1.0) |
| Customer accounts | **Prototype** | `AuthContext.tsx` all no-ops, hardcoded mock user; auth pages unrouted. v1.0 launches **guest-checkout only** |
| Admin (quotes, sales, sync, pricing import, customers) | **Prototype** | All mock adapters; 4 of 7 routes unguarded; must be flag-gated out of production |
| Quotes (customer request) | **Partial** | UI + services real; delivery adapter is a console stub — leads silently lost |
| Quotes (PDF) | **Post-launch** | Renderer stubbed; jspdf unused |
| Fleet workspace (builds/projects/quotes/standards/upfit) | **Post-launch** | Real domain logic, localStorage only, no backend/auth — deliberately deferred |
| Dealer portal | **Missing (by design)** | Only a spec issue (#100); nothing in code beyond dealer-contract pricing domain |
| Backend/API | **Missing (by design)** | Static SPA (Caddy/Railway). Shopify is the backend for v1.0 |
| CI / testing | **Partial** | 1,141/1,143 tests pass (2 stale UI assertions fail); **no CI at all**; lint/typecheck green (but `strict:false`, `--quiet`) |
| Deployment | **Partial** | Dockerfile + Caddyfile + Railway doc real; **Dockerfile ARGs & Railway doc still inject dead `VITE_BASE44_*` vars** |
| Security | **Partial** | No committed secrets; Admin API token correctly script-only; gaps: unguarded admin routes, no CSP, 16 npm audit vulns (6 high) |
| Legal/policy pages (privacy, terms, shipping, returns) | **Missing** | No routes/content; required for a public commerce site |
| SEO (meta, sitemap, robots, OG) | **Missing** | Nothing beyond `index.html` |
| Analytics | **Missing** | No analytics integration in `src/` |

---

## 3. Business-Aligned Gap Analysis

Goal: **Police + Fire/EMS ecommerce for Federal Signal products, first real online order ASAP.**

### 3.1 Launch blockers (v1.0 cannot go live)

| # | Blocker | Evidence |
|---|---|---|
| B1 | Live checkout never executed/verified against the real store | Creds unset; `VITE_SHOPIFY_STOREFRONT_ENABLED` missing from `.env.example` |
| B2 | Deploy pipeline would configure the wrong env vars | `Dockerfile` ARGs + `RAILWAY_DEPLOYMENT.md` use dead `VITE_BASE44_*` |
| B3 | Committed variant index stale/incomplete | 989 SKUs committed vs 1,839 in `reports/shopify-catalog-ingest/latest.md` (2026-07-06); 18 app-referenced SKUs unmatched (all Navigator family) |
| B4 | "PROTOTYPE — NOT FOR PRODUCTION" banner on ~22 pages, ungated | `PrototypeBanner.jsx` |
| B5 | No CI + 2 failing tests on main | No `.github/`; stale assertions in `homepage-conversion-polish` and `storefront-category-vertical-polish` tests |
| B6 | Admin surface exposed in production build | 4 unguarded `/admin/*` routes + `/dev/storefront`; all admin auth is mock |
| B7 | Quote requests silently discarded | `quoteRequestAdapter.ts` console stub returning fake success |
| B8 | Cart lost on refresh | in-memory `mockCartWorkspaceAdapter` |
| B9 | No footer / legal pages (privacy, terms, shipping, returns, contact) | No footer wired; no legal routes |
| B10 | Shopify store content gaps | Only 60/115 products active; 273 variants missing images (store-side ops + data work) |

### 3.2 Pre-launch required (should ship before public marketing, not before first test order)

- Dead-link cleanup: remove/unroute links to `/login`, `/register`; remove dead pages from bundle (auth pages, `CheckoutDecision`, `BuildReview`, static landings, `sampleData` families) — bundle and confusion risk.
- Order-return experience: a `/checkout/complete`-style landing or at minimum correct post-checkout return URL configuration in Shopify.
- SEO baseline: titles/meta per page, sitemap, robots.txt, OG tags.
- Analytics (GA4 or equivalent) + basic conversion events (add-to-cart, checkout redirect).
- npm audit high-severity fixes; CSP header in Caddyfile.
- `.env.example` and README rewritten for the Shopify era (README is still base44-oriented; `package.json` name is still `base44-app`).

### 3.3 Post-launch (explicitly deferred)

- Customer accounts (Shopify Customer Account API / hosted accounts) — v1.0 is guest checkout; Shopify's checkout collects everything needed.
- Quote PDF generation; quote persistence beyond email.
- Live storefront catalog reads (replace committed snapshot with runtime Storefront queries).
- Fleet Workspace productization (persistence, accounts, sharing), Department Standards, Procurement Packages, Upfit Builder as marketed features.
- Dealer Portal; dealer/contract pricing exposure.
- Any backend: webhooks, order sync, inventory sync, email service, job queue (the ~12 foundation docs).
- Work Truck vertical marketing push (data exists; keep browsable but don't gate launch on it).

### 3.4 Nice-to-have (only if idle capacity)

- Code-splitting the 1.95 MB bundle; removing `logLevel:'error'` from `vite.config.js`.
- TypeScript `strict: true` migration; `typescript-eslint`.
- Component showcase cleanup.

### 3.5 Do NOT do yet (explicit anti-scope)

- Do not build a backend/API service.
- Do not implement real customer auth before first revenue.
- Do not wire live Storefront catalog reads (snapshot is fine and faster).
- Do not build dealer portal, fleet persistence, or Configuration Commerce Platform package extraction (`CONFIGURATION_COMMERCE_ARCHITECTURE.md` is explicitly launch-gated).
- Do not migrate JS→TS wholesale, do not enable `strict`, do not restructure folders.
- Do not touch the ~12 Shopify sync/webhook/email foundations.

---

## 4. Product Launch Scope — Version 1.0 defined

**v1.0 = A public, guest-checkout Shopify storefront at TFRSupply.com for Police and Fire/EMS Federal Signal equipment, where every displayed product either (a) adds to cart and checks out on Shopify, or (b) clearly offers "Request a Quote" that actually reaches TFRSupply.**

- **Verticals at launch:** Police (`/police`), Fire/EMS (`/fire`). Work Truck (`/work-truck`) remains browsable but is not a launch gate.
- **Checkout:** Shopify hosted checkout, guest only. No customer accounts. No Stripe (remove dead deps).
- **Quotes:** email-based delivery (working), no PDF.
- **Admin:** hidden from production build entirely.

### Product family treatment

**Keep & polish — existing configurators (launch flagship, 7 families):**
Valor, Integrity, Allegiant Max, Vision SLR (light bar), Vision SLR (beacon), Navigator (serial/discrete), Reliant S2.
Plus secondary configurators already built: SignalMaster/Latitude/MicroPulse SignalMaster, MicroPulse Ultra, SpectraLux ILS, FireRay — keep, verify SKU resolution, no new build.

**Simple PDP / variant selector only (no configurator needed):**
FireRay/perimeter lights, Highlighter (Elite/Micro), COM scene lights, Commander interior/compartment lights (COMFLEX/COMINT/COMSTL), DynaFlare, LED TCL, QuadraFlare (QL), speakers & sirens (ES100C, PF400/PF200 PathFinder, PA300, MS4000, Q2B/Q-siren), push bumpers (DuraForce/DFC — vehicle-specific variants), Rumbler kits, MicroPulse (MPS/MPSM/MPSW) singles, Littlite, cables/brackets/mounts (OBD, WPCABLE, HKB hook kits, XSM brackets).

**Needs configurator (defer — do not build for v1.0):**
None beyond what exists. The knowledge docs' "component builder" concepts (full vehicle upfit packages) are post-launch.

**Needs component builder (post-launch):**
Guided Upfit Builder / package builder productization — the logic exists client-side; productize after revenue.

**Defer entirely:**
Navigator Linear Mini (NVLM*) and the 18 unmatched Navigator accessory SKUs **unless** PR-08 resolves them against the store; SpectraLux ILS if `SPXILS` verification fails (Master SKU doc flags it); draft-status Shopify products until activated by ops.

---

## 5. Dependency-Aware Roadmap

**Objective O1: First real online order** (the most important milestone)
**Objective O2: Public v1.0 launch — Police + Fire/EMS**
**Objective O3: Post-revenue platform growth** (accounts, fleet, dealer)

```
O1 First real online order
├─ M0 Repo Truth & Safety (Epic E0)
│   ├─ F0.1 CI gate ............................ PR-02
│   ├─ F0.2 Green main ......................... PR-03
│   ├─ F0.3 Env/deploy truth ................... PR-04, PR-05
│   └─ F0.4 Admin lockdown ..................... PR-06
└─ M1 Verified live checkout (Epic E1)
    ├─ F1.1 Fresh catalog data ................. PR-07, PR-08
    ├─ F1.2 Cart persistence ................... PR-09
    ├─ F1.3 Staging deploy + live order test ... PR-10, PR-11
    └─ F1.4 Quote lead capture works ........... PR-12

O2 Public v1.0 launch
├─ M2 Launch-ready storefront (Epic E2)
│   ├─ F2.1 Prototype posture removed .......... PR-13, PR-14
│   ├─ F2.2 Footer + legal ..................... PR-15, PR-16
│   ├─ F2.3 Dead-code & dead-link removal ...... PR-17, PR-18
│   └─ F2.4 PDP/catalog completeness ........... PR-19..PR-24
└─ M3 Launch hardening (Epic E3)
    ├─ F3.1 SEO + analytics .................... PR-25, PR-26, PR-27
    ├─ F3.2 Security hardening ................. PR-28, PR-29
    ├─ F3.3 Post-checkout return + launch QA ... PR-30, PR-31
    └─ F3.4 Launch checklist & go-live ......... PR-32

O3 Post-revenue (Epic E4+) — M4 accounts, M5 quotes v2, M6 fleet, M7 dealer
    └─ PR-33..PR-38 (specs first, then builds)
```

Every Epic/Feature is expanded as concrete PRs in Section 6, each carrying business value, dependencies, acceptance criteria, verification, effort (S ≤ ½ day, M ≈ 1 day, L ≈ 2–3 days of agent time), risk, and launch-blocking status. Milestone gates:

| Milestone | Exit criterion (verifiable) | Blocks launch |
|---|---|---|
| M0 | CI green on main; deploy docs/Dockerfile reference only real env vars; no admin surface in prod build | Yes |
| M1 | **A real test order placed and paid on the live/staging Shopify store via the site** | Yes |
| M2 | Every police+fire category page shows only purchasable-or-quotable products; no prototype banners; footer+legal live | Yes |
| M3 | Lighthouse ≥ 85 perf/SEO on PDP; analytics events verified; security checklist closed | Yes (go-live gate) |
| M4+ | per-epic | No |

---

## 6. PR-by-PR Execution Plan

Rules (binding): one issue → one branch → one PR; no mixed concerns; no refactor-only PRs unless they reduce launch risk (PR-17/18 qualify: dead code removal eliminates 404 links and bundle weight); never rebuild Section 1.4 items; every PR runs `npm run lint && npm run typecheck && npm test && npm run build` before merge and states results in the PR body.

> **PR-01 is this document** (`docs(program): add master execution roadmap for TFRSupply launch`).

### Phase 0 — Repo Truth & Safety (M0)

**PR-02 `ci: add GitHub Actions quality gate`**
- **Goal:** Nothing merges broken again; protects every later PR. *(M0, blocks launch)*
- **Scope:** `.github/workflows/ci.yml` running install + `lint` + `typecheck` + `test` + `build` on PR and push to main. Node 22.
- **Out of scope:** Deployment automation, coverage tooling, branch-protection settings (founder does that in GitHub UI).
- **Files:** `.github/workflows/ci.yml`.
- **Acceptance:** CI runs on a PR; all four commands execute; failures block. Known caveat: tests are red until PR-03 — land PR-03 immediately after (or same day).
- **Verify:** open a trivial PR, observe checks. **Evidence:** green check screenshot/link.
- **Effort:** S. **Risk:** low.

**PR-03 `test: fix stale UI assertions so main is green`**
- **Goal:** Trustworthy test signal. *(M0, blocks launch)*
- **Scope:** Update the two stale assertions to match current markup: `tests/homepage-conversion-polish.test.mjs:172` (grid classes) and `tests/storefront-category-vertical-polish.test.mjs:137` (product count string). Fix the tests, not the UI, unless the UI is actually wrong.
- **Out of scope:** any other test changes.
- **Files:** the two test files.
- **Acceptance:** `npm test` → 1,143/1,143 pass.
- **Verify:** `npm test`. **Evidence:** pass count in PR body.
- **Effort:** S. **Risk:** low.

**PR-04 `fix(deploy): reconcile Dockerfile and Railway docs to VITE_SHOPIFY_* env vars`**
- **Goal:** A deploy that follows the docs can actually enable Shopify checkout. *(M0, blocks launch — B2)*
- **Scope:** Replace `VITE_BASE44_*` build ARGs/ENVs in `Dockerfile` with `VITE_SHOPIFY_STORE_DOMAIN`, `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `VITE_SHOPIFY_STOREFRONT_API_VERSION`, `VITE_SHOPIFY_STOREFRONT_ENABLED`; rewrite env sections of `docs/deployment/RAILWAY_DEPLOYMENT.md`; add `VITE_SHOPIFY_STOREFRONT_ENABLED=` to `.env.example`.
- **Out of scope:** Caddyfile changes, CSP (PR-29).
- **Files:** `Dockerfile`, `docs/deployment/RAILWAY_DEPLOYMENT.md`, `.env.example`.
- **Acceptance:** `grep -r BASE44 Dockerfile docs/deployment` returns nothing; `docker build` succeeds with the new ARGs.
- **Verify:** `docker build --build-arg VITE_SHOPIFY_STORE_DOMAIN=x ... .` locally/CI. **Evidence:** build log excerpt.
- **Effort:** S. **Risk:** low.

**PR-05 `chore: remove stray archives and vestigial base44 artifacts`**
- **Goal:** Repo hygiene; kill confusion for agents and humans. *(M0)*
- **Scope:** Delete `TFRSupply_Knowledge_Package (1).zip`, `agent-skills-main (1).zip`, `tfrs-ai-os-layer-files.zip`, `base44/` dir; gitignore `reports/` (keep last committed report until PR-07 replaces the workflow note); rename `package.json` `name` to `tfrsupply-frontend`; remove unused `@stripe/*` deps.
- **Out of scope:** removing `src/adapters/base44/*` stubs (still imported — handled by PR-12), README rewrite (PR-14), dead pages (PR-17).
- **Files:** root zips, `base44/`, `.gitignore`, `package.json`, `package-lock.json`.
- **Acceptance:** build+tests still green; `npm ls @stripe/stripe-js` → empty.
- **Verify:** full local gate. **Evidence:** file list in PR diff.
- **Effort:** S. **Risk:** low.

**PR-06 `fix(admin): guard all admin routes and gate the admin surface behind a build flag`**
- **Goal:** No mock-auth admin/dev pages reachable in production. *(M0, blocks launch — B6)*
- **Scope:** Wrap `/admin/debug`, `/admin/quotes`, `/admin/customers`, `/admin/pricing-imports` in `AdminAuthGuard`; introduce `VITE_ADMIN_ENABLED` (default false) that removes registration of all `/admin/*`, `/dev/storefront`, `/showcase` routes when unset (unregistered paths fall through to the existing 404).
- **Out of scope:** real admin authentication (post-launch), removing admin code.
- **Files:** `src/App.jsx`, `src/components/AdminAuthGuard.jsx` (if needed), `.env.example`, tests.
- **Acceptance:** with flag unset, direct navigation to every admin/dev/showcase path renders 404; with flag true, prior behavior; test added for both modes.
- **Verify:** `npm test`; `npm run build && npm run preview` and manually hit `/admin/debug`. **Evidence:** test names + screenshot of 404.
- **Effort:** M. **Risk:** low-medium (route regressions; mitigated by tests).

### Phase 1 — First Real Online Order (M1)

**PR-07 `feat(data): regenerate and commit the full Shopify variant index`**
- **Goal:** Every purchasable SKU resolves to a real variant GID — the launch catalog's backbone. *(M1, blocks launch — B3)*
- **Scope:** Run `npm run shopify:ingest` against the current export (re-export from Shopify first if founder can provide a fresh CSV); commit updated `src/data/shopify/shopify-variant-index.json` (~1,839 SKUs) and the report; document the refresh procedure in `data/shopify-exports/README.md`.
- **Out of scope:** fixing unmatched SKUs (PR-08), activating draft products (ops task, tracked in PR-19).
- **Files:** `src/data/shopify/shopify-variant-index.json`, `reports/`, `data/shopify-exports/README.md`.
- **Acceptance:** index SKU count matches report; report shows 0 variants pending GID; app tests pass; spot-check 5 SKUs across families resolve via `commerceLookupService`.
- **Verify:** `npm run shopify:ingest && npm test`. **Evidence:** report summary table in PR body.
- **Effort:** S (M if fresh export needed). **Risk:** medium (data volume; duplicate-SKU canonicalization already handled by script).

**PR-08 `fix(data): resolve or retire the 18 unmatched Navigator-family SKUs`**
- **Goal:** No configurator can emit an unpurchasable SKU silently. *(M1, blocks launch for Navigator family only)*
- **Scope:** For each SKU in the ingest report's unmatched list (NAV-BRKT-*, NAV-CABLE-*, NVLM*, NVG-BRKT, NVG-HARNESS-D, NVLM-*): either correct the SKU in configurator/product JSON to the store's real SKU, or remove/flag the option as quote-only. Decision input needed from founder on whether Navigator Linear Mini is stocked (see Section 10).
- **Out of scope:** other families; engine changes.
- **Files:** `src/data/configurators/navigator*.json`, `src/data/products/navigator*.json`, possibly `src/data/configurators/spectralux-ils-configurator.json` (verify `SPXILS` — flagged in Master SKU doc).
- **Acceptance:** re-run ingest report → "App-referenced SKUs not found" = 0; configurator tests pass.
- **Verify:** `npm run shopify:ingest`, `npm test`. **Evidence:** report delta.
- **Effort:** M. **Risk:** medium (needs product-truth answers; stop-and-ask rule applies).

**PR-09 `feat(cart): persist cart workspace to localStorage`**
- **Goal:** Cart survives refresh/navigation — table stakes for real orders. *(M1, blocks launch — B8)*
- **Scope:** Add a `localStorageCartWorkspaceAdapter` implementing the existing adapter contract (mirror how other adapters do mock/live selection); hydrate on load, write-through on mutation; versioned storage key.
- **Out of scope:** server-side carts, Shopify cart persistence (checkout still creates the Shopify cart at handoff), multi-device sync.
- **Files:** `src/adapters/cartWorkspace/`, `src/services/cartWorkspace/cartWorkspaceService.ts` wiring, tests.
- **Acceptance:** add line → reload → line present; clear works; corrupt storage falls back cleanly to empty cart; existing cart tests pass plus new adapter tests.
- **Verify:** `npm test`; manual reload check in preview. **Evidence:** test list + short screen recording/screenshots.
- **Effort:** M. **Risk:** low.

**PR-10 `docs(ops): staging environment + live checkout activation runbook`**
- **Goal:** A written, repeatable path to flip checkout live — removes the biggest unknown. *(M1, blocks launch — B1)*
- **Scope:** Runbook in `docs/deployment/CHECKOUT_ACTIVATION.md`: create Storefront API token (scopes), set the four VITE vars on Railway staging, deploy, smoke-test script (below), Shopify-side checklist (payment provider test mode, shipping zones, tax settings, checkout branding, post-purchase return URL).
- **Out of scope:** code changes.
- **Files:** `docs/deployment/CHECKOUT_ACTIVATION.md`.
- **Acceptance:** a person/agent with Railway+Shopify access can follow it start-to-finish without guessing; every step has an exact command/click path and a verification.
- **Verify:** doc review; steps cross-checked against `shopifyStorefrontConfigService.ts` requirements. **Evidence:** doc in diff.
- **Effort:** S. **Risk:** low.

**PR-11 `test(commerce): end-to-end checkout smoke verification` — THE MILESTONE PR**
- **Goal:** **First real order.** Prove configurator → cart → `cartCreate` → hosted checkout → paid test order works on the real store. *(M1, blocks launch)*
- **Scope:** Execute PR-10's runbook on staging with real creds (founder supplies via Railway env, never committed). Add a small automated smoke script (`scripts/checkout-smoke/`) that runs `cartCreate` with one known GID against the configured store and asserts a `checkoutUrl` is returned (env-gated; skipped in CI without creds). Fix whatever the live run surfaces (error-mapping gaps, GID mismatches) in follow-up scoped commits on this branch only if trivially small; otherwise file issues.
- **Out of scope:** any UI change beyond bugfixes surfaced by the live path.
- **Files:** `scripts/checkout-smoke/*`, possibly small fixes in `src/services/shopifyStorefrontCart/` or data.
- **Acceptance:** (1) smoke script returns a live `checkoutUrl`; (2) a human completes a test-mode purchase end-to-end from a configurator PDP; (3) order visible in Shopify admin.
- **Verify:** `node scripts/checkout-smoke/run.mjs` with staging env; manual purchase. **Evidence:** Shopify order screenshot (test mode), checkoutUrl (redacted domain) in PR body.
- **Effort:** M–L. **Risk:** high (first live integration; unknown unknowns) — which is exactly why it's sequenced this early.

**PR-12 `feat(quote): real quote-request delivery`**
- **Goal:** Stop silently losing quote leads — quotes are the revenue channel for non-checkout SKUs. *(M1, blocks launch — B7)*
- **Scope:** Replace `src/adapters/base44/quoteRequestAdapter.ts` with a working delivery adapter. v1 mechanism (pick simplest reliable, no backend): a hosted form endpoint (Formspree/Basin/Shopify contact form) **or** structured `mailto:` fallback matching ComparePage's working pattern, to `appConfig.quoteRecipientEmail`. Show honest success/failure to the user; remove `savedRecord: false` fake success. Delete the now-unused base44 adapter dir.
- **Out of scope:** quote persistence, admin quote queue integration, PDF.
- **Files:** `src/adapters/base44/` (remove), new `src/adapters/quoteDelivery/`, `src/services/quoteRequestService.js` wiring, tests.
- **Acceptance:** submitting a quote from PDP/cart reaches the configured destination (verified once manually); failure shows an error with the phone number fallback; tests cover adapter outcome mapping.
- **Verify:** `npm test`; one manual submission. **Evidence:** received email/form entry screenshot.
- **Effort:** M. **Risk:** low-medium (external service choice — ask founder which; default = form service free tier).

### Phase 2 — Launch-Ready Storefront (M2)

**PR-13 `feat(ui): environment-gate the prototype banner`**
- **Goal:** Production build stops declaring itself unfit for production. *(M2, blocks launch — B4)*
- **Scope:** Gate `PrototypeBanner` on `!import.meta.env.PROD` or a `VITE_SHOW_PROTOTYPE_BANNER` flag (default: hidden in prod). Keep it in dev.
- **Files:** `src/components/PrototypeBanner.jsx`, test.
- **Acceptance:** prod build renders no banner on `/`, `/police`, `/cart`; dev shows it; test asserts both.
- **Verify:** `npm run build && npm run preview`; `npm test`. **Evidence:** before/after screenshots.
- **Effort:** S. **Risk:** low.

**PR-14 `docs: rewrite README for the Shopify-era storefront`**
- **Goal:** First file anyone (or any agent) reads tells the truth. *(M2)*
- **Scope:** Replace base44 README with: what the app is, stack, env vars, scripts, data-refresh procedure, link to this program doc and `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md`. Also fix the stale base44 rows in `docs/ai/REPOSITORY_INDEX.md` and add a "frontend-only: requires backend, post-launch" banner note to the ~12 sync/webhook/email architecture docs' index entries.
- **Files:** `README.md`, `docs/ai/REPOSITORY_INDEX.md`.
- **Acceptance:** `grep -ri base44 README.md` → 0; index accurately labels aspirational docs.
- **Effort:** S. **Risk:** low.

**PR-15 `feat(ui): global site footer`**
- **Goal:** Navigation trust + legal-page host; commerce sites without footers look fake. *(M2, blocks launch — B9)*
- **Scope:** One footer component (contact info from `appConfig`, vertical links, resources, legal links to PR-16 routes, phone `800-621-9959`) rendered in the storefront layout on all customer pages. Reuse `PrototypeFooter`'s structure if useful, renamed.
- **Out of scope:** newsletter signup, social integrations.
- **Files:** `src/components/navigation/SiteFooter.jsx` (new), layout wiring, test.
- **Acceptance:** footer on `/`, vertical, category, PDP, `/cart`, `/search`; responsive; links resolve (no `#`).
- **Verify:** `npm test`; preview screenshots desktop+mobile. **Evidence:** screenshots.
- **Effort:** M. **Risk:** low.

**PR-16 `feat(content): legal and policy pages`**
- **Goal:** Commerce launch requirements (and Shopify payment-provider expectations). *(M2, blocks launch — B9)*
- **Scope:** Static routed pages: Privacy Policy, Terms of Service, Shipping Policy, Returns/Refunds, Contact. Simple template component + markdown/JSON content; founder supplies/approves copy (Shopify policy generator acceptable as draft).
- **Files:** `src/pages/PolicyPage.jsx` (one template), `src/data/policies/*.md|json`, `src/App.jsx` routes, footer links.
- **Acceptance:** `/privacy`, `/terms`, `/shipping`, `/returns`, `/contact` render; linked from footer; 404 for unknown policy slugs.
- **Verify:** `npm test` + route smoke test. **Evidence:** screenshots.
- **Effort:** M. **Risk:** low (content approval is the only dependency).

**PR-17 `chore: remove dead pages and dead links (auth, legacy landings, legacy checkout)`**
- **Goal:** Reduce launch risk: no reachable dead ends, smaller bundle, no agent confusion. (Refactor-only but risk-reducing — allowed.) *(M2)*
- **Scope:** Delete unrouted `Login/Register/ForgotPassword/ResetPassword.tsx`, `PoliceLanding/FireEMSLanding/WorkTruckLanding.jsx`, `FamilyPage.jsx`, `NavigatorPage.jsx`, `CheckoutDecision.jsx`, `BuildReview.jsx`, `team44/`, legacy `shopifyCartService.js` + `shopify/shopifyCartAdapter.js`, and any UI links pointing at `/login`/`/register`. Keep `sampleData.js` only if still imported (AdminDebugSummary uses it — keep, admin is flag-gated).
- **Out of scope:** anything imported by live routes; contexts; AuthContext itself (still wraps the app — leave the stub provider, it's harmless and load-bearing).
- **Acceptance:** grep shows no imports of deleted files; no `to="/login"`/`/register` links; full gate green; bundle size reduced (report numbers).
- **Verify:** `npm run lint && npm run typecheck && npm test && npm run build`. **Evidence:** bundle size before/after.
- **Effort:** M. **Risk:** medium (accidental removal of something referenced — mitigated by typecheck/tests/CI).

**PR-18 `fix(nav): complete or remove null-path nav verticals and placeholder links`**
- **Goal:** Every visible nav element goes somewhere real. *(M2)*
- **Scope:** In `src/config/navigationVerticals.js`, remove or complete the two `path: null` entries; audit header/mega-menu/landing links for `#` placeholders; ResourcesPage placeholder links either fixed or the cards removed.
- **Acceptance:** no `href="#"`/`to="#"` in rendered storefront nav; nav test updated.
- **Effort:** S. **Risk:** low.

**PR-19 `docs(ops): Shopify store activation checklist (60→launch product set)`**
- **Goal:** Close the store-side content gap deliberately, not accidentally. *(M2, blocks launch — B10; ops doc, founder executes in Shopify admin)*
- **Scope:** Doc enumerating: which of the 55 draft products must be active for launch families (Section 4 list), image gaps (273 variants missing images — list by family priority), pricing sanity checks. Derived from `reports/shopify-catalog-ingest/latest.md`.
- **Acceptance:** checklist covers every launch family; each item has an owner (founder/ops) and a "verify by re-running ingest" step.
- **Effort:** S. **Risk:** low.

**PR-20 `feat(pdp): variant selector polish for non-configurator families`**
- **Goal:** Accessory families (the long tail: QL, FR, HL, COM, DFC, cables/brackets) sell through clean PDPs. *(M2, blocks launch)*
- **Scope:** Verify/polish `ProductDetailTemplate` variant selection for products whose JSON has plain variants (no configurator): option labels, price updates on selection, add-to-cart uses the selected variant's GID, out-of-resolution variants show quote-only state.
- **Out of scope:** new configurators; design overhaul.
- **Files:** `src/pages/ProductDetailTemplate.tsx`, `src/components/product/*`, tests.
- **Acceptance:** for 5 representative accessory products (one per major family), selecting each variant updates price and add-to-cart works into the cart workspace with the correct GID; tests cover selector behavior.
- **Verify:** `npm test` + manual pass on preview. **Evidence:** screenshots + test names.
- **Effort:** L. **Risk:** medium.

**PR-21 `fix(catalog): police vertical category completeness pass`**
- **Goal:** Police browse path is complete and truthful. *(M2, blocks launch)*
- **Scope:** Audit `/police` categories against launch families: every category JSON lists correct products; every card resolves (no unintended `ProductComingSoon`); hero/category images present; stub cards intentionally marked coming-soon only where deliberate.
- **Files:** `src/data/verticals/police.json`, `src/data/categories/*.json`, `src/data/products/*.json`.
- **Acceptance:** scripted check (small node script or test) that every product referenced by police categories loads and has ≥1 resolvable SKU or an explicit quote-only/coming-soon flag; zero broken images in manual pass.
- **Effort:** M. **Risk:** low-medium (data truth questions → ask founder).

**PR-22 `fix(catalog): fire/EMS vertical category completeness pass`**
- Same shape as PR-21 for `/fire` (NFPA-spec families: Allegiant, Vision SLR, Navigator, Q-sirens, COM lights, FireRay). *(M2, blocks launch)* **Effort:** M.

**PR-23 `feat(search): index freshness + zero-result and quote-only handling`**
- **Goal:** Search never dead-ends a buyer. *(M2)*
- **Scope:** Verify search covers the full post-PR-07 catalog; zero-result state offers vertical links + quote CTA; quote-only products labeled in results.
- **Acceptance:** searches for 10 known SKUs/product names return correct products; zero-result state renders CTA; tests added.
- **Effort:** S–M. **Risk:** low.

**PR-24 `feat(config): configurator SKU-resolution regression suite`**
- **Goal:** Guarantee every configurator selection path ends purchasable-or-quotable — forever. *(M2, blocks launch)*
- **Scope:** Test that walks every configurator JSON, enumerates reachable SKU outputs, asserts each resolves in the variant index (or is explicitly quote-only). This is the guardrail that makes future catalog refreshes safe.
- **Files:** `tests/configurator-sku-resolution.test.mjs`.
- **Acceptance:** test passes post-PR-07/08; deliberately breaking one SKU makes it fail with a readable message naming configurator + SKU.
- **Effort:** M. **Risk:** low. **Value:** highest test ROI in the plan.

### Phase 3 — Launch Hardening (M3)

**PR-25 `feat(seo): per-page titles, meta descriptions, canonical + OG tags`**
- **Scope:** Lightweight head management (no new heavy dep; `react-helmet-async` or manual `document.title` effect hook) for home, verticals, categories, PDPs (from product JSON), policies. *(M3, blocks public launch)*
- **Acceptance:** `view-source` of built pages shows correct title/meta per route; Lighthouse SEO ≥ 90 on PDP.
- **Effort:** M. **Risk:** low. *(Note: SPA prerendering/SSR is explicitly out of scope for v1.0 — accept CSR SEO limits, revisit post-launch.)*

**PR-26 `feat(seo): sitemap.xml + robots.txt generation`**
- **Scope:** Build-time script generating sitemap from verticals/categories/products JSON into `dist/`; robots.txt; wire into build. **Acceptance:** `dist/sitemap.xml` lists all catalog URLs; robots allows crawl, references sitemap. **Effort:** S. **Risk:** low.

**PR-27 `feat(analytics): GA4 (or founder's choice) + conversion events`**
- **Scope:** Page views, add_to_cart, begin_checkout (fired at checkout redirect), quote_request. Env-gated (`VITE_ANALYTICS_ID`), off in dev. *(M3, blocks public launch — you cannot run a store blind)*
- **Acceptance:** events visible in analytics debug view from staging; no analytics calls when env unset; test for the event-dispatch wrapper.
- **Effort:** M. **Risk:** low.

**PR-28 `chore(security): npm audit remediation (high severity)`**
- **Scope:** Resolve the 6 high findings (incl. DOMPurify GHSA-v2wj-7wpq-c8vv via transitive deps, picomatch ReDoS); document any accepted risks. **Acceptance:** `npm audit` shows 0 high; full gate green. **Effort:** S–M. **Risk:** medium (transitive bumps can break — CI protects).

**PR-29 `feat(security): CSP and security headers in Caddyfile`**
- **Scope:** Content-Security-Policy (allow self + Shopify domains + analytics), HSTS, X-Frame-Options; document tested header set in deployment doc. **Acceptance:** headers present on staging responses (`curl -I`); site fully functional under CSP (checkout redirect, images, analytics). **Effort:** M. **Risk:** medium (CSP breakage — test on staging first).

**PR-30 `feat(checkout): post-purchase return experience`**
- **Scope:** Configure Shopify checkout's post-purchase behavior + add `/order-confirmed` landing (thanks, support contact, continue shopping) for the return link; document the Shopify-side setting in the activation runbook. *(M3, blocks launch)*
- **Acceptance:** completing a test order returns the shopper to the branded page; route tested.
- **Effort:** S. **Risk:** low.

**PR-31 `test(launch): pre-launch QA checklist execution + bug-fix batch`**
- **Scope:** Execute a written QA pass (created in this PR as `docs/project-management/LAUNCH_QA_CHECKLIST.md`): all routes, mobile/desktop, all launch-family PDPs, configurator happy paths, cart persistence, checkout smoke, quote delivery, 404s, footer links, Lighthouse run. Fix only small bugs in-branch; file issues for anything bigger. *(M3, blocks launch)*
- **Acceptance:** checklist committed with every item checked and evidence linked.
- **Effort:** L. **Risk:** medium.

**PR-32 `docs(launch): go-live runbook + production cutover`**
- **Scope:** Production Railway env setup, domain (TFRSupply.com DNS), Shopify payment provider to live mode, final smoke order (real card, refunded), rollback procedure, monitoring/alerting minimal setup (uptime ping). Execute with founder. *(M3 — this is launch)*
- **Acceptance:** TFRSupply.com serves production build; one real order placed and refunded; rollback documented.
- **Effort:** M. **Risk:** high (go-live). **Evidence:** live URL + order + refund records.

### Phase 4 — Post-launch (M4+, ordered, do not start before M3 exits)

**PR-33 `spec: customer accounts via Shopify` — evaluate Shopify hosted customer accounts vs Customer Account API; decide; spec routes/UX. (M4, L, no-block)
**PR-34 `feat(accounts): implement chosen account integration`** — re-route rebuilt auth entry points to Shopify-hosted flows; order history via Shopify. (M4, L)
**PR-35 `feat(quote): quote PDF rendering`** — implement the stubbed `quotePdfRenderer` with jspdf; attach to quote email. (M5, M)
**PR-36 `feat(quote): admin quote queue on real storage`** — replace localStorage/mock quote persistence with a lightweight backing (Shopify metaobjects or a minimal worker) — first genuine backend decision, spec first. (M5, L)
**PR-37 `spec: Fleet Workspace productization`** — accounts-backed persistence for fleet builds/projects; sharing; pricing tiers. (M6, L)
**PR-38 `spec: Dealer Portal`** — dealer auth, contract pricing exposure, dealer catalogs; builds on `dealerContractResolution` domain. (M7, L)

---

## 7. Agent Operating Rules

**Read first, every session (in order):**
1. This document (`docs/MASTER_EXECUTION_PROGRAM.md`) — pick the next unmerged PR from Section 6.
2. `docs/ai/AI_DEVELOPMENT_PLAYBOOK.md` + `docs/ai/ARCHITECTURE_PRINCIPLES.md` (dependency direction, adapter rules).
3. `docs/project-management/05_definition_of_done.md`.
4. The architecture doc for the area being touched (see `docs/ai/REPOSITORY_INDEX.md`).

**Workflow phases** (the repo has no `/spec /plan /build` slash commands — these are work modes; use the prompt templates in `docs/ai/PROMPT_TEMPLATE.md`):
- **Spec** — only for PR-33/36/37/38 and any work not already specified in Section 6. Output: a doc, no code.
- **Plan** — before any PR touching >5 files: list files + test plan in the PR description first.
- **Build** — implement exactly the PR's scope. One issue → one branch → one PR.
- **Test** — `npm run lint && npm run typecheck && npm test && npm run build` locally before push; add tests named in acceptance criteria.
- **Review** — self-review the diff against "Out of scope" before requesting review; PR body must contain: summary, gate results, evidence per acceptance criteria, risk, rollback.

**Stop and ask the founder when:**
- Product truth is unknown (is a SKU stocked? which products go active? policy copy) — never invent SKUs, prices, or policies.
- Credentials/external services are needed (Shopify tokens, Railway, analytics, form service).
- A PR's real scope grows past its "Out of scope" line.
- Live-mode behavior differs from what this document predicts.

**Never refactor when:**
- The code is in the Section 1.4 do-not-rebuild list.
- The change is style/structure-only with no launch-risk reduction.
- It would mix with a feature PR (split or drop it).
- It touches the ~12 backend-foundation service families (frozen until post-launch).

**Roadmap maintenance (mandatory, same PR):** after completing a PR, edit this file — mark the PR `✅ merged (#nnn)` in Section 6, update Section 3 blocker table if a blocker closed, and add any newly discovered work as a new PR entry at the correct phase position (never inline-expand an existing PR's scope).

**Definition of Done** = `docs/project-management/05_definition_of_done.md` **plus**: CI green, evidence for every acceptance criterion in the PR body, this roadmap updated, no scope beyond the PR entry.

---

## 8. GitHub Project Recommendations

**Current state:** 113 open issues — mostly a June-30 batch of `[SPEC]/[BUILD]/[QA]` process/meta issues (Release Management, Product Office, Repository Constitution, etc.) plus platform aspirations (Dealer Accounts, Analytics Platform). Zero open PRs. This backlog is noise relative to launch and is part of why sessions go in circles.

**Actions:**
- **Close (as "not planned", with a comment pointing here): the process/meta batch** — roughly #88–#115 (Repository Constitution, Product Office, Release Planning, Backlog Grooming, Release Management, Rollback/Validation QA, Staging/Railway process specs) and the platform-spec batch (#97–#106: Vehicle Selector/Quote Engine/Saved Builds/Dealer Accounts/Search/Cart/Analytics Platform specs). Their useful content is superseded by this program; deployment specifics fold into PR-04/10/32.
- **Keep open:** #107 (Vision — north star; matches this program), #131 (Complete Catalog Migration → relabel to M1, satisfied by PR-07/08), #129 (GitHub Project OS → close after this section is applied).
- **Create:** one issue per PR in Section 6 (PR-02…PR-32 now; Phase 4 when M3 closes), titled exactly as the PR titles, each linking to its Section 6 entry.
- **Milestones:** `M0 Repo Truth & Safety`, `M1 First Real Order`, `M2 Launch-Ready Storefront`, `M3 Public Launch v1.0`, `M4+ Post-Launch`. Assign every issue.
- **Labels** (prune the 26 in `03_labels.md` to what's used): `launch-blocker`, `data`, `commerce`, `configurator`, `ui`, `infra`, `docs`, `ops-shopify` (founder action in Shopify admin), `post-launch`, `needs-founder-input`, plus risk labels. Drop `ready-for-codex`-style agent labels.
- **Board columns:** Backlog → Ready (spec'd, unblocked) → In Progress (limit 1–2) → In Review → Verified/Merged → Done. WIP limit is the circle-breaker: **one launch-critical PR in progress at a time.**
- **Issue templates:** add `.github/ISSUE_TEMPLATE/` with a single "Roadmap PR" template (Goal / Scope / Out of scope / Acceptance / Verification / Milestone) adapted from `02_issue_templates.md` — do this inside PR-02's follow-up or fold into PR-14.
- **Archive:** nothing needs repo archiving; the zips/`base44/` removal is PR-05.

---

## 9. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Live checkout has unknown unknowns** (token scopes, market/currency settings, checkout config) | High | Launch delay | PR-10 runbook + PR-11 sequenced earliest possible; staging first; smoke script kept forever |
| R2 | **Catalog data drift** — store changes, committed index goes stale, configurators emit dead SKUs | High | Silent lost sales | PR-24 regression suite; documented refresh procedure (PR-07); re-run ingest before every deploy |
| R3 | Shopify store content not launch-ready (55 drafts, 273 missing images) — an ops problem code can't fix | High | Thin-looking store | PR-19 checklist; founder owns; launch scope limits to ready families |
| R4 | 18 unmatched Navigator SKUs signal deeper SKU-truth issues in other families | Medium | Configurator dead-ends | PR-24 enumerates every reachable SKU — converts unknown risk to a test failure list |
| R5 | No CI + red main lets regressions in during the push to launch | High (now) | Compounding breakage | PR-02/03 first; branch protection (founder, GitHub UI) |
| R6 | Mock admin/auth pages reachable in prod → trust/security optics | Medium | Reputation | PR-06 flag-gates entire admin surface |
| R7 | Quote leads silently lost (today's state) | Certain | Direct revenue loss | PR-12; until merged, treat quote flows as broken |
| R8 | SPA-only SEO limits organic discovery | Medium | Slow ramp | PR-25/26 baseline; accept CSR for v1.0; prerender/SSR is a post-launch decision |
| R9 | Single 1.95 MB bundle hurts mobile conversion | Medium | Conversion drag | Post-launch code-splitting (3.4); don't block launch on it |
| R10 | Dealer-cost/contract pricing data shipped client-side could leak B2B pricing | Medium | Partner trust | Keep dealer pricing out of customer UI at v1.0; audit in PR-31; real fix arrives with dealer portal backend |
| R11 | **Agent workflow risk: scope creep / rebuilding existing systems** (the historical credit-burner) | High | Wasted spend, churn | Section 7 rules; Section 1.4 do-not-rebuild list; one-PR WIP limit; roadmap updated every merge |
| R12 | Doc/code divergence recurring (base44 pattern) | Medium | Misled sessions | PR-14 truth pass; DoD requires doc updates in-PR |
| R13 | npm supply chain (16 vulns, 6 high) | Medium | Security exposure | PR-28; CI `npm audit` step (non-blocking report) |
| R14 | Founder single-point dependency for Shopify/Railway credentials and product truth | High | Stalls | PR-10/19 make every founder action an explicit checklist item |

---

## 10. Final CTO Verdict

**Would I launch today? No.** The site publicly labels itself a prototype, checkout has never been executed against the real store, quote leads are silently discarded, the deploy docs configure a dead platform's env vars, and there is no CI. **But this is weeks of activation work, not months of building.** The hard parts — configurator engine, SKU→variant resolution, checkout service chain, pricing domain, tested service architecture — exist and are good. Do not let any session tell you otherwise.

**Shortest path to launch:** Phase 0 (PR-02…06, ~2–3 days) → Phase 1 (PR-07…12, ~1 week, ends with a **real test order** — the milestone that matters) → Phase 2+3 (PR-13…32, ~2–3 weeks including founder-side Shopify content work). **Realistic: 4–6 weeks to public v1.0, with a real order in week ~2.**

**Next 5 actions (in order):**
1. Merge this PR; close the ~30 stale meta/process issues per Section 8.
2. Execute PR-02 + PR-03 (CI + green main) — same day.
3. Execute PR-04/05/06 (env truth, hygiene, admin lockdown).
4. Founder: create Storefront API token + Railway staging env (PR-10's checklist); provide a fresh Shopify product export.
5. Execute PR-07 → PR-11 and place the first test order.

**Founder personally:** (a) Shopify admin work — Storefront token, payment provider test mode, shipping/tax zones, activate launch-family draft products, product images; (b) answer the SKU-truth questions (Navigator Linear Mini stocked? `SPXILS` real?); (c) approve policy copy (PR-16); (d) set branch protection requiring CI; (e) stop approving any work not mapped to a Section 6 PR.

**Claude Code next:** PR-02, then PR-03 — nothing else until CI is green on main.

**Defer until after revenue:** customer accounts, quote PDF, any backend (webhooks/sync/email/queue), fleet workspace productization, dealer portal, live storefront catalog reads, TS-strict migration, code-splitting, package extraction (`CONFIGURATION_COMMERCE_ARCHITECTURE.md` is already explicitly launch-gated — honor that).

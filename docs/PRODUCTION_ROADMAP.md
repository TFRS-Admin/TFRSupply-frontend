# TFR Supply — Prototype → Production Roadmap

> Plan of record. Commerce launch is the main track; dealer portal foundations run
> behind a feature flag in parallel. Backend = thin Node service + Postgres on
> Railway. Shopify owns auth, checkout, payments, orders. We own catalog,
> configurator, SKU resolution, and dealer/quote data.
>
> Companion docs: the coding-agent suite (commerce launch) and the dealer/upfitter
> add-on suite (wholesale phase). This roadmap sequences both against the actual
> state of this repo as of 2026-07-08.

---

## Ground truth (from the audit)

- Architecture is already the target architecture: `pages → hooks → services →
  adapters → data`, Zod schemas, typed domain layer. **No rewrite needed.**
- Everything server-shaped is stubbed: customer auth (`src/lib/AuthContext.tsx`),
  live Shopify cart adapter (disabled in `shopifyStorefrontConfigService.ts`),
  quote submission (always fails), admin quote queue (returns `[]`).
- **Checkout is NOT proven.** The live Storefront adapter is hard-disabled pending
  a token proxy. Any claim that "checkout works" refers to the Shopify store
  itself, not this app.
- Test suite is half fiction: 158 subtests, ~67 structurally cannot run under
  `node --test` (they import React/JSX). Only pure-logic tests actually execute.
- Ghosts: `base44/` dir, `VITE_BASE44_*` args in Dockerfile, package name
  `base44-app`, three committed `.zip` files at repo root, vestigial deps
  (Stripe, three, leaflet, quill, moment+date-fns).

---

## Phase 0 — Guardrails (do first, ~1 short week)

Goal: make "stupid mistakes" structurally harder. No features.

1. **Honest test suite.**
   - Add Vitest for anything importing React/JSX/`import.meta.glob`; keep
     `node --test` (or migrate fully to Vitest) for pure-logic tests.
   - Delete or convert the 67 tests that can never run. A test that can't
     execute is a lie in the repo.
2. **CI as the source of truth.** GitHub Action on every PR:
   `npm ci && npm run lint && npm run typecheck && npm test && npm run build`.
   If CI is green, it actually built. No more trusting agent claims.
3. **Repo hygiene sweep (one PR).**
   - Remove the three root `.zip` files from git.
   - Delete `base44/` dir and stub adapters' dead formatting code paths
     (keep the stubs' interfaces — call sites still use them).
   - Strip `VITE_BASE44_*` from Dockerfile; rename package from `base44-app`.
   - Uninstall vestigial deps: Stripe, three, react-leaflet, react-quill,
     moment (keep date-fns), canvas-confetti (verify usage first).
4. **Adopt the session workflow you already own.** Every coding session (human
   or agent) uses `ai/PROMPT_TEMPLATE.md` going in and
   `ai/SESSION_HANDOFF_TEMPLATE.md` coming out: one issue → one branch → one PR,
   with acceptance criteria written before code. This is the fix for
   "no real plan we were executing."

**Exit criteria:** CI green on main; test count reflects tests that run; no
Base44 ghost references outside git history.

---

## Phase 1 — Prove one real checkout (the milestone that matters)

Goal: one SKU goes configurator → cart → **real Shopify checkout page** in a
browser, witnessed by you.

1. **Verify the Shopify store side manually** (15 min, no code): product exists,
   variant GIDs in `src/data/shopify/shopify-variant-index.json` match the live
   store, Storefront API token exists in the Shopify admin.
2. **Ship the token proxy the code is waiting for.** Thin Node/Express (or Hono)
   service on Railway with one job at first: hold `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
   server-side and forward `cartCreate` mutations. (Note: Storefront tokens are
   public-by-design, so a direct client call is an acceptable stopgap — but the
   proxy is where customer profiles and dealer APIs will live anyway, so stand
   it up now.)
3. **Flip the live adapter on** behind `VITE_SHOPIFY_*` env config; keep
   mock/unavailable adapters as fallbacks (they already exist — good design).
4. **One E2E smoke test** (Playwright, already available in this stack): load a
   PDP → select SKU → add to cart → assert redirect URL is a real
   `*.myshopify.com/checkouts/...` URL. This test is the permanent lie detector
   for "checkout works."

**Exit criteria:** you place a $0-risk test order yourself; the Playwright smoke
runs in CI (mocked) and on-demand against live.

---

## Phase 2 — Thin backend on Railway (the real foundation)

Goal: the minimum server that unblocks accounts now and dealers later.

1. **Service skeleton:** Node + Postgres (Railway). Zod-validated request/response
   at every route (schemas shared with the frontend — you already write Zod).
2. **Migrations from day one** (Drizzle or Prisma). First tables, straight from
   the doc suites: `customer_profiles` (keyed by `shopifyCustomerGid`),
   `quote_requests` (replaces the dead Base44 email path), and audit/event table.
3. **Rewire quote submission** from the always-failing Base44 stub to
   `POST /api/quotes` — first real end-to-end feature through the new backend.
   Admin quote queue reads from the same table (replaces the `[]` stub).
4. **Server-side pricing seam.** Move the tier logic from `src/lib/pricing.ts`
   (string-matching family names, client-visible) behind the API or at minimum
   into `src/domain/pricing` data-driven config. Client-side wholesale-ish
   pricing is a hard blocker for the dealer phase, so pay this down now.

**Exit criteria:** a quote submitted in the UI lands in Postgres and appears in
the admin queue.

---

## Phase 3 — Customer accounts (Shopify-owned identity)

1. Shopify Customer Accounts OAuth/PKCE spike (per
   `architecture/CUSTOMER_ACCOUNTS_AND_DATA.md`).
2. Replace the stub `AuthContext` with real session state; keep the interface so
   call sites don't churn.
3. On first login, upsert `customer_profiles` keyed by `shopifyCustomerGid`.
4. `/account`, `/account/orders` (read from Shopify), saved configurations
   (local DB). Public storefront must never require login.
5. Replace the sessionStorage demo **admin auth** with real auth (same identity
   provider, role-gated) — it currently gates `/admin/*` with client-side theater.

**Exit criteria:** log in, place order, see it in order history; admin routes
require a real credential.

---

## Phase 4 — Dealer portal scaffold (parallel track, behind a flag)

Runs alongside Phases 1–3 in small PRs. Follows the dealer suite's PR plan
(`REPO_ACTION_PLAN.md` PR1–PR2 only, for now):

1. Feature flag `dealer_portal_enabled` (default off).
2. `src/features/dealer/` with types + Zod schemas straight from
   `schemas/dealer-*.schema.json` (DealerAccount, Membership, Quote, LineItem,
   PriceRule, Branding).
3. Access service + route guard implementing the role/status matrix
   (`ACCESS_MODEL.md`): authenticated ∧ profiled ∧ member ∧ account approved ∧
   member active ∧ role permits. Unit-test the matrix — it's pure logic.
4. `/dealer` placeholder dashboard with denied/pending/suspended states.
5. Quote service against a **mock repository** (the docs explicitly bless this)
   so the UI can be built before the API exists.

**Hard rule from the dealer suite:** server calculates all totals; the client
only proposes markup/discount. Do not build dealer pricing client-side "for now."

**Exit criteria:** with the flag on and a seeded approved dealer, `/dealer`
renders; with it off, zero public surface change.

---

## Phase 5 — Dealer portal for real (post-commerce-launch)

Only after Phase 1–3 exit criteria are met. Sequence per the dealer suite:
quote persistence (Postgres, `dealer_account_id` isolation on every row) →
SKU selector integration into quote lines → server-side price rules with
precedence (SKU → family → category → dealer default → global → MSRP) →
white-label artifacts (PDF + signed, expiring share tokens; never expose
wholesale cost) → conversion paths (cart → internal request → draft order) →
admin approval console → pilot with 1–2 friendly dealers.

---

## Continuous debt paydown (one small item per week, never a "refactor sprint")

- Split `ConfiguratorModule.tsx` (1,023 lines) into banner / filtering /
  accessories / quote-payload modules — do it the next time a feature touches it.
- Collapse the 11-provider context pyramid gradually: server state → TanStack
  Query (already installed), keep Context for true UI state.
- New/edited files are `.tsx`/`.ts`; no mass-rename campaigns
  (per `TYPESCRIPT_MIGRATION_PLAN.md`).
- Delete `jsconfig.json` (duplicates `tsconfig.json`).

## Rules of engagement (the vibe-coder contract)

1. One issue → one branch → one PR → CI green → merge. No drive-by cleanup.
2. Acceptance criteria written before code (use `SPRINT_TEMPLATE.md`).
3. "It works" means: CI green **and** the Playwright smoke passed **and** you
   saw it in a browser. Agent claims without one of those are hypotheses.
4. Anything money- or price-shaped lives server-side.
5. Feature flags for anything not launch-critical; ship dark, flip later.

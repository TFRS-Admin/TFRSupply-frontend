# Shopify Cart Architecture
**TFR Supply Configurator — Sprint 10**

---

## 1. Guiding Principle: Shopify Is Source of Truth

All pricing, inventory, checkout logic, tax, and order management live in Shopify.
The TFR configurator frontend is a **presentation and configuration layer only**.
It never duplicates Shopify commerce data — it assembles a payload and hands off to Shopify checkout.

---

## 2. Layered Architecture

```
UI Component (AddToCartPanel)
        │
        │  imports ONLY
        ▼
services/shopifyCartService.js       ← single import point for all UI
        │
        │  delegates to
        ▼
adapters/shopify/shopifyCartAdapter.js   ← all Shopify surface; no UI imports this
        │
        │  (Sprint 11+) calls
        ▼
Backend Proxy Function (Deno)        ← holds Storefront API token server-side
        │
        │  HTTP POST
        ▼
Shopify Storefront API               ← cartCreate / cartLinesAdd mutations
```

**Rule:** UI → service → adapter → proxy → Shopify. Never skip a layer.

---

## 3. Cart Payload Shape

Produced by `buildCartPayload()` in `shopifyCartAdapter.js`:

```json
{
  "_meta": {
    "generatedAt": "ISO8601 timestamp",
    "sprint": "Sprint 10 — stub, no API call made",
    "adapterVersion": "0.1.0"
  },
  "primaryLine": {
    "shopify_product_id": "gid://shopify/Product/...",
    "shopify_variant_id": "gid://shopify/ProductVariant/...",
    "shopify_handle": "navigator-serial-light-bar",
    "quantity": 1,
    "sku": "NAV-SLB-53-RB",
    "customAttributes": [
      { "key": "Length", "value": "53\"" },
      { "key": "Color", "value": "Red/Blue" },
      { "key": "_configuratorId", "value": "navigator-configurator" },
      { "key": "_skuPreview", "value": "NAV-SLB-53-RB" },
      { "key": "_productId", "value": "navigator" }
    ]
  },
  "accessoryLines": [
    {
      "sku": "NAV-CABLE-10",
      "label": "10 ft. Main Harness Cable",
      "quantity": 1,
      "shopify_variant_id": null
    }
  ],
  "mappingStatus": {
    "variantResolved": false,
    "accessoriesResolved": false
  },
  "checkoutHandoff": {
    "method": "storefront_api_cart_create",
    "proxyEndpoint": "/api/shopify/cart",
    "tokenLocation": "server_env_only"
  }
}
```

---

## 4. Cart Readiness Rules

Cart is enabled only when ALL four conditions are true:

| # | Rule | Source |
|---|------|--------|
| 1 | `summary.isComplete === true` | configuratorEngine |
| 2 | No hard exclusion violations (`type === 'excludes'`) | configuratorEngine |
| 3 | `shopify.product_id` is non-null | product JSON `shopify` block |
| 4 | `shopify.cart_eligible === true` | product JSON `shopify` block |
| 5 | `shopify.variant_mappings` is non-empty | product JSON `shopify` block |
| 6 | `shopify.storefront_available === true` | product JSON `shopify` block |

Any failing rule produces a human-readable `reasons[]` array shown in the disabled panel.

---

## 5. Storefront API Token Safety

**The Shopify Storefront Access Token must NEVER appear in the browser bundle.**

Rationale:
- Storefront tokens are read-only but expose product/pricing data to scraping.
- For B2B/government pricing, exposure allows competitor discovery.
- Shopify terms require responsible token handling.

**Required pattern (Sprint 11):**

```
Browser → POST /api/shopify/cart (Base44 backend function)
              ↓
          Deno function reads Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
              ↓
          POST https://{store}.myshopify.com/api/2024-01/graphql.json
```

Environment variables needed (backend only, never `vite.config.js` / `.env` frontend exposure):
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_STORE_DOMAIN`

---

## 6. Variant Mapping Requirements

Each configurable SKU must be manually mapped in the product JSON:

```json
"shopify": {
  "product_id": "gid://shopify/Product/1234567890",
  "handle": "navigator-serial-light-bar",
  "variant_mappings": [
    { "sku": "NAV-SLB-45-BB", "shopify_variant_id": "gid://shopify/ProductVariant/..." },
    { "sku": "NAV-SLB-53-RB", "shopify_variant_id": "gid://shopify/ProductVariant/..." }
  ],
  "cart_eligible": true,
  "storefront_available": true
}
```

**Until this mapping is complete, the Add to Cart panel renders as disabled.**
This is by design — the readiness check prevents broken cart handoffs.

Accessory SKUs require the same mapping in `commerce.accessories[]` or a dedicated accessory mapping block (Sprint 12+).

---

## 7. Checkout Handoff Plan

**Phase 1 (current — Sprint 10):** Payload builder only. No API call.

**Phase 2 (Sprint 11):**
1. Create `functions/shopifyCart.js` Deno backend function.
2. Function accepts `cartPayload`, calls Shopify `cartCreate` mutation, returns `{ cartId, checkoutUrl }`.
3. `shopifyCartAdapter.addToCart()` calls `base44.functions.invoke('shopifyCart', payload)`.
4. On success: redirect user to `checkoutUrl` (Shopify hosted checkout).

**Phase 3 (Sprint 12+):**
- Line-item accessories via `cartLinesAdd`.
- Shopify customer account linking (if B2B account portal is added).
- Quantity breaks / fleet pricing via Shopify price rules.

---

## 8. Quote Flow Separation

The quote flow (`QuoteRequestPanel` → `quoteRequestService` → `quoteRequestAdapter`) is **entirely independent** of the cart flow.

- Quote requests are always available (when config is complete).
- Cart availability depends on Shopify mapping readiness.
- Both panels coexist below `ConfigurationSummary` via `ConfiguratorLayout`.
- A customer can submit a quote AND (in future) add to cart for the same configuration.

---

## 9. Files Reference

| File | Role |
|------|------|
| `services/shopifyCartService.js` | UI entry point — readiness check + payload builder |
| `adapters/shopify/shopifyCartAdapter.js` | Shopify surface — mapping validation, payload construction, future API call |
| `components/configurator/AddToCartPanel.jsx` | UI panel — disabled/ready states, payload inspector |
| `components/configurator/ConfiguratorLayout.jsx` | Renders both QuoteRequestPanel + AddToCartPanel |
| `data/products/navigator.json` | Contains `shopify` mapping block |

---

*Sprint 10 — Architecture stub. No Shopify API credentials exist. No live calls made.*

---

## 10. Pre-Shopify QA Status
**Sprint 12 — Code-Level QA Pass**  
Date: 2026-06-26

### Files Audited
| File | Hook Order | Null Safety | Import Chain | Status |
|------|-----------|------------|-------------|--------|
| `ConfigurationSummary` | ✅ All hooks before any return | ✅ `if (!session \|\| !summary) return null` before destructure | ✅ Clean | **PASS** |
| `QuoteRequestPanel` | ✅ All `useState`/`useRef` before returns | ✅ `if (!session \|\| !summary) return null` before destructure | ✅ Clean | **PASS** |
| `AddToCartPanel` | ✅ Fixed (Sprint 12) — `useMemo` guarded for null summary | ✅ Fixed — null guard in `useMemo` callback + `if (!cartPayload) return null` before destructure | ✅ Clean | **PASS (after fix)** |
| `ConfiguratorLayout` | ✅ No hooks — pure layout | ✅ Passes `productMeta`/`shopifyMap` as props; children self-guard | ✅ Clean | **PASS** |
| `ConfigurationContext` | ✅ All hooks unconditional | ✅ `if (!configuratorJson) return null` in engine init | ✅ Clean | **PASS** |
| `shopifyCartService` | n/a (pure functions) | ✅ `summary?.isComplete`, `summary?.violations ?? []` optional chains | ✅ Clean | **PASS** |
| `shopifyCartAdapter` | n/a (pure functions) | ✅ null shopifyMap returns early | ✅ Clean | **PASS** |

### Bugs Found and Fixed

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `AddToCartPanel` | `useMemo` called `summary.skuPreview` without null check — crash when summary is null before engine loads | Added `if (!summary) return null` guard inside `useMemo` callback |
| 2 | `AddToCartPanel` | `cartPayload` destructured unconditionally in ready-state render path — crash if `cartPayload` were null | Added `if (!cartPayload) return null` guard before destructure |

### Routes Verified (code-level trace)

| Route | Template/Page | Configurator | Quote Panel | Cart Panel | Coming Soon | Status |
|-------|-------------|-------------|------------|-----------|-------------|--------|
| `/` | `StoreLanding` | n/a | n/a | n/a | n/a | ✅ |
| `/police` | `VerticalLandingTemplate` | n/a | n/a | n/a | n/a | ✅ |
| `/police/light-bars` | `CategoryTemplate` | n/a | n/a | n/a | n/a | ✅ |
| `/police/light-bars/navigator` | `ProductDetailTemplate` → `ConfiguratorLayout` | ✅ Renders via `data.configuratorId` | ✅ Gated on `isComplete` | ✅ Disabled (mapping incomplete) | n/a | ✅ |
| `/police/light-bars/allegiant-max` | `ProductDetailTemplate` → `ProductComingSoon` | n/a | n/a | n/a | ✅ Stub from category JSON | ✅ |
| `/admin/quotes` | `AdminQuotesPage` | n/a | n/a | n/a | n/a | ✅ (email allowlist guard intact) |

### No Shopify API Calls Confirmed
- `addToCart()` in adapter throws intentionally if called — not reachable from UI (button is `disabled`).
- No `fetch()` calls to Shopify domains in any source file.
- No Shopify credentials defined or referenced anywhere.

### Remaining Risks for Sprint 12

| Risk | Severity | Notes |
|------|----------|-------|
| `ConfigurationContext` throws if used outside `ConfigurationProvider` | Low | Intentional guard — all usages are inside `ProductDetailTemplate` which wraps `ConfigurationProvider` |
| `accessoryMappingMissing` category not surfaced in disabled-panel tag list | Low | Currently only shown in `mappingStatus.unresolved[]` (ready state) — acceptable until accessories have variant IDs |
| Admin allowlist guard is frontend-only | Low | Prototype-only — documented as UX gate, not security |
| `summary` is recomputed on every `selections` change via `useMemo` | Very Low | Pure function, no side effects — performance acceptable for ≤10 step configurators |

### Go / No-Go Recommendation

**✅ GO for Sprint 12 live Shopify integration.**

All hook-order issues are resolved. Null-safety is complete across the full configurator stack. The quote flow is independently stable. The cart panel correctly renders its disabled state with specific mapping reasons for the Navigator product. No Shopify calls are made at any point. The layered architecture (UI → service → adapter → proxy) is clean and ready to wire the backend proxy in Sprint 12.

**Sprint 12 prerequisites before enabling cart:**
1. Set `SHOPIFY_STOREFRONT_ACCESS_TOKEN` + `SHOPIFY_STORE_DOMAIN` as backend secrets.
2. Create `functions/shopifyCart.js` Deno proxy.
3. Populate `navigator.json` `shopify` block with real `product_id` and `variant_mappings[]`.
4. Wire `shopifyCartAdapter.addToCart()` → `base44.functions.invoke('shopifyCart', payload)`.
5. Enable the "Add to Cart" button (remove `disabled` + `opacity: 0.75`).
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
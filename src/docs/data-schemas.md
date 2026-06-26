# TFR Supply Configurator — Data Schema Reference

**Version:** 0.1 Prototype  
**Last Updated:** 2026-06-25  
**Architecture:** JSON-driven template system. All content lives in `/data/**/*.json` and is loaded exclusively through `lib/dataLoader.js`. Templates never import JSON directly.

---

## Architecture Overview

```
data/
  verticals/    → VerticalLandingTemplate.jsx   (route: /:verticalId)
  categories/   → CategoryTemplate.jsx          (route: /:verticalId/:categoryId)
  products/     → ProductDetailTemplate.jsx     (route: /:verticalId/:categoryId/:productId)
  vendors/      → referenced by verticals, categories, products
```

The loader (`lib/dataLoader.js`) resolves files by matching the filename stem to the ID:
- `loadVertical("police")` → `data/verticals/police.json`
- `loadCategory("light-bars")` → `data/categories/light-bars.json`
- `loadProduct("navigator")` → `data/products/navigator.json`
- `loadVendor("federal-signal")` → `data/vendors/federal-signal.json`

**Critical routing rule:** `categories_section.items[].href` in vertical JSON drives both SiteHeader Row 3 navigation and category links. A value of `"#"` marks a category as disabled (grey, non-clickable). A real path like `"/police/light-bars"` enables navigation; the slug extracted from position `[1]` of the path is the `categoryId` passed to `loadCategory()`.

---

## 1. Vertical JSON

**File pattern:** `data/verticals/{verticalId}.json`  
**Loaded by:** `VerticalLandingTemplate`, `SiteHeader` (Row 3 categories), `CategoryTemplate` (breadcrumbs)  
**Purpose:** Defines a top-level market vertical (e.g., Police, Fire/EMS, Work Truck). Controls the full landing page layout including hero, featured content, category navigation, configurator links, procurement contracts, and resource modules.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Must match the filename stem and URL segment. e.g. `"police"` |
| `label` | `string` | Human-readable name. Used in breadcrumbs and nav. e.g. `"Police"` |
| `hero` | `object` | Hero section. See Hero Object below. |
| `categories_section` | `object` | Drives SiteHeader Row 3 nav and category grid. See Categories Section below. |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `vendor` | `string` | ID of the vendor JSON file. e.g. `"federal-signal"`. Currently unused in templates (data is loaded but not rendered). |
| `featured_article` | `object` | Side-by-side article block. Omit to hide. |
| `featured_products_section` | `object` | Product card grid. Omit to hide. |
| `configurators_section` | `object` | Configurator tool links. Omit to hide. Police only currently. |
| `contracts_section` | `object` | Procurement/contract cards. Omit to hide. Police only currently. |
| `resources_section` | `object` | Resource library module. Omit to hide. |

### Hero Object

```jsonc
"hero": {
  "title": "string",          // REQUIRED — h1 text
  "subtitle": "string",       // REQUIRED — subtext paragraph
  "image": "string",          // REQUIRED — background image URL
  "imageAlt": "string",       // recommended — alt text
  "cta": {                    // optional
    "label": "string",
    "href": "string"
  }
}
```

### Categories Section Object

```jsonc
"categories_section": {
  "title": "string",          // REQUIRED — section heading
  "subtitle": "string",       // optional
  "cta": {                    // optional — "Get Help" link below the grid
    "label": "string",
    "href": "string"
  },
  "items": [                  // REQUIRED — array of category cards
    {
      "label": "string",      // REQUIRED — display name
      "icon": "string",       // REQUIRED — Lucide icon name (must exist in CategoryIconGrid's ICON_MAP)
      "href": "string",       // REQUIRED — "/" + verticalId + "/" + categoryId, or "#" to disable
      "desc": "string"        // optional — card body text
    }
  ]
}
```

> **SiteHeader coupling:** Row 3 is populated exclusively from `categories_section.items`. The slug is extracted from `href` at path index `[1]`. Items with `href: "#"` render grey and non-clickable.

### Example Object (abbreviated)

```json
{
  "id": "police",
  "label": "Police",
  "vendor": "federal-signal",
  "hero": {
    "title": "Police Vehicle Safety Devices",
    "subtitle": "Every moment of every day...",
    "image": "https://...",
    "imageAlt": "Police vehicle",
    "cta": { "label": "Learn More", "href": "#" }
  },
  "categories_section": {
    "title": "Risk-Reducing Police Vehicle Equipment",
    "items": [
      { "label": "Light Bars", "icon": "Layers", "href": "/police/light-bars", "desc": "..." },
      { "label": "Sirens & Speakers", "icon": "Volume2", "href": "#", "desc": "..." }
    ]
  }
}
```

### Known Current Gaps

| Gap | Affected Files | Risk |
|-----|---------------|------|
| `vendor` field is declared but never consumed by any template | All 3 verticals | Low — placeholder only |
| `featured_products_section.items[].tagline` present in fire/work-truck but absent in police and not rendered in template | fire.json, work-truck.json | Low — silently ignored |
| `configurators_section` only exists in police.json | fire.json, work-truck.json | Medium — feature parity gap |
| `contracts_section` only exists in police.json | fire.json, work-truck.json | Medium — feature parity gap |
| No `meta` block (SEO: page title, description, og:image) | All 3 verticals | Medium — needed before production |

---

## 2. Category JSON

**File pattern:** `data/categories/{categoryId}.json`  
**Loaded by:** `CategoryTemplate`  
**Purpose:** Defines a product category page within a vertical. Controls the hero, filter sidebar, and product card grid. One category file can serve multiple verticals.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Must match the filename stem and URL segment. e.g. `"light-bars"` |
| `label` | `string` | Human-readable name. e.g. `"Light Bars"` |
| `products` | `array` | Array of product card objects. Can be empty `[]` but must exist. |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `vendor` | `string` | Vendor ID reference. |
| `verticals` | `array<string>` | Which verticals this category belongs to. Informational — not used for routing. |
| `hero` | `object` | Category hero block (title, subtitle, image, imageAlt). Omit to skip hero. |
| `description` | `string` | Body text rendered below the hero. |
| `filters` | `array` | Filter sidebar definitions. See Filters below. |
| `breadcrumbs` | `array` | Hardcoded breadcrumb trail. **Deprecated** — CategoryTemplate now builds breadcrumbs dynamically from URL params. |

### Filters Array

```jsonc
"filters": [
  {
    "id": "string",          // REQUIRED — used as the filter key in state
    "label": "string",       // REQUIRED — display label for the filter group
    "options": ["string"]    // REQUIRED — array of filter option values
  }
]
```

### Products Array (card items)

```jsonc
"products": [
  {
    "id": "string",          // REQUIRED — must match a product JSON filename stem
    "label": "string",       // REQUIRED — display name on card
    "tagline": "string",     // optional — short descriptor
    "image": "string",       // optional — card image URL
    "href": "string",        // REQUIRED — full path: "/verticalId/categoryId/productId"
    "badges": ["string"],    // optional — rendered as tag chips (e.g. ["Full-Size","Police"])
    "specs": ["string"]      // optional — short spec bullets on card
  }
]
```

### Example Object

```json
{
  "id": "light-bars",
  "label": "Light Bars",
  "verticals": ["police", "fire", "work-truck"],
  "vendor": "federal-signal",
  "hero": {
    "title": "LED Light Bars",
    "subtitle": "High-performance light bars...",
    "image": "https://...",
    "imageAlt": "Navigator LED Light Bar"
  },
  "description": "Federal Signal light bars are built for the most demanding conditions.",
  "filters": [
    { "id": "vehicle_type", "label": "Vehicle Type", "options": ["Police", "Fire/EMS", "Work Truck"] }
  ],
  "products": [
    {
      "id": "navigator",
      "label": "Navigator® Serial Light Bar",
      "tagline": "High-profile full-size LED light bar.",
      "image": "https://...",
      "href": "/police/light-bars/navigator",
      "badges": ["Full-Size", "Police", "Fire/EMS"],
      "specs": ["45\", 53\", 60\" lengths", "12 Vdc", "5-year warranty"]
    }
  ]
}
```

### Known Current Gaps

| Gap | Affected Files | Risk |
|-----|---------------|------|
| `breadcrumbs` field is hardcoded in JSON but CategoryTemplate now builds them dynamically from URL — the JSON field is dead weight | light-bars.json | Low — safe to remove from JSON, no template breakage |
| `products[].href` hardcodes the vertical (`/police/...`) — if the same category is viewed under `/fire/light-bars`, the card links back to `/police/...` | light-bars.json | High — cross-vertical hrefs will navigate to wrong vertical |
| Filters are stored in JSON but `CategoryTemplate` filter state has no wiring to actually narrow `products` by filter values | light-bars.json | Medium — filter UI exists but has no effect |
| No `meta` block for SEO | light-bars.json | Medium |
| Only one category JSON file exists — all other categories in all three verticals link to `href: "#"` | All verticals | High — most of Row 3 nav is dead |

---

## 3. Product JSON

**File pattern:** `data/products/{productId}.json`  
**Loaded by:** `ProductDetailTemplate`  
**Purpose:** Defines a single purchasable product. Controls the full product detail page: gallery, feature bullets, specification table, SKU table, documentation links, and CTA buttons. One product file is shared across all verticals that carry it.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Must match the filename stem and URL segment. e.g. `"navigator"` |
| `title` | `string` | Product display name. Rendered as `h1`. |
| `media` | `object` | Image and video assets. Must contain at minimum `hero` or a non-empty `gallery`. |
| `marketing` | `object` | Must contain `features` array (can be empty). |
| `commerce` | `object` | Must contain `sku_table` array (can be empty). |
| `cta` | `object` | At least one CTA URL should be set, otherwise all buttons are hidden. |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `slug` | `string` | URL-safe identifier. Currently redundant with `id`. |
| `vendor` | `string` | Vendor ID. |
| `category` | `string` | Category ID this product belongs to. Used by SiteHeader to highlight the correct Row 3 tab. |
| `verticals` | `array<string>` | Which verticals carry this product. Informational. |
| `product_family` | `string` | Product family/series name. |
| `subtitle` | `string` | Short descriptor paragraph rendered below the title. |
| `description` | `string` | Longer body description. Currently unused by template. |
| `breadcrumbs` | `array` | Override breadcrumb trail. Falls back to `[Home, title]` if absent. |
| `specifications` | `object` | Key/value spec pairs rendered in the generic spec table. |
| `documentation` | `object` | Manuals, brochures, CAD files, certifications. |
| `shopify` | `object` | Shopify integration mapping. See Section 6. |

### Media Object

```jsonc
"media": {
  "hero": "string",       // REQUIRED if gallery is empty — URL of main product image
  "gallery": [            // optional — if present, overrides hero for the image gallery
    {
      "src": "string",    // REQUIRED
      "alt": "string"     // recommended
    }
  ],
  "videos": []            // optional — currently unused by template (rendered as empty)
}
```

> **Template behavior:** `ImageGallery` uses `gallery` if non-empty, otherwise falls back to `[{ src: media.hero }]`. An empty `gallery: []` with a valid `hero` URL renders a single image correctly.

### Marketing Object

```jsonc
"marketing": {
  "features": ["string"],      // REQUIRED — rendered as a bulleted `<ul>` on the product page
  "benefits": ["string"],      // optional — currently unused by template
  "applications": ["string"]   // optional — currently unused by ProductDetailTemplate generic path
}
```

### Specifications Object

Free-form key/value pairs. The generic template renders all keys as a table, replacing `_` with spaces and capitalizing. Arrays are joined with `", "`.

```jsonc
"specifications": {
  "voltage": "12 Vdc",
  "lengths": ["45\"", "53\"", "60\""],
  "warranty": "5-year limited",
  "certifications": ["SAE J595", "SAE J845"]
}
```

### CTA Object

```jsonc
"cta": {
  "configurator_url": "string",   // optional — renders red "Configure This Product" button
  "where_to_buy_url": "string",   // optional — renders navy "Where to Buy" button
  "request_info_url": "string",   // optional — renders outlined red "Request Information" button
  "manual_url": "string"          // optional — renders "Download Manual" text link
}
```

> All four CTA buttons are independently optional. Setting a value to `"#"` renders the button but goes nowhere — use `null` or omit the key to hide a button entirely.

### Example Object (abbreviated)

```json
{
  "id": "navigator",
  "vendor": "federal-signal",
  "category": "light-bars",
  "verticals": ["police", "fire"],
  "title": "Navigator® Serial Light Bar",
  "subtitle": "High-profile full-size LED light bar for police and fire apparatus.",
  "media": {
    "hero": "https://...",
    "gallery": [{ "src": "https://...", "alt": "Navigator front view" }],
    "videos": []
  },
  "marketing": {
    "features": ["High-profile, linear light bar", "Available in 45\", 53\", 60\" lengths"],
    "applications": ["Police Patrol", "Fire Apparatus"]
  },
  "specifications": {
    "voltage": "12 Vdc",
    "warranty": "5-year limited"
  },
  "commerce": {
    "sku_root": "NAV",
    "sku_table": [
      { "sku": "NAV-SLB-45-BB", "length": "45\"", "color": "Blue/Blue", "features": "Standard", "voltage": "12V" }
    ]
  },
  "cta": {
    "configurator_url": "https://config.fedsig.com/lightbar/navigator-serial/web/",
    "where_to_buy_url": "https://www.fedsig.com/where-to-buy?category=175",
    "request_info_url": "#",
    "manual_url": "#"
  }
}
```

### Known Current Gaps

| Gap | Affected Files | Risk |
|-----|---------------|------|
| `marketing.benefits` and `marketing.applications` are populated but never rendered by the generic template path | navigator.json | Low — data is there for future use |
| `description` (top-level) is populated but not rendered anywhere by ProductDetailTemplate | navigator.json | Low |
| `documentation` block is populated but only NavigatorTabs renders it — the generic template has no documentation section | navigator.json | Medium — generic products lose doc links |
| `media.videos` is always an empty array — no video playback exists in any template | navigator.json | Low |
| `commerce.msrp_display`, `commerce.availability`, `commerce.price_display`, `commerce.cart_eligible`, `commerce.related_products` are all populated but not consumed by ProductDetailTemplate | navigator.json | Medium — price display and related products have no home |
| `slug` duplicates `id` with no distinct usage | navigator.json | Low — remove or repurpose |
| `cta.request_info_url` and `cta.manual_url` are both `"#"` — buttons render but do nothing | navigator.json | Medium — confusing to end users |
| ProductDetailTemplate has a hardcoded `productId === 'navigator'` check to switch to `NavigatorTabs` — this logic will not scale | ProductDetailTemplate | High — architectural risk as product count grows |

---

## 4. Vendor JSON

**File pattern:** `data/vendors/{vendorId}.json`  
**Loaded by:** `lib/dataLoader.js` (`loadVendor`) — **currently not called by any template**  
**Purpose:** Stores vendor identity and Shopify storefront credentials. Referenced by ID in vertical, category, and product JSON files. Currently a stub — no template reads vendor data at render time.

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Must match the filename stem. e.g. `"federal-signal"` |
| `name` | `string` | Display name. e.g. `"Federal Signal"` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `website` | `string` | Vendor homepage URL. |
| `logo` | `string` | Logo image URL. |
| `verticals` | `array<string>` | Which verticals this vendor supplies. |
| `shopify` | `object` | Shopify connection config. See Section 6. |

### Example Object

```json
{
  "id": "federal-signal",
  "name": "Federal Signal",
  "website": "https://www.fedsig.com",
  "logo": "https://www.fedsig.com/wp-content/themes/federal-signal/assets/images/logo.svg",
  "verticals": ["police", "fire", "work-truck"],
  "shopify": {
    "storeDomain": null,
    "storefrontAccessToken": null,
    "connected": false
  }
}
```

### Known Current Gaps

| Gap | Affected Files | Risk |
|-----|---------------|------|
| `loadVendor()` is exported from dataLoader but no template calls it | All vendors | Medium — vendor data is inert, can't be used without integration work |
| `logo` URL points to an external CDN with no fallback | federal-signal.json | Low |
| `shopify.storeDomain` and `shopify.storefrontAccessToken` are `null` — Shopify is not connected | federal-signal.json | High — all commerce features are stubbed |
| No `contact`, `support_phone`, or `rep_lookup_url` fields | federal-signal.json | Low — future need |

---

## 5. SKU Table Rows

**Location:** `product.commerce.sku_table[]`  
**Rendered by:** `ProductDetailTemplate` (generic path) — displayed as a full-width sortable-looking table with a dark `#1a2744` header row and alternating row shading.

### Column Structure

The SKU table is **schema-free**: the template reads `Object.keys(sku_table[0])` to derive column headers dynamically. Column order is determined by key insertion order in the JSON object.

> **Warning:** Column headers are derived from the first row only. All rows must have identical keys in the same order. Missing keys on subsequent rows will render as `undefined`.

### Current Navigator SKU Table Schema

| Key | Type | Notes |
|-----|------|-------|
| `sku` | `string` | **REQUIRED** — rendered in monospace font (first column assumed to be SKU) |
| `length` | `string` | Physical length, e.g. `"45\""` |
| `color` | `string` | Color configuration, e.g. `"Red/Blue"` |
| `features` | `string` | Feature tier, e.g. `"Standard"`, `"Full Feature"` |
| `voltage` | `string` | Operating voltage, e.g. `"12V"` |

### Example Row

```json
{ "sku": "NAV-SLB-53-RB", "length": "53\"", "color": "Red/Blue", "features": "Takedowns + Alleys", "voltage": "12V" }
```

### Known Current Gaps

| Gap | Risk |
|-----|------|
| No `price` column — all pricing is `"contact"` | Medium — no self-serve pricing visible |
| No `availability` or `in_stock` column per SKU | Medium — buyer can't see stock status |
| No `shopify_variant_id` column — SKU rows cannot be mapped to Shopify variants for cart add | High — required for any future cart integration |
| Template always renders column 0 in monospace regardless of key name — assumes SKU is first | Low — fragile implicit contract |
| No defined sort order — rows display in JSON file order only | Low |

---

## 6. Shopify Mapping Fields

**Locations:**  
- `data/vendors/{vendorId}.json` → `shopify` (storefront connection)  
- `data/products/{productId}.json` → `shopify` (product-level mapping)

**Purpose:** Defines the connection between a product JSON and its corresponding Shopify storefront product/variant records. Currently entirely stubbed (`null` / `false`) — no Shopify SDK is installed and no storefront calls are made.

### Vendor-Level Shopify Object

```jsonc
"shopify": {
  "storeDomain": null,              // string — e.g. "tfrsupply.myshopify.com"
  "storefrontAccessToken": null,    // string — public Storefront API token
  "connected": false                // boolean — flag for template conditional logic
}
```

### Product-Level Shopify Object

```jsonc
"shopify": {
  "product_id": null,               // string|null — Shopify numeric product GID
  "handle": "string",               // REQUIRED when connected — matches Shopify product URL slug
  "variant_mappings": [],           // array — maps SKU table rows to Shopify variant IDs (see below)
  "cart_eligible": false,           // boolean — whether "Add to Cart" is available
  "storefront_available": false     // boolean — whether this product is live on the storefront
}
```

### Variant Mapping Object (future schema)

When `variant_mappings` is populated, each entry links a local SKU to a Shopify variant:

```jsonc
{
  "sku": "NAV-SLB-45-BB",          // local SKU from sku_table
  "shopify_variant_id": "string",  // Shopify variant GID, e.g. "gid://shopify/ProductVariant/12345"
  "shopify_product_id": "string"   // optional — parent product GID
}
```

### How Templates Would Consume These Fields

1. `cart_eligible === true` → enable "Add to Cart" button in `CTAPanel`
2. `storefront_available === true` → show live pricing from Storefront API
3. `handle` → construct canonical Shopify PDP URL for "View on Store" links
4. `variant_mappings` → when a user selects options in the configurator, look up the matching `shopify_variant_id` to add to cart

### Known Current Gaps

| Gap | Risk |
|-----|------|
| `storeDomain` is `null` — no storefront connection possible | High — all commerce is blocked |
| `storefrontAccessToken` is `null` — even with a domain, no API calls can be made | High |
| `product_id` is `null` on Navigator — handle exists but product is not mapped | High |
| `variant_mappings` is empty array on all products — no SKU → Shopify variant linking exists | High |
| `commerce.cart_eligible` appears in both `commerce` and `shopify` blocks — duplicated flag | Medium — source of truth is ambiguous; use `shopify.cart_eligible` only |
| No Shopify SDK installed (`@shopify/storefront-api-client` or similar) | High — required before any storefront calls |
| `storefrontAccessToken` in client-side JSON is a security concern — should move to a backend function or environment variable before production | Critical — do not populate until backend proxy is in place |

---

## Summary: Schema Risk Register

| # | Risk | Severity | Location |
|---|------|----------|----------|
| 1 | ~~`storefrontAccessToken` in client-side JSON~~ — **FIXED (Gate 5):** field removed from vendor JSON; `_note` added directing to backend proxy pattern | ~~Critical~~ ✅ | vendors/federal-signal.json |
| 2 | ~~`ProductDetailTemplate` hardcodes `productId === 'navigator'`~~ — **FIXED (Gate 5):** replaced with `TABS_REGISTRY` keyed by `product.tabs_component` JSON field | ~~High~~ ✅ | ProductDetailTemplate |
| 3 | `category.products[].href` hardcodes vertical in path — cross-vertical links go to wrong vertical | **High** | categories/light-bars.json |
| 4 | 19 of 20 category items across 3 verticals have `href: "#"` — Row 3 nav is mostly dead | **High** | All vertical JSON files |
| 5 | No `shopify_variant_id` in SKU rows — cart integration requires this | **High** | products/navigator.json |
| 6 | Filter sidebar in CategoryTemplate has no wiring to actually filter `products` | **Medium** | CategoryTemplate + categories/light-bars.json |
| 7 | `description`, `marketing.benefits`, `marketing.applications`, `documentation` block not consumed by generic template | **Medium** | products/navigator.json |
| 8 | `commerce.cart_eligible` duplicated in `shopify` block | **Medium** | products/navigator.json |
| 9 | No `meta` block across any data files — SEO is unaddressed | **Medium** | All data files |
| 10 | `breadcrumbs` in category JSON is dead — template builds them from URL | **Low** | categories/light-bars.json |

---

## Recommended Next Task

**Wire category filter state to actually filter `products` in `CategoryTemplate`.**

The filter UI, filter JSON, and product data are all present. The gap is that `CategoryTemplate` holds filter state but the template renders all products regardless of selection. Connecting the two requires:
1. Read active filter state from `CategoryTemplate`
2. Filter `category.products` by matching badge values against selected filter options
3. Show "No results" empty state when filters eliminate all products

This is purely a frontend wiring task, requires no new JSON files, no new routes, and no Shopify work — and it makes the one live category page (`/police/light-bars`) fully interactive.
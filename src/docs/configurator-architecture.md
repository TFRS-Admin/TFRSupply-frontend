# Configurator Architecture

_Last updated: Sprint 14_

---

## Overview

The configurator is a **JSON-driven, framework-independent** engine that filters existing SKU rows and generates a preliminary configured product string. It does **not** generate new SKUs — it narrows selection from existing Shopify catalog variants.

---

## Folder Structure

```
src/
  domain/
    configuration/
      models.js               ← Pure data model constructors (no React/Base44/Shopify)
      configuratorEngine.js   ← Pure computation functions
  data/
    configurators/
      navigator-configurator.json   ← Prototype configuration data
  context/
    ConfigurationContext.jsx  ← React state wrapper over engine
  components/
    configurator/
      ConfigurationSummary.jsx ← UI display component
```

---

## Models

### ConfigurationSession
Top-level container created from a configurator JSON file.

```js
{
  id: string,
  productId: string,
  label: string,
  skuRoot: string,
  steps: ConfigurationStep[],
  dependencyRules: DependencyRule[],
  compatibilityRules: CompatibilityRule[],
  skuOptions: SkuOption[],         // existing catalog SKUs — source of truth
  priceDisplay: string,
  shopifyMapping: object | null,   // reserved
}
```

### ConfigurationStep
A single user-facing configuration question.

```js
{
  id: string,
  label: string,
  required: boolean,
  multiple: boolean,           // allows multi-select
  skuSegmentKey: string,       // token name used in skuTemplate
  options: ConfigurationOption[],
}
```

### ConfigurationOption
A single selectable choice within a step.

```js
{
  id: string,
  label: string,
  skuSegment: string,          // attribute value used for SKU filtering (e.g. "RB", "45")
  priceModifier: number,       // additive price delta (prototype)
  description: string | null,
  image: string | null,
  tags: string[],
  _prototype: boolean,         // true = not production-accurate
}
```

### SkuOption
An existing SKU from the product catalog. User selections are filtered against these.

```js
{
  sku: string,                              // e.g. "NAV-SLB-53-RB"
  label: string,                            // human-readable description
  attributes: { [skuSegmentKey]: string },  // e.g. { length: "53", color: "RB" }
}
```

### SelectionState
A plain object mapping `stepId → optionId (string | string[])`.

```js
{ "vehicle": "patrol-sedan", "color": "blue-blue", "accessories": ["cable-10"] }
```

### DependencyRule
"If the user selects X in step A, then step B becomes required (and optionally defaults to Y)."

```js
{
  id: string,
  type: "requires" | "forces",
  ifStep: string,
  ifOption: string,
  thenStep: string,
  thenOption: string | null,
  message: string | null,
}
```

### CompatibilityRule
"Option A in step X cannot coexist with option B in step Y."

```js
{
  id: string,
  type: "excludes" | "warns",   // excludes = hard block, warns = soft advisory
  stepA: string,
  optionA: string,
  stepB: string,
  optionB: string,
  message: string,
}
```

---

## SKU Resolution Approach

User selections **filter** the existing `skuOptions` list — the engine never constructs a SKU string.

### How It Works

```
skuOptions (from configurator JSON):
  NAV-SLB-45-BB  { length: "45", color: "BB" }
  NAV-SLB-45-RB  { length: "45", color: "RB" }
  NAV-SLB-53-RB  { length: "53", color: "RB" }
  ...

User selects: length = 53in (skuSegment "53"), color = red-blue (skuSegment "RB")

Active filters: { length: "53", color: "RB" }

Matches: [ NAV-SLB-53-RB ]  → selectedSku = "NAV-SLB-53-RB"
```

### Engine Output (from `resolveSkuMatch`)

| Field | Value |
|---|---|
| `matchingSkus` | All SKUs fitting current selections |
| `selectedSku` | Exact match when `matchingSkus.length === 1`, else `null` |
| `skuStatus` | `'none'` \| `'multiple'` \| `'matched'` |

### UI Behaviour

| `skuStatus` | Display |
|---|---|
| `'matched'` | "Matching SKU: NAV-SLB-53-RB" (green) |
| `'multiple'` | "N SKUs match — complete remaining steps to resolve" (amber) |
| `'none'` | "No matching SKU found for this combination" (red) |

### Shopify Cart Mapping
`selectedSku` is used as the lookup key into `shopify.variant_mappings[].sku` in the product JSON.
Exact string match → `shopify_variant_id`. No generation or interpolation occurs.

---

## Shopify Mapping

Reserved field in configurator JSON (not yet wired):

```json
"shopifyMapping": {
  "storeHandle": "tfrsupply",
  "variantMap": []
}
```

---

## Prototype-Only vs Future Production Logic

| Feature | Prototype | Production |
|---|---|---|
| SKU resolution | Filter `skuOptions[]` by `skuSegment` attributes | Same — `skuOptions[]` populated from live Shopify catalog |
| Pricing | Static placeholder string | Live Shopify pricing API |
| Compatibility rules | JSON-defined, client-evaluated | Potentially server-validated |
| Dependency rules | JSON-defined, client-evaluated | May pull from product configurator service |
| Cart/Quote | Quote active; Cart disabled pending Shopify mapping | Shopify Add to Cart via backend proxy |
| Option images | null | Real product option photography |

---

## Engine Design Principles

1. **Pure functions** — `(session, selections) => result`. No side effects.
2. **Framework-independent** — can be tested with plain Node.js.
3. **Additive** — new rule types extend the existing evaluators, no rewrites.
4. **Context-isolated** — React state lives in `ConfigurationContext`, not the engine.
5. **Shopify-deferred** — all commerce mapping is reserved but not called.
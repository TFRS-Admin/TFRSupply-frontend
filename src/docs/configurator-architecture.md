# Configurator Architecture

_Last updated: Sprint 2_

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
  skuTemplate: string | null,
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
  skuSegment: string,          // token value used in SKU generation
  priceModifier: number,       // additive price delta (prototype)
  description: string | null,
  image: string | null,
  tags: string[],
  _prototype: boolean,         // true = not production-accurate
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

## SKU Generation Approach

### Prototype
Uses a `skuTemplate` string with `{token}` placeholders keyed to each step's `skuSegmentKey`.

```
Template:  "NAV-{length}-{color}-{mounting}"
Selection: length=53in → "53", color=red-blue → "RB", mounting=perm → "PERM"
Result:    "NAV-53-RB-PERM"
Unresolved: "NAV-???-RB-PERM"
```

### Production (future)
- Remove `skuTemplate` string interpolation
- Map `SelectionState` → Shopify variant ID via `shopifyMapping.variantMap`
- Validate against live Shopify inventory API

---

## Future Shopify Mapping

Defined but **not wired** in Sprint 2. Reserved field in configurator JSON:

```json
"shopifyMapping": {
  "storeHandle": "my-shopify-store",
  "variantMap": [
    { "selections": { "length": "53in", "color": "red-blue" }, "shopifyVariantId": "123456789" }
  ]
}
```

The engine will expose `resolveShopifyVariant(session, selections)` in a future sprint to query this map and hydrate cart/quote state.

---

## Prototype-Only vs Future Production Logic

| Feature | Prototype | Production |
|---|---|---|
| SKU generation | String template interpolation | Shopify variant ID lookup |
| Pricing | Static placeholder string | Live Shopify pricing API |
| Compatibility rules | JSON-defined, client-evaluated | Potentially server-validated |
| Dependency rules | JSON-defined, client-evaluated | May pull from product configurator service |
| Cart/Quote | Not wired | Shopify Add to Cart / Quote Request flow |
| Option images | null | Real product option photography |

---

## Engine Design Principles

1. **Pure functions** — `(session, selections) => result`. No side effects.
2. **Framework-independent** — can be tested with plain Node.js.
3. **Additive** — new rule types extend the existing evaluators, no rewrites.
4. **Context-isolated** — React state lives in `ConfigurationContext`, not the engine.
5. **Shopify-deferred** — all commerce mapping is reserved but not called.
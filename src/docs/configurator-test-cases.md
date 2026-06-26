# Configurator Test Cases

_Sprint 3 — Prototype only. No Shopify or backend dependencies._

---

## How to Run Tests

In the browser console while on any page:

```js
import { runEngineTests } from '/src/domain/configuration/engineTests.js';
runEngineTests();
```

Or in the Admin Debug page (future integration point).

---

## Test Fixture

All engine tests use a self-contained fixture JSON (defined inside `engineTests.js`) with:
- 4 steps: `size` (required), `color` (required), `mounting` (optional), `accessories` (optional, multi-select)
- 1 dependency rule: `size=large` requires `mounting`
- 2 compatibility rules: `size=large + mounting=magnetic` = hard exclude; `color=amber + size=small` = soft warn
- SKU template: `TST-{size}-{color}`

---

## Test Cases

### TC-1: Happy Path

**Goal:** All required steps filled, no conflicts.

**Input:**
```js
selections = { size: 'small', color: 'red' }
```

**Expected:**
- `isComplete` → `true`
- `completion` → `100`
- `violations` → `[]`
- `pendingSteps` → `[]`
- `skuPreview` → `"TST-SM-R"`
- No dependency notices shown

---

### TC-2: Incomplete Path

**Goal:** Required steps remain empty. isComplete must be false.

**Input:**
```js
selections = { size: 'small' }  // color missing
```

**Expected:**
- `isComplete` → `false`
- `completion` → `50`
- `pendingSteps` → `[{ id: 'color', label: 'Color' }]`
- UI shows: "Required steps remaining: Color"
- `skuPreview` → `"TST-SM-???"` (partial, never crashes)

---

### TC-3: Dependency Path

**Goal:** Selecting `size=large` makes `mounting` required. Completion % adjusts. Message names the trigger option.

**Input:**
```js
selections = { size: 'large' }
```

**Expected:**
- `depRequirements.length` → `1`
- `depRequirements[0].triggerLabel` → `"Large"`
- `depRequirements[0].targetStepLabel` → `"Mounting"`
- `depRequirements[0].message` → `"Large size requires a mounting selection."`
- UI shows: `Required by your "Large" selection`
- `completion` → `33` (1 of 3 required: size✓, color✗, mounting✗)
- After filling `color` + `mounting`: `completion` → `100`, `isComplete` → `true`

---

### TC-4: Exclusion Path

**Goal:** `size=large + mounting=magnetic` triggers a hard exclusion. isComplete must be false even if other steps are filled.

**Input:**
```js
selections = { size: 'large', color: 'red', mounting: 'magnetic' }
```

**Expected:**
- `violations.filter(v => v.type === 'excludes').length` → `1`
- `violations[0].optionALabel` → `"Large"`
- `violations[0].optionBLabel` → `"Magnetic"`
- `violations[0].message` → `"Magnetic mount not approved for large size."`
- `isComplete` → `false` (conflict blocks ready state)
- UI shows: `Incompatible: "Large" + "Magnetic"`
- UI shows: conflict count in completion gate block

---

### TC-5: Warning Path

**Goal:** `color=amber + size=small` triggers a soft warning. isComplete is NOT blocked.

**Input:**
```js
selections = { size: 'small', color: 'amber' }
```

**Expected:**
- `violations.filter(v => v.type === 'warns').length` → `1`
- `violations.filter(v => v.type === 'excludes').length` → `0`
- `isComplete` → `true` (required steps filled, no hard exclusions)
- `warns[0].message` → `"Amber on small units is non-standard."`
- UI shows warning banner but still shows green completion state

---

### TC-6: Accessory Path

**Goal:** Multi-select accessories are toggled, listed in summary, excluded from base SKU.

**Input sequence:**
```js
sel = applySelection(session, {}, 'accessories', 'cable-10')
sel = applySelection(session, sel, 'accessories', 'alley')
sel = applySelection(session, sel, 'accessories', 'cable-10')  // toggle off
```

**Expected after sequence:**
- `sel.accessories` → `['alley']`
- `getSelectedAccessories` → `[{ optionLabel: 'Alley Light Kit', priceModifier: 95 }]`

**Full accessory selection + base SKU:**
```js
selections = { size: 'small', color: 'red', accessories: ['cable-10', 'alley'] }
```

**Expected:**
- `skuPreview` → `"TST-SM-R"` (accessories never appear in base SKU)
- `accessories.length` → `2`
- `isComplete` → `true`
- UI summary shows accessories section with "10ft Cable · Alley Light Kit"
- SKU Preview panel shows accessory names below the base SKU string

---

## Negative / Edge Cases

### EC-1: Unknown stepId in applySelection
```js
applySelection(session, {}, 'nonexistent-step', 'foo')
// Expected: returns original selections unchanged
```

### EC-2: generateSkuPreview with all-empty selections
```js
generateSkuPreview(session, {})
// Expected: "TST-???-???" — never throws
```

### EC-3: Dependency rule with no active trigger
```js
getActiveDependencies(session, { size: 'small' })
// Expected: [] — dep only fires on size=large
```

### EC-4: Compatibility violation check — only one side selected
```js
getCompatibilityViolations(session, { size: 'large' })
// Expected: [] — mounting not yet selected, no violation
```

### EC-5: isStepComplete on multi-select with empty array
```js
isStepComplete({ accessories: [] }, { id: 'accessories', multiple: true })
// Expected: false
```

---

## Navigator-Specific Scenarios (navigator-configurator.json)

These mirror the test fixture paths but use real product data:

| Scenario | Steps | Expected |
|---|---|---|
| Full police sedan build | vehicle=patrol-sedan, length=45in, color=blue-blue, mounting=perm | `isComplete=true`, SKU=`NAV-45-BB-PERM` |
| Fire apparatus + magnetic | vehicle=fire-apparatus, mounting=magnetic | Hard exclusion fires, `isComplete=false` |
| Fire apparatus + 60in | vehicle=fire-apparatus, length=60in | Dependency notice: "Fire apparatus builds typically require the 60\" bar." |
| Magnetic mount only | mounting=magnetic | Dependency notice: controller step now required |
| Amber on patrol sedan | color=amber, vehicle=patrol-sedan | Soft warning fires, does NOT block `isComplete` |
| Two accessories selected | accessories=[cable-10, alley-kit] | Both appear in summary, SKU unchanged |
| Incomplete (no color) | vehicle=patrol-sedan, length=45in, mounting=perm | `isComplete=false`, `pendingSteps=[color]` |

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Renders on /police/light-bars/navigator | ✅ |
| Required selections update completion % | ✅ — includes dependency-added steps |
| Multi-select accessories work | ✅ — toggle on/off, listed in summary, not in SKU |
| Dependency messages name the trigger option | ✅ — "Required by your 'X' selection" |
| Hard exclusions prevent ready state | ✅ — isComplete checks hardViolations.length |
| Soft warnings do NOT prevent ready state | ✅ — warns-only → isComplete can be true |
| SKU preview never crashes if fields missing | ✅ — outputs "???" for unresolved tokens |
| No Shopify calls | ✅ — shopifyMapping is reserved, not invoked |
| No Base44 backend calls | ✅ — all logic is pure client-side JS |
# Configurator Test Cases

_Last updated: Sprint 17 — NVG SKU Selector Alignment_

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
- 4 steps: `size` (required, confirmed), `color` (required, needs_verification), `mounting` (optional), `accessories` (optional, multi-select)
- 1 dependency rule: `size=large` requires `mounting`
- 2 compatibility rules: `size=large + mounting=magnetic` = hard exclude; `color=amber + size=small` = soft warn
- `skuOptions[]` — 5 existing catalog SKUs (source of truth, no template)

> **Sprint 17 change:** Engine now has two filter modes: **hard** (confirmed attributes, e.g. length) and **soft** (needs_verification attributes, e.g. color, spec). Soft filters only apply when the selected segment value exists on at least one SKU — preventing false elimination from uncertain attribute mappings.

---

## SKU Selector Test Cases (Real NVG SKUs)

### NVG-1: No Selections → All 11 SKUs Are Candidates

**Input:** `selections = {}`

**Expected from `resolveSkuMatch`:**
- `skuStatus` → `'multiple'`
- `matchingSkus.length` → `11` (all real NVG SKUs)
- `selectedSku` → `null`
- `unverifiedSteps` → `[]`

**UI:** No SKU match box shown. Step selectors visible.

---

### NVG-2: Length 45" → 2 SKU Candidates (Hard Filter)

**Input:** `selections = { length: '45in' }`

**Expected:**
- `skuStatus` → `'multiple'`
- `matchingSkus.length` → `2` (`NVG45Z-NFPA20`, `NVG45Z-NFPA21`)
- `selectedSku` → `null`
- Hard filter applied: `attributes.length === '45'`

**UI:** "2 SKUs match — complete remaining steps to resolve."

---

### NVG-3: Length 53" → 4 SKU Candidates

**Input:** `selections = { length: '53in' }`

**Expected:**
- `matchingSkus.length` → `4`
- Candidates: `NVG53D-MUNI1RHC`, `NVG53Z-MUNI1RHC6`, `NVG53Z-NFPA20`, `NVG53Z-NFPA21`

---

### NVG-4: Length 60" → 5 SKU Candidates

**Input:** `selections = { length: '60in' }`

**Expected:**
- `matchingSkus.length` → `5`
- Candidates: `NVG60D-NFPA20`, `NVG60D-NFPA21`, `NVG60D-NFPA22`, `NVG60D-TOW2FC`, `NVG60Z-TOW2FC6`

---

### NVG-5: Length 45" + Color Red-White → 2 Candidates (Soft Filter Narrows)

**Input:** `selections = { length: '45in', color: 'red-white' }`

**Expected:**
- `matchingSkus.length` → `2` (`NVG45Z-NFPA20`, `NVG45Z-NFPA21`)
- `skuStatus` → `'multiple'`
- `unverifiedSteps` → `[{ stepId: 'color', attrKey: 'color', attrVal: 'RW' }]`
- Soft filter applied: `RW` exists on catalog SKUs → narrows to matching

**UI:** SKU count shown, unverified attribute warning badge visible.

---

### NVG-6: Length 45" + Color Red-White + Spec NFPA20 → 1 Match

**Input:** `selections = { length: '45in', color: 'red-white', spec: 'nfpa20' }`

**Expected:**
- `skuStatus` → `'matched'`
- `selectedSku` → `'NVG45Z-NFPA20'`
- `matchingSkus.length` → `1`
- `unverifiedSteps.length` → `2` (color + spec both unverified)

**UI:** "Matching SKU: NVG45Z-NFPA20" (green) + unverified attribute notice.

---

### NVG-7: Length 45" + Color Red-White + Spec NFPA21 → 1 Match

**Input:** `selections = { length: '45in', color: 'red-white', spec: 'nfpa21' }`

**Expected:**
- `selectedSku` → `'NVG45Z-NFPA21'`
- `matchingSkus.length` → `1`

---

### NVG-8: Length 53" + Color Amber-White → 2 Candidates (Municipal only)

**Input:** `selections = { length: '53in', color: 'amber-white' }`

**Expected:**
- `matchingSkus.length` → `2` (`NVG53D-MUNI1RHC`, `NVG53Z-MUNI1RHC6`)
- `skuStatus` → `'multiple'`

---

### NVG-9: Length 53" + Color Amber-White + Spec Municipal HC → 1 Match

**Input:** `selections = { length: '53in', color: 'amber-white', spec: 'muni' }`

**Expected:**
- `selectedSku` → `'NVG53D-MUNI1RHC'`
- `skuStatus` → `'matched'`

---

### NVG-10: Length 60" + Color Tow/Utility + Spec TOW → 1 Match

**Input:** `selections = { length: '60in', color: 'tow-utility', spec: 'tow' }`

**Expected:**
- `selectedSku` → `'NVG60D-TOW2FC'`
- `skuStatus` → `'matched'`
- `unverifiedSteps.length` → `2` (color + spec)

---

### NVG-11: Color Only (No Length) — Soft Filter, No False Elimination

**Input:** `selections = { color: 'red-white' }`  ← no length (hard filter) selected

**Expected:**
- `matchingSkus.length` → `9` (all RW SKUs — 2×45", 2×53", 3×60" NFPA SKUs)
- Soft filter applied: RW exists on SKUs, so it narrows
- AW and CUSTOM SKUs excluded (2+2 = 4 excluded)

---

### NVG-12: Soft Filter Skip — Segment Value Not on Any SKU

**Goal:** A segment value that matches no `skuOption.attributes` entry is silently skipped, preserving all candidates.

**Scenario:** A hypothetical future step option with `skuSegment: 'UNKNOWN'` on an unverified step.

**Expected behavior:**
- `anySkuHasValue` → `false`
- Filter skipped entirely
- `matchingSkus.length` → same as without that filter
- No SKU falsely eliminated

**This is the core correctness guarantee of the soft-filter system.**

---

### NVG-13: Non-SKU Steps (vehicle, mounting, controller) Do Not Affect SKU Count

**Input:** `selections = { vehicle: 'fire-apparatus', mounting: 'perm', controller: 'sm4' }`

**Expected:**
- `matchingSkus.length` → `11` (all SKUs — none of these steps have `_skuFilterActive`)
- `skuStatus` → `'multiple'`

**Reason:** vehicle, mounting, controller have `_skuFilterActive: false` — they pass as `customAttributes` only.

---

### NVG-14: Accessories Do Not Affect SKU Resolution

**Input:**
```js
selections = { length: '53in', color: 'amber-white', spec: 'muni', accessories: ['cable-10', 'alley-kit'] }
```

**Expected:**
- `selectedSku` → `'NVG53D-MUNI1RHC'`
- `accessories.length` → `2`
- SKU unchanged by accessory selections

---

### NVG-15: Hard Exclusion — Fire + Magnetic

**Input:** `selections = { vehicle: 'fire-apparatus', mounting: 'magnetic' }`

**Expected:**
- `violations[0].type` → `'excludes'`
- `isComplete` → `false`
- `hardViolations.length` → `1`
- Quote form locked

---

### NVG-16: Soft Warning — Tow/Utility on Patrol Sedan

**Input:** `selections = { vehicle: 'patrol-sedan', length: '60in', color: 'tow-utility', mounting: 'perm' }`

**Expected:**
- `violations[0].type` → `'warns'`
- `isComplete` → `true` (warning does not block)
- `matchingSkus` → `[NVG60D-TOW2FC, NVG60Z-TOW2FC6]` (spec not selected yet)

---

### NVG-17: Dependency — Fire Apparatus Requires 60"

**Input:** `selections = { vehicle: 'fire-apparatus' }`

**Expected:**
- `depRequirements.length` → `1`
- `depRequirements[0].triggerLabel` → `"Fire Apparatus"`
- `depRequirements[0].targetStepLabel` → `"Bar Length"`
- `completion` < `100`

---

## Original Fixture Test Cases (Rules Engine)

These use the self-contained engineTests.js fixture (not Navigator data).

### TC-1: Happy Path

**Input:** `selections = { size: 'small', color: 'red' }`

**Expected:**
- `isComplete` → `true`
- `completion` → `100`
- `violations` → `[]`
- `pendingSteps` → `[]`
- `selectedSku` → `"TST-SM-R"`
- `skuStatus` → `'matched'`

---

### TC-2: Incomplete Path

**Input:** `selections = { size: 'small' }` — color missing

**Expected:**
- `isComplete` → `false`
- `completion` → `50`
- `pendingSteps` → `[{ id: 'color' }]`
- `selectedSku` → `null`
- `skuStatus` → `'multiple'`

---

### TC-3: Dependency Path

**Input:** `selections = { size: 'large' }`

**Expected:**
- `depRequirements.length` → `1`
- `depRequirements[0].triggerLabel` → `"Large"`
- After filling `color` + `mounting`: `completion` → `100`, `isComplete` → `true`

---

### TC-4: Exclusion Path

**Input:** `selections = { size: 'large', color: 'red', mounting: 'magnetic' }`

**Expected:**
- `violations.filter(v => v.type === 'excludes').length` → `1`
- `isComplete` → `false`

---

### TC-5: Warning Path

**Input:** `selections = { size: 'small', color: 'amber' }`

**Expected:**
- `violations.filter(v => v.type === 'warns').length` → `1`
- `isComplete` → `true` (warning does not block)
- `selectedSku` → `"TST-SM-A"`

---

### TC-6: Accessory Toggle

```js
sel = applySelection(session, {}, 'accessories', 'cable-10')
sel = applySelection(session, sel, 'accessories', 'alley')
sel = applySelection(session, sel, 'accessories', 'cable-10')  // toggle off
```

**Expected:**
- `sel.accessories` → `['alley']`

---

## Edge Cases

### EC-1: Unknown stepId → unchanged selections
### EC-2: Empty skuOptions → `{ matchingSkus: [], selectedSku: null, skuStatus: 'none' }`
### EC-3: Dependency rule not triggered → `getActiveDependencies` returns `[]`
### EC-4: Only one side of exclusion selected → no violation
### EC-5: Multi-select with empty array → `isStepComplete` returns `false`
### EC-6: Soft filter with segment not on any SKU → filter skipped, all SKUs preserved

---

## Navigator Acceptance Criteria (Sprint 17)

| Criterion | Status |
|---|---|
| No prototype NAV-SLB-* SKUs in skuOptions[] | ✅ All replaced with NVG-prefix |
| BB (Blue/Blue) option removed from color step | ✅ No catalog SKU exists |
| RB (Red/Blue) option removed from color step | ✅ No catalog SKU exists |
| Length step uses confirmed hard filter | ✅ `_verification: 'confirmed'` |
| Color/spec steps use soft filter | ✅ `_verification: 'needs_verification'` |
| Soft filter: skipped when segment not on any SKU | ✅ `anySkuHasValue` guard |
| Soft filter: narrows when segment matches catalog | ✅ Applied when value found |
| unverifiedSteps returned by engine | ✅ New field on summary |
| UI shows verification warning when unverified step active | ✅ SkuVerificationNotice |
| No false SKU elimination from uncertain attributes | ✅ Soft-filter skip logic |
| Accessories do not filter SKUs | ✅ Multiple steps skipped |
| Vehicle / mounting / controller do not filter SKUs | ✅ `_skuFilterActive: false` |
| Hard exclusion blocks isComplete | ✅ hardViolations check |
| Soft warning does not block isComplete | ✅ warns-only passes |
| No Shopify API calls | ✅ Pure client-side engine |
| cart_eligible remains false | ✅ No GIDs collected yet |

---

## Remaining Blockers

| Blocker | Severity | Sprint |
|---|---|---|
| `attributes.color` and `attributes.spec` not confirmed against real Shopify option names | 🟡 Medium | 18 |
| 11 variant GIDs still uncollected | 🔴 Cart blocker | 18 |
| 3 product GIDs still uncollected | 🔴 Cart blocker | 18 |
| All 3 Navigator products still `draft` in Shopify | 🟡 Medium | 18 |
| Accessory SKUs (`NAV-CABLE-*`) not matched to real Shopify products | 🟡 Medium | 18 |
| Cart adapter routing by length (3-product structure) not yet built | 🟡 Architecture | 18 |
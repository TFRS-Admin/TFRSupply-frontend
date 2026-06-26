/**
 * domain/configuration/configuratorEngine.js
 * Pure configuration engine. No React, no Base44, no Shopify.
 *
 * All functions are pure: (session, selections) => result.
 * The React context owns state; the engine only computes.
 *
 * Sprint 17: Soft-filter logic for unverified SKU attributes.
 * Steps with _verification:'needs_verification' narrow SKU candidates
 * when their segment matches, but never falsely eliminate SKUs when the
 * attribute value is uncertain. Confirmed attributes (e.g. length) filter hard.
 */

import { createSession, createSelectionState } from './models.js';

// ─── Session Initialization ────────────────────────────────────────────────

export function initializeEngine(configuratorJson) {
  const session = createSession(configuratorJson);
  const selections = createSelectionState();
  return { session, selections };
}

// ─── Selection Management ──────────────────────────────────────────────────

export function applySelection(session, selections, stepId, optionId) {
  const step = session.steps.find(s => s.id === stepId);
  if (!step) return selections;

  const next = { ...selections };

  if (step.multiple) {
    const current = Array.isArray(next[stepId]) ? next[stepId] : [];
    if (current.includes(optionId)) {
      next[stepId] = current.filter(id => id !== optionId);
    } else {
      next[stepId] = [...current, optionId];
    }
  } else {
    next[stepId] = optionId;
  }

  return next;
}

export function clearStep(selections, stepId) {
  const next = { ...selections };
  delete next[stepId];
  return next;
}

// ─── Step Status ───────────────────────────────────────────────────────────

export function isStepComplete(selections, step) {
  const val = selections[step.id];
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

export function getPendingRequiredSteps(session, selections) {
  const depRequiredStepIds = new Set(
    getDependencyRequiredSteps(session, selections).map(d => d.stepId)
  );

  return session.steps.filter(step => {
    const isNativelyRequired = step.required;
    const isDependencyRequired = depRequiredStepIds.has(step.id);
    return (isNativelyRequired || isDependencyRequired) && !isStepComplete(selections, step);
  });
}

export function getNextRequiredStep(session, selections) {
  return getPendingRequiredSteps(session, selections)[0] || null;
}

// ─── Completion Percentage ─────────────────────────────────────────────────

export function getCompletionPercentage(session, selections) {
  const depRequiredStepIds = new Set(
    getDependencyRequiredSteps(session, selections).map(d => d.stepId)
  );

  const required = session.steps.filter(
    s => s.required || depRequiredStepIds.has(s.id)
  );
  if (required.length === 0) return 100;

  const done = required.filter(s => isStepComplete(selections, s)).length;
  return Math.round((done / required.length) * 100);
}

// ─── Dependency Evaluation ─────────────────────────────────────────────────

export function getActiveDependencies(session, selections) {
  return session.dependencyRules.filter(rule => {
    const val = selections[rule.ifStep];
    if (Array.isArray(val)) return val.includes(rule.ifOption);
    return val === rule.ifOption;
  });
}

export function getDependencyRequiredSteps(session, selections) {
  const active = getActiveDependencies(session, selections);
  return active
    .filter(r => r.type === 'requires')
    .map(r => {
      const triggerStep = session.steps.find(s => s.id === r.ifStep);
      const triggerOption = triggerStep?.options.find(o => o.id === r.ifOption);
      const triggerLabel = triggerOption?.label || r.ifOption;
      const triggerStepLabel = triggerStep?.label || r.ifStep;

      const targetStep = session.steps.find(s => s.id === r.thenStep);
      const targetStepLabel = targetStep?.label || r.thenStep;

      return {
        stepId: r.thenStep,
        message: r.message,
        ruleId: r.id,
        triggerStepLabel,
        triggerLabel,
        targetStepLabel,
      };
    });
}

// ─── Compatibility / Exclusion Evaluation ─────────────────────────────────

export function getCompatibilityViolations(session, selections) {
  return session.compatibilityRules
    .filter(rule => {
      const valA = selections[rule.stepA];
      const valB = selections[rule.stepB];
      const matchA = Array.isArray(valA) ? valA.includes(rule.optionA) : valA === rule.optionA;
      const matchB = Array.isArray(valB) ? valB.includes(rule.optionB) : valB === rule.optionB;
      return matchA && matchB;
    })
    .map(rule => {
      const stepA = session.steps.find(s => s.id === rule.stepA);
      const stepB = session.steps.find(s => s.id === rule.stepB);
      const optionALabel = stepA?.options.find(o => o.id === rule.optionA)?.label || rule.optionA;
      const optionBLabel = stepB?.options.find(o => o.id === rule.optionB)?.label || rule.optionB;
      return {
        type: rule.type,
        message: rule.message,
        ruleId: rule.id,
        optionALabel,
        optionBLabel,
        stepALabel: stepA?.label || rule.stepA,
        stepBLabel: stepB?.label || rule.stepB,
      };
    });
}

// ─── SKU Resolution (filter-based, verification-aware) ────────────────────

/**
 * Filters skuOptions against current selections with two filter modes:
 *
 * HARD filter  — step._verification === 'confirmed'
 *   The step's skuSegment must exactly match the SKU's attribute value.
 *   A non-matching attribute eliminates the SKU.
 *
 * SOFT filter  — step._verification === 'needs_verification' (or absent)
 *   The step's skuSegment is used to narrow candidates, but only when the
 *   selected value actually appears on at least one SKU. If the selected
 *   segment matches no SKU's attribute at all, the filter is skipped entirely
 *   to prevent false elimination due to uncertain attribute mappings.
 *
 * Multi-select (accessories) steps are always skipped.
 * Steps with _skuFilterActive === false are always skipped.
 *
 * Returns:
 *   matchingSkus    — all SKUs fitting the current filtered set
 *   selectedSku     — the single matched SKU (if exactly one match), else null
 *   skuStatus       — 'none' | 'multiple' | 'matched'
 *   unverifiedSteps — steps where soft-filter was active (for UI warning display)
 */
export function resolveSkuMatch(session, selections) {
  const skuOptions = session.skuOptions;
  if (!skuOptions || skuOptions.length === 0) {
    return { matchingSkus: [], selectedSku: null, skuStatus: 'none', unverifiedSteps: [] };
  }

  const unverifiedSteps = [];

  // Build active filters from selections
  const hardFilters = {};
  const softFilters = {};

  session.steps.forEach(step => {
    if (step.multiple) return;                        // accessories never filter
    if (step._skuFilterActive === false) return;      // explicit opt-out

    const val = selections[step.id];
    if (!val) return;

    const option = step.options.find(o => o.id === val);
    if (!option || !step.skuSegmentKey) return;

    const attrKey = step.skuSegmentKey;
    const attrVal = option.skuSegment;

    if (step._verification === 'confirmed') {
      hardFilters[attrKey] = attrVal;
    } else {
      // Soft: only apply if this attribute+value exists on at least one SKU
      const anySkuHasValue = skuOptions.some(
        s => attrKey in s.attributes && s.attributes[attrKey] === attrVal
      );
      if (anySkuHasValue) {
        softFilters[attrKey] = attrVal;
        unverifiedSteps.push({ stepId: step.id, stepLabel: step.label, attrKey, attrVal });
      }
      // If no SKU has this value, skip filter entirely — avoid false elimination
    }
  });

  // Apply hard filters first, then soft filters
  const matchingSkus = skuOptions.filter(skuOption => {
    // Hard filters must all match
    for (const [attrKey, attrVal] of Object.entries(hardFilters)) {
      if (!(attrKey in skuOption.attributes)) return true; // SKU doesn't constrain this attr
      if (skuOption.attributes[attrKey] !== attrVal) return false;
    }
    // Soft filters narrow further (attribute must match if SKU declares it)
    for (const [attrKey, attrVal] of Object.entries(softFilters)) {
      if (!(attrKey in skuOption.attributes)) return true; // pass-through if undeclared
      if (skuOption.attributes[attrKey] !== attrVal) return false;
    }
    return true;
  });

  const selectedSku = matchingSkus.length === 1 ? matchingSkus[0].sku : null;
  let skuStatus = 'none';
  if (matchingSkus.length === 1) skuStatus = 'matched';
  else if (matchingSkus.length > 1) skuStatus = 'multiple';

  return { matchingSkus, selectedSku, skuStatus, unverifiedSteps };
}

// ─── Multi-Select Accessory Summary ───────────────────────────────────────

export function getSelectedAccessories(session, selections) {
  const result = [];
  session.steps.forEach(step => {
    if (!step.multiple) return;
    const val = selections[step.id];
    const ids = Array.isArray(val) ? val : [];
    ids.forEach(id => {
      const opt = step.options.find(o => o.id === id);
      if (opt) {
        result.push({
          stepId: step.id,
          stepLabel: step.label,
          optionId: opt.id,
          optionLabel: opt.label,
          priceModifier: opt.priceModifier,
        });
      }
    });
  });
  return result;
}

// ─── Summary Computation ───────────────────────────────────────────────────

export function computeSummary(session, selections) {
  const violations = getCompatibilityViolations(session, selections);
  const depRequirements = getDependencyRequiredSteps(session, selections);
  const completion = getCompletionPercentage(session, selections);
  const { matchingSkus, selectedSku, skuStatus, unverifiedSteps } = resolveSkuMatch(session, selections);
  const pendingSteps = getPendingRequiredSteps(session, selections);
  const accessories = getSelectedAccessories(session, selections);

  const hardViolations = violations.filter(v => v.type === 'excludes');
  const isComplete = pendingSteps.length === 0 && hardViolations.length === 0;

  const resolvedSelections = session.steps
    .filter(s => !s.multiple && isStepComplete(selections, s))
    .map(step => {
      const val = selections[step.id];
      const ids = Array.isArray(val) ? val : [val];
      const labels = ids.map(id => step.options.find(o => o.id === id)?.label || id);
      return { stepId: step.id, stepLabel: step.label, selected: labels };
    });

  return {
    resolvedSelections,
    accessories,
    depRequirements,
    violations,
    completion,
    selectedSku,
    matchingSkus,
    skuStatus,
    unverifiedSteps,    // NEW: steps whose attribute mapping is unverified — shown as warnings in UI
    skuPreview: selectedSku,
    pendingSteps,
    isComplete,
    priceDisplay: session.priceDisplay,
  };
}
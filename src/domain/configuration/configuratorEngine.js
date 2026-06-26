/**
 * domain/configuration/configuratorEngine.js
 * Pure configuration engine. No React, no Base44, no Shopify.
 *
 * All functions are pure: (session, selections) => result.
 * The React context owns state; the engine only computes.
 */

import { createSession, createSelectionState } from './models.js';

// ─── Session Initialization ────────────────────────────────────────────────

export function initializeEngine(configuratorJson) {
  const session = createSession(configuratorJson);
  const selections = createSelectionState();
  return { session, selections };
}

// ─── Selection Management ──────────────────────────────────────────────────

/**
 * Apply a single option selection. Returns a new selections object.
 * Clears forced/dependent downstream state when a parent changes.
 */
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

/**
 * Clear a single step's selection.
 */
export function clearStep(selections, stepId) {
  const next = { ...selections };
  delete next[stepId];
  return next;
}

// ─── Step Status ───────────────────────────────────────────────────────────

/**
 * Returns true if a step has a non-empty selection.
 */
export function isStepComplete(selections, step) {
  const val = selections[step.id];
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

/**
 * Returns the ordered list of required steps that are not yet complete.
 * Includes steps made required by active dependency rules.
 */
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

/**
 * Returns the first incomplete required step, or null if all done.
 */
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

/**
 * Returns active dependency rules given current selections.
 * A rule is active when its `ifStep`/`ifOption` condition is met.
 */
export function getActiveDependencies(session, selections) {
  return session.dependencyRules.filter(rule => {
    const val = selections[rule.ifStep];
    if (Array.isArray(val)) return val.includes(rule.ifOption);
    return val === rule.ifOption;
  });
}

/**
 * Returns steps that are currently required due to active dependency rules,
 * enriched with trigger context (which option caused it).
 */
export function getDependencyRequiredSteps(session, selections) {
  const active = getActiveDependencies(session, selections);
  return active
    .filter(r => r.type === 'requires')
    .map(r => {
      // Resolve human-readable trigger label
      const triggerStep = session.steps.find(s => s.id === r.ifStep);
      const triggerOption = triggerStep?.options.find(o => o.id === r.ifOption);
      const triggerLabel = triggerOption?.label || r.ifOption;
      const triggerStepLabel = triggerStep?.label || r.ifStep;

      // Resolve target step label
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

/**
 * Returns all active compatibility violations, enriched with option labels.
 * Each violation: { type, message, ruleId, optionALabel, optionBLabel }
 */
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

// ─── SKU Generation ────────────────────────────────────────────────────────

/**
 * Generates a preliminary SKU string from the skuTemplate and selections.
 *
 * Template tokens use the step's `skuSegmentKey` wrapped in braces: {vehicle}, {color}, etc.
 * If a token is unresolved (step not selected), it outputs "???".
 * Multi-select steps (e.g. accessories) are NOT part of the SKU template —
 * they are listed separately in the summary. If somehow included as a token,
 * the first selection's skuSegment is used.
 *
 * PROTOTYPE: This is a simplified string interpolation approach.
 * Production: will map to real Shopify variant IDs via shopifyMapping.
 */
export function generateSkuPreview(session, selections) {
  if (!session.skuTemplate) return null;

  let sku = session.skuTemplate;

  session.steps.forEach(step => {
    const key = `{${step.skuSegmentKey}}`;
    if (!sku.includes(key)) return;

    const val = selections[step.id];

    // Multi-select steps (accessories) are not part of the base SKU template —
    // skip them cleanly (leave token as ??? only if explicitly in template).
    if (step.multiple) {
      const ids = Array.isArray(val) ? val : [];
      if (ids.length === 0) {
        sku = sku.replace(key, '???');
      } else {
        const firstOption = step.options.find(o => o.id === ids[0]);
        sku = sku.replace(key, firstOption?.skuSegment || '???');
      }
      return;
    }

    if (!val) {
      sku = sku.replace(key, '???');
      return;
    }

    const option = step.options.find(o => o.id === val);
    sku = sku.replace(key, option?.skuSegment ?? '???');
  });

  return sku;
}

// ─── Multi-Select Accessory Summary ───────────────────────────────────────

/**
 * Returns a flat list of selected accessories (from all multiple=true steps).
 * Each entry: { stepId, stepLabel, optionId, optionLabel, priceModifier }
 */
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

/**
 * Compute the full summary object consumed by the React context and UI.
 */
export function computeSummary(session, selections) {
  const violations = getCompatibilityViolations(session, selections);
  const depRequirements = getDependencyRequiredSteps(session, selections);
  const completion = getCompletionPercentage(session, selections);
  const skuPreview = generateSkuPreview(session, selections);
  const pendingSteps = getPendingRequiredSteps(session, selections);
  const accessories = getSelectedAccessories(session, selections);

  const hardViolations = violations.filter(v => v.type === 'excludes');
  const isComplete = pendingSteps.length === 0 && hardViolations.length === 0;

  // Build per-step resolved selection labels for display (non-multiple steps only)
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
    skuPreview,
    pendingSteps,
    isComplete,
    priceDisplay: session.priceDisplay,
  };
}